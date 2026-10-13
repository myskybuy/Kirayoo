// Chat: conversations, messages and in-chat booking requests
// (request / accept / decline / counter / withdraw).
import type { Prisma } from '@prisma/client';
import { prisma } from './db';
import { mail } from './mail';
import { dayOf, fmtRange, todayIST, toDbDate } from './format';
import { autoDeclineOverlaps, BookingError, createHold, isRangeFree, lockItem, rangeError, type Tx } from './bookings';
import { HOLD_HOURS } from './constants';

/** Posts a SYSTEM message (status change) into a conversation and bumps it. */
export async function postSystem(db: Tx, conversationId: string | null | undefined, text: string, bookingId?: string) {
  if (!conversationId) return;
  await db.message.create({ data: { conversationId, type: 'SYSTEM', text, bookingId: bookingId ?? null } });
  await db.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
}

export async function getOrCreateConversation(itemId: string, renterId: string) {
  const item = await prisma.item.findUnique({ where: { id: itemId }, include: { owner: true } });
  if (!item || item.deletedAt) throw new BookingError('Item not found.');
  if (item.ownerId === renterId) throw new BookingError('This is your own item.');
  const existing = await prisma.conversation.findUnique({ where: { itemId_renterId: { itemId, renterId } } });
  if (existing) return existing;
  if (item.status !== 'ACTIVE' || item.owner.idStatus !== 'VERIFIED' || item.owner.isBlocked) throw new BookingError('This item is not available right now.');
  return prisma.conversation.upsert({ where: { itemId_renterId: { itemId, renterId } }, update: {}, create: { itemId, renterId, ownerId: item.ownerId } });
}

/** The conversation if `userId` takes part in it (renter or owner), else throws. */
export async function participant(conversationId: string, userId: string) {
  const c = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { item: true, renter: true, owner: true } });
  if (!c || (c.renterId !== userId && c.ownerId !== userId)) throw new BookingError('Conversation not found.');
  return { conv: c, role: c.renterId === userId ? ('RENTER' as const) : ('OWNER' as const) };
}

export async function sendText(conversationId: string, userId: string, text: string) {
  const t = text.trim();
  if (!t) throw new BookingError('Type a message.');
  if (t.length > 1000) throw new BookingError('Messages can be at most 1000 characters.');
  await participant(conversationId, userId);
  const m = await prisma.message.create({ data: { conversationId, senderId: userId, type: 'TEXT', text: t } });
  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
  return m;
}

/** Renter sends dates. Any earlier pending request in this chat is withdrawn. */
export async function sendRequest(conversationId: string, renterId: string, start: string, end: string) {
  const { conv, role } = await participant(conversationId, renterId);
  if (role !== 'RENTER') throw new BookingError('Only the renter can send a booking request.');
  const item = conv.item;
  if (item.status !== 'ACTIVE' || item.deletedAt) throw new BookingError('This item is not available right now.');
  const err = rangeError(item, start, end);
  if (err) throw new BookingError(err);
  if (!(await isRangeFree(prisma, item.id, start, end))) throw new BookingError('Some of those dates are already booked. Pick other dates.');
  const msg = await prisma.$transaction(async (tx) => {
    await tx.message.updateMany({ where: { conversationId, type: 'BOOKING_REQUEST', requestStatus: 'PENDING' }, data: { requestStatus: 'WITHDRAWN' } });
    const m = await tx.message.create({ data: { conversationId, senderId: renterId, type: 'BOOKING_REQUEST', startDate: toDbDate(start), endDate: toDbDate(end), requestStatus: 'PENDING', text: '' } });
    await tx.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
    return m;
  });
  await mail.newRequest(conv.owner.email, item.title, fmtRange(start, end), conversationId);
  return msg;
}

export type RequestAction = 'ACCEPT' | 'DECLINE' | 'COUNTER' | 'WITHDRAW';

/**
 * Answers a booking request card.
 *  - ACCEPT (by the other side) → held booking (12 h) + overlapping requests auto-declined
 *  - DECLINE (by the other side)
 *  - COUNTER (owner, on the renter's request) → new card with suggested dates
 *  - WITHDRAW (renter: own request, or the owner's counter)
 */
export async function answerRequest(messageId: string, userId: string, action: RequestAction, counter?: { start: string; end: string }) {
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (!msg || msg.type !== 'BOOKING_REQUEST') throw new BookingError('Request not found.');
  const { conv, role } = await participant(msg.conversationId, userId);
  if (msg.requestStatus !== 'PENDING') throw new BookingError('This request was already answered.');
  const mine = msg.senderId === userId;
  const start = dayOf(msg.startDate!);
  const end = dayOf(msg.endDate!);

  if (action === 'WITHDRAW') {
    if (role !== 'RENTER') throw new BookingError('Only the renter can withdraw.');
    await setStatus(msg.id, 'WITHDRAWN');
    if (!mine) await postSystem(prisma, conv.id, 'Renter didn’t take the suggested dates.');
    return { ok: true };
  }
  if (mine) throw new BookingError('Waiting for the other side to answer.');

  if (action === 'DECLINE') {
    await setStatus(msg.id, 'DECLINED');
    if (role === 'OWNER') await mail.requestDeclined(conv.renter.email, conv.item.title, conv.id);
    return { ok: true };
  }

  if (action === 'COUNTER') {
    if (role !== 'OWNER') throw new BookingError('Only the owner can suggest other dates.');
    if (!counter) throw new BookingError('Pick the dates you suggest.');
    const err = rangeError(conv.item, counter.start, counter.end);
    if (err) throw new BookingError(err);
    if (!(await isRangeFree(prisma, conv.itemId, counter.start, counter.end))) throw new BookingError('Some of those dates are booked or blocked.');
    await prisma.$transaction(async (tx) => {
      const r = await tx.message.updateMany({ where: { id: msg.id, requestStatus: 'PENDING' }, data: { requestStatus: 'COUNTERED' } });
      if (r.count !== 1) throw new BookingError('This request was already answered.');
      await tx.message.create({ data: { conversationId: conv.id, senderId: userId, type: 'BOOKING_REQUEST', startDate: toDbDate(counter.start), endDate: toDbDate(counter.end), requestStatus: 'PENDING', text: '' } });
      await tx.conversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });
    });
    await mail.requestCountered(conv.renter.email, conv.item.title, fmtRange(counter.start, counter.end), conv.id);
    return { ok: true };
  }

  // ACCEPT → held booking. Owner accepts the renter's request, or the renter accepts the owner's counter.
  try {
    const booking = await prisma.$transaction(async (tx) => {
      await lockItem(tx, conv.itemId);
      const item = await tx.item.findUnique({ where: { id: conv.itemId } });
      if (!item || item.status !== 'ACTIVE' || item.deletedAt) throw new BookingError('This item is not available any more.');
      if (start < todayIST()) throw new BookingError('These dates have already started. Send new dates.');
      const r = await tx.message.updateMany({ where: { id: msg.id, requestStatus: 'PENDING' }, data: { requestStatus: 'ACCEPTED' } });
      if (r.count !== 1) throw new BookingError('This request was already answered.');
      const b = await createHold(tx, { item, renterId: conv.renterId, conversationId: conv.id, start, end });
      await tx.message.update({ where: { id: msg.id }, data: { bookingId: b.id } });
      await autoDeclineOverlaps(tx, item.id, start, end, msg.id);
      await postSystem(tx, conv.id, `Dates confirmed (${fmtRange(start, end)}). ${conv.renter.name.split(' ')[0]} has ${HOLD_HOURS} h to pay — the dates are held until then.`, b.id);
      return b;
    });
    await mail.requestAccepted(conv.renter.email, conv.item.title, booking.id);
    if (role === 'RENTER') await mail.status(conv.owner.email, `Suggested dates accepted · ${conv.item.title}`, `${conv.renter.name} accepted your dates (${fmtRange(start, end)}) and has ${HOLD_HOURS} h to pay.`, `/chat/${conv.id}`);
    return { ok: true, bookingId: booking.id };
  } catch (e) {
    if (e instanceof BookingError && /no longer free/.test(e.message)) {
      await setStatus(msg.id, 'DECLINED');
      await postSystem(prisma, conv.id, 'Those dates were just booked by someone else.');
      throw new BookingError('Those dates were just booked by someone else, so the request was closed.');
    }
    throw e;
  }
}

async function setStatus(id: string, s: 'DECLINED' | 'WITHDRAWN') {
  const r = await prisma.message.updateMany({ where: { id, requestStatus: 'PENDING' }, data: { requestStatus: s } });
  if (r.count !== 1) throw new BookingError('This request was already answered.');
}

/** Marks everything the other side sent as read by `userId`. */
export async function markRead(conversationId: string, userId: string) {
  const { conv, role } = await participant(conversationId, userId);
  const now = new Date();
  await prisma.$transaction([
    prisma.conversation.update({ where: { id: conv.id }, data: role === 'RENTER' ? { renterReadAt: now } : { ownerReadAt: now } }),
    prisma.message.updateMany({ where: { conversationId: conv.id, readAt: null, senderId: { not: userId }, NOT: { senderId: null } }, data: { readAt: now } }),
  ]);
}

/** Conversation list for the inbox with last message + unread count. */
export async function listConversations(userId: string) {
  const convs = await prisma.conversation.findMany({
    where: { OR: [{ renterId: userId }, { ownerId: userId }] },
    include: {
      item: { select: { id: true, title: true, photos: true, status: true, category: true } },
      renter: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      bookings: { orderBy: { createdAt: 'desc' }, take: 1, select: { status: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return Promise.all(
    convs.map(async (c) => {
      const readAt = c.renterId === userId ? c.renterReadAt : c.ownerReadAt;
      const unread = await prisma.message.count({ where: { conversationId: c.id, OR: [{ senderId: null }, { senderId: { not: userId } }], ...(readAt ? { createdAt: { gt: readAt } } : {}) } });
      const pendingForMe = await prisma.message.count({ where: { conversationId: c.id, type: 'BOOKING_REQUEST', requestStatus: 'PENDING', senderId: { not: userId } } });
      return { ...c, unread, pendingForMe, role: c.renterId === userId ? ('RENTER' as const) : ('OWNER' as const) };
    }),
  );
}

export type ThreadMessage = Prisma.MessageGetPayload<{}>;
