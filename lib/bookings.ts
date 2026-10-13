// Kirayo booking rules: pricing, availability/overlap and the booking state
// machine. Single source of truth — pages, actions, jobs and the e2e script all
// go through here. Every multi-step money/date change runs in one transaction
// that re-checks its condition inside (status still X, dates still free), and
// date-changing steps take a per-item advisory lock so two people can never get
// the same dates.
import crypto from 'node:crypto';
import type { Booking, BookingStatus, ClaimStatus, DamageClaim, DepositRefund, ExtensionRequest, Item, Payout, Prisma, PrismaClient, RefundKind, Review, User } from '@prisma/client';
import { prisma } from './db';
import { addDays, dayOf, diffDays, eachDay, fmtDay, fmtRange, inr, istStart, todayIST, toDbDate } from './format';
import { HOLD_HOURS, PLATFORM_FEE_PERCENT, RETURN_CONFIRM_HOURS, CLAIM_RESPONSE_HOURS, MAX_CONDITION_PHOTOS } from './constants';
import { postSystem } from './chat';
import { mail } from './mail';
import { refundPayment } from './payments';
import { platformFeeFor, rentFor, countDays } from './pricing';

export * from './pricing';

export type Tx = Prisma.TransactionClient | PrismaClient;
export type Role = 'RENTER' | 'OWNER' | 'ADMIN' | 'SYSTEM';
export type Actor = { role: Role; userId?: string };

/** A user-facing rule violation (shown as-is in the UI). */
export class BookingError extends Error {}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

/** Bookings that occupy their dates: live holds + confirmed/out/returned. */
export function occupyingWhere(now = new Date()): Prisma.BookingWhereInput {
  return {
    OR: [
      { status: { in: ['CONFIRMED', 'PICKED_UP', 'RETURNED'] } },
      { status: 'PENDING_PAYMENT', holdExpiresAt: { gt: now } },
    ],
  };
}

/** True if no blocked date and no occupying booking (other than `ignoreBookingId`) touches start..end. */
export async function isRangeFree(db: Tx, itemId: string, start: string, end: string, ignoreBookingId?: string): Promise<boolean> {
  const [blocked, clash] = await Promise.all([
    db.blockedDate.count({ where: { itemId, date: { gte: toDbDate(start), lte: toDbDate(end) } } }),
    db.booking.count({
      where: {
        itemId,
        ...(ignoreBookingId ? { id: { not: ignoreBookingId } } : {}),
        startDate: { lte: toDbDate(end) },
        endDate: { gte: toDbDate(start) },
        ...occupyingWhere(),
      },
    }),
  ]);
  return blocked === 0 && clash === 0;
}

/** Days that are booked/held and days the owner blocked, within [from, to]. */
export async function occupiedDays(itemId: string, from = todayIST(), to = addDays(todayIST(), 120), ignoreBookingId?: string) {
  const [blocked, bookings] = await Promise.all([
    prisma.blockedDate.findMany({ where: { itemId, date: { gte: toDbDate(from), lte: toDbDate(to) } }, select: { date: true } }),
    prisma.booking.findMany({
      where: { itemId, ...(ignoreBookingId ? { id: { not: ignoreBookingId } } : {}), startDate: { lte: toDbDate(to) }, endDate: { gte: toDbDate(from) }, ...occupyingWhere() },
      select: { startDate: true, endDate: true },
    }),
  ]);
  const booked = new Set<string>();
  for (const b of bookings) for (const d of eachDay(dayOf(b.startDate), dayOf(b.endDate))) booked.add(d);
  return { booked: [...booked].sort(), blocked: blocked.map((b) => dayOf(b.date)).sort() };
}

/** Item ids among `itemIds` that are free for the whole range (browse date filter). */
export async function freeItemIds(itemIds: string[], start: string, end: string): Promise<Set<string>> {
  if (!itemIds.length) return new Set();
  const [blocked, bookings] = await Promise.all([
    prisma.blockedDate.findMany({ where: { itemId: { in: itemIds }, date: { gte: toDbDate(start), lte: toDbDate(end) } }, select: { itemId: true } }),
    prisma.booking.findMany({
      where: { itemId: { in: itemIds }, startDate: { lte: toDbDate(end) }, endDate: { gte: toDbDate(start) }, ...occupyingWhere() },
      select: { itemId: true },
    }),
  ]);
  const busy = new Set([...blocked.map((b) => b.itemId), ...bookings.map((b) => b.itemId)]);
  return new Set(itemIds.filter((id) => !busy.has(id)));
}

/** Serialises all date-changing work on one item (released at transaction end). */
export async function lockItem(tx: Tx, itemId: string) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${itemId}))::text AS locked`;
}

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

/** Every allowed transition: from → { to: roles that may do it }. */
export const TRANSITIONS: Record<BookingStatus, Partial<Record<BookingStatus, Role[]>>> = {
  PENDING_PAYMENT: { CONFIRMED: ['RENTER', 'SYSTEM'], CANCELLED: ['RENTER', 'OWNER', 'ADMIN', 'SYSTEM'] },
  CONFIRMED: { PICKED_UP: ['OWNER'], CANCELLED: ['RENTER', 'OWNER', 'ADMIN', 'SYSTEM'] },
  PICKED_UP: { RETURNED: ['OWNER'] },
  RETURNED: { RETURN_CONFIRMED: ['OWNER', 'RENTER', 'SYSTEM'], DISPUTED: ['RENTER'] },
  DISPUTED: { RETURN_CONFIRMED: ['ADMIN'] },
  RETURN_CONFIRMED: { DEPOSIT_REFUNDED: ['SYSTEM', 'ADMIN'] },
  DEPOSIT_REFUNDED: {},
  CANCELLED: {},
};

export function canTransition(from: BookingStatus, to: BookingStatus, role: Role) {
  return !!TRANSITIONS[from][to]?.includes(role);
}

const STAMP: Partial<Record<BookingStatus, 'confirmedAt' | 'pickedUpAt' | 'returnedAt' | 'returnConfirmedAt' | 'refundedAt' | 'cancelledAt'>> = {
  CONFIRMED: 'confirmedAt',
  PICKED_UP: 'pickedUpAt',
  RETURNED: 'returnedAt',
  RETURN_CONFIRMED: 'returnConfirmedAt',
  DEPOSIT_REFUNDED: 'refundedAt',
  CANCELLED: 'cancelledAt',
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'Awaiting payment',
  CONFIRMED: 'Confirmed',
  PICKED_UP: 'Picked up',
  RETURNED: 'Returned',
  DISPUTED: 'Claim disputed',
  RETURN_CONFIRMED: 'Return confirmed',
  DEPOSIT_REFUNDED: 'Completed',
  CANCELLED: 'Cancelled',
};

type Loaded = Booking & { item: Item; renter: User; owner: User };
type TransitionOpts = {
  message: string;
  data?: Prisma.BookingUncheckedUpdateManyInput;
  /** Extra checks inside the transaction (throw BookingError to stop). */
  before?: (tx: Prisma.TransactionClient, b: Loaded) => Promise<void>;
  /** Extra writes inside the same transaction. */
  after?: (tx: Prisma.TransactionClient, b: Loaded) => Promise<void>;
  /** Emails, sent after commit. */
  mail?: (b: Loaded) => Promise<unknown>;
  lock?: boolean;
};

/**
 * The one way a booking changes status: checks role + current status inside a
 * transaction, sets the timestamp, posts a SYSTEM chat message, then emails.
 */
export async function transition(bookingId: string, to: BookingStatus, actor: Actor, opts: TransitionOpts): Promise<Loaded> {
  const b = await prisma.$transaction(async (tx) => {
    const cur = await tx.booking.findUnique({ where: { id: bookingId }, include: { item: true, renter: true, owner: true } });
    if (!cur) throw new BookingError('Booking not found.');
    if (opts.lock) await lockItem(tx, cur.itemId);
    if (actor.role === 'RENTER' && cur.renterId !== actor.userId) throw new BookingError('Only the renter can do this.');
    if (actor.role === 'OWNER' && cur.ownerId !== actor.userId) throw new BookingError('Only the owner can do this.');
    if (!canTransition(cur.status, to, actor.role)) throw new BookingError(`This booking is “${STATUS_LABEL[cur.status]}”, so that step isn’t possible any more. Refresh the page.`);
    await opts.before?.(tx, cur);
    const stamp = STAMP[to];
    const r = await tx.booking.updateMany({ where: { id: cur.id, status: cur.status }, data: { status: to, ...(stamp ? { [stamp]: new Date() } : {}), ...opts.data } });
    if (r.count !== 1) throw new BookingError('This booking just changed. Refresh and try again.');
    await postSystem(tx, cur.conversationId, opts.message, cur.id);
    await opts.after?.(tx, cur);
    return cur;
  });
  if (opts.mail) await opts.mail(b).catch((e) => console.error('[mail]', e));
  return b;
}

// ---------------------------------------------------------------------------
// Creating a held booking (owner accepts a request)
// ---------------------------------------------------------------------------

const otp4 = () => String(crypto.randomInt(0, 10000)).padStart(4, '0');

async function newCode(tx: Tx) {
  for (;;) {
    const code = `KR-${todayIST().slice(0, 4)}-${String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')}`;
    if (!(await tx.booking.findUnique({ where: { code } }))) return code;
  }
}

/**
 * Inside a transaction (caller holds the item lock): re-check availability and
 * create a PENDING_PAYMENT booking holding the dates for HOLD_HOURS.
 */
export async function createHold(tx: Tx, p: { item: Item; renterId: string; conversationId: string; start: string; end: string; now?: Date }) {
  if (!(await isRangeFree(tx, p.item.id, p.start, p.end))) throw new BookingError('Those dates are no longer free.');
  const days = countDays(p.start, p.end);
  const rent = rentFor(days, p.item.pricePerDay, p.item.pricePerWeek);
  let pickupOtp = otp4();
  let returnOtp = otp4();
  while (returnOtp === pickupOtp) returnOtp = otp4();
  return tx.booking.create({
    data: {
      code: await newCode(tx),
      itemId: p.item.id,
      renterId: p.renterId,
      ownerId: p.item.ownerId,
      conversationId: p.conversationId,
      startDate: toDbDate(p.start),
      endDate: toDbDate(p.end),
      days,
      pricePerDay: p.item.pricePerDay,
      pricePerWeek: p.item.pricePerWeek,
      rentAmount: rent,
      deposit: p.item.deposit,
      deliveryFee: 0,
      platformFee: platformFeeFor(rent, PLATFORM_FEE_PERCENT),
      total: rent + p.item.deposit,
      mode: p.item.canPickup ? 'PICKUP' : 'DELIVERY',
      pickupNote: p.item.pickupNote,
      holdExpiresAt: new Date((p.now ?? new Date()).getTime() + HOLD_HOURS * 3600000),
      status: 'PENDING_PAYMENT',
      pickupOtp,
      returnOtp,
    },
  });
}

/** Declines every other PENDING request for this item whose dates overlap. */
export async function autoDeclineOverlaps(tx: Tx, itemId: string, start: string, end: string, exceptMessageId?: string) {
  const pending = await tx.message.findMany({
    where: { type: 'BOOKING_REQUEST', requestStatus: 'PENDING', conversation: { itemId }, startDate: { lte: toDbDate(end) }, endDate: { gte: toDbDate(start) }, ...(exceptMessageId ? { id: { not: exceptMessageId } } : {}) },
    select: { id: true, conversationId: true },
  });
  for (const m of pending) {
    await tx.message.update({ where: { id: m.id }, data: { requestStatus: 'DECLINED' } });
    await postSystem(tx, m.conversationId, 'Those dates were just booked by someone else.');
  }
  return pending.length;
}

// ---------------------------------------------------------------------------
// Money helpers
// ---------------------------------------------------------------------------

export const isOnline = (b: Pick<Booking, 'paymentMode'>) => b.paymentMode === 'RAZORPAY' || b.paymentMode === 'DEMO';

/** Claim amount the owner keeps: accepted claim, or the admin's decision. */
export function claimAmountFor(claim: Pick<DamageClaim, 'status' | 'amount' | 'adminDecisionAmount'> | null | undefined): number {
  if (!claim) return 0;
  if (claim.status === 'ACCEPTED') return claim.amount;
  if (claim.status === 'RESOLVED') return claim.adminDecisionAmount ?? 0;
  return 0;
}

/** Owner payout for a settled online booking: rent (incl. extensions) − fee + claim. */
export function payoutFor(b: Pick<Booking, 'rentAmount' | 'platformFee'>, claimAmount: number) {
  return Math.max(0, b.rentAmount - b.platformFee + claimAmount);
}

/** Creates a refund record (inside a tx). Process it after commit with processRefund(). */
async function addRefund(tx: Tx, bookingId: string, amount: number, kind: RefundKind) {
  if (amount <= 0) return null;
  return tx.depositRefund.create({ data: { bookingId, amount, kind, status: 'PENDING' } });
}

/** Calls the payment provider for a PENDING/FAILED refund and records the result. */
export async function processRefund(refundId: string): Promise<DepositRefund> {
  const r = await prisma.depositRefund.findUnique({ where: { id: refundId }, include: { booking: { include: { item: true, renter: true, owner: true } } } });
  if (!r) throw new BookingError('Refund not found.');
  if (r.status === 'REFUNDED') return r;
  const res = await refundPayment(r.booking.paymentId, r.amount);
  if (!res.ok) return prisma.depositRefund.update({ where: { id: r.id }, data: { status: 'FAILED', error: res.error } });
  const done = await prisma.depositRefund.update({ where: { id: r.id }, data: { status: 'REFUNDED', refundId: res.refundId, refundedAt: new Date(), error: null } });
  if (r.kind === 'DEPOSIT') await finishDepositRefund(r.bookingId);
  else await mail.depositRefunded(r.booking.renter.email, r.booking.item.title, inr(r.amount), `/bookings/${r.bookingId}`);
  return done;
}

async function createPayout(tx: Tx, b: Pick<Booking, 'id' | 'ownerId'>, amount: number) {
  if (amount <= 0) return;
  await tx.payout.upsert({ where: { bookingId: b.id }, update: {}, create: { bookingId: b.id, ownerId: b.ownerId, amount, status: 'PENDING' } });
}

// ---------------------------------------------------------------------------
// Payment confirmation (online or cash) — atomic & idempotent
// ---------------------------------------------------------------------------

export type ConfirmResult = { ok: true; booking: Booking; already?: boolean } | { ok: false; error: string; refunded?: boolean };

/**
 * Confirms a paid booking. In one transaction (item locked): status still
 * PENDING_PAYMENT and dates still free (ignoring this booking) → CONFIRMED.
 * Otherwise the booking is cancelled and an online payment is refunded in full.
 * Calling it again with the same payment id is a no-op.
 */
export async function confirmPayment(bookingId: string, p: { mode: 'RAZORPAY' | 'DEMO'; paymentId: string; orderId?: string; amount: number }): Promise<ConfirmResult> {
  let conflictRefund: string | null = null;
  const out = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.findUnique({ where: { id: bookingId }, include: { renter: true } });
    if (!b) return { ok: false as const, error: 'Booking not found.' };
    await lockItem(tx, b.itemId);
    const cur = (await tx.booking.findUnique({ where: { id: bookingId } }))!;
    if (cur.paymentId === p.paymentId && cur.status !== 'PENDING_PAYMENT') return { ok: true as const, booking: cur, already: true };
    if (cur.status !== 'PENDING_PAYMENT' || !(await isRangeFree(tx, cur.itemId, dayOf(cur.startDate), dayOf(cur.endDate), cur.id))) {
      // Money arrived but the booking can't be confirmed: refund in full.
      await tx.booking.update({ where: { id: cur.id }, data: { paymentId: cur.paymentId ?? p.paymentId, paymentMode: cur.paymentMode ?? p.mode, amountPaid: cur.amountPaid || p.amount } });
      const rf = await addRefund(tx, cur.id, p.amount, 'CONFLICT');
      conflictRefund = rf?.id ?? null;
      if (cur.status === 'PENDING_PAYMENT') {
        await tx.booking.update({ where: { id: cur.id }, data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: 'Dates were no longer available when the payment arrived', cancelledBy: 'SYSTEM' } });
        await postSystem(tx, cur.conversationId, `Payment received, but the dates were no longer free. The booking was cancelled and ${inr(p.amount)} is being refunded in full.`, cur.id);
      }
      return { ok: false as const, error: `Those dates were just taken. Your payment of ${inr(p.amount)} will be refunded in full.`, refunded: true };
    }
    // (The ID gate is enforced before an order is created — money that already arrived is never rejected here.)
    const r = await tx.booking.updateMany({
      where: { id: cur.id, status: 'PENDING_PAYMENT' },
      data: { status: 'CONFIRMED', confirmedAt: new Date(), paymentMode: p.mode, paymentId: p.paymentId, razorpayOrderId: p.orderId ?? cur.razorpayOrderId, amountPaid: p.amount, paidAt: new Date(), holdExpiresAt: null },
    });
    if (r.count !== 1) throw new BookingError('This booking just changed. Refresh and try again.');
    await postSystem(tx, cur.conversationId, `Payment of ${inr(p.amount)} received — booking ${cur.code} is confirmed. Pickup on ${fmtDay(cur.startDate)}.`, cur.id);
    return { ok: true as const, booking: (await tx.booking.findUnique({ where: { id: cur.id } }))! };
  });
  if (conflictRefund) await processRefund(conflictRefund);
  if (out.ok && !out.already) await confirmedMails(bookingId, `${inr(p.amount)} received`);
  return out;
}

/** Pay at pickup (cash / UPI): confirmed immediately, dates held the same way, no money moves. */
export async function confirmCash(bookingId: string, renterId: string): Promise<Booking> {
  const b = await transition(bookingId, 'CONFIRMED', { role: 'RENTER', userId: renterId }, {
    lock: true,
    message: 'Confirmed with payment at pickup (cash / UPI). The owner collects rent + deposit at handover.',
    data: { paymentMode: 'CASH_AT_PICKUP', holdExpiresAt: null },
    before: async (tx, cur) => {
      if (!cur.item.acceptsCashAtPickup) throw new BookingError('This owner does not accept payment at pickup.');
      if (cur.renter.idStatus !== 'VERIFIED') throw new BookingError('Verify your ID to confirm.');
      if (!(await isRangeFree(tx, cur.itemId, dayOf(cur.startDate), dayOf(cur.endDate), cur.id))) {
        throw new BookingError('Those dates were just taken by someone else.');
      }
    },
  });
  await confirmedMails(bookingId, 'pay at pickup');
  return b;
}

async function confirmedMails(bookingId: string, how: string) {
  const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { item: true, renter: true, owner: true } });
  if (!b) return;
  if (isOnline(b)) await mail.paymentReceived(b.renter.email, b.item.title, b.code, inr(b.amountPaid), `/bookings/${b.id}`);
  await mail.bookingConfirmed(b.renter.email, b.item.title, b.code, `/bookings/${b.id}`);
  await mail.status(b.owner.email, `New confirmed booking · ${b.code}`, `${b.renter.name} booked ${b.item.title} for ${fmtRange(b.startDate, b.endDate)} (${how}).`, `/owner/bookings/${b.id}`);
}

// ---------------------------------------------------------------------------
// Cancellation, hold expiry, no-show
// ---------------------------------------------------------------------------

/** What happens to the money if `role` cancels now (before pickup). */
export function cancellationTerms(b: Pick<Booking, 'status' | 'paymentMode' | 'amountPaid' | 'pricePerDay' | 'rentAmount' | 'startDate'>, role: Role, now = new Date()) {
  const paid = isOnline(b) ? b.amountPaid : 0;
  const oneDay = Math.min(b.pricePerDay, b.rentAmount);
  const late = istStart(dayOf(b.startDate)).getTime() - now.getTime() < 24 * 3600000;
  if (b.status === 'PENDING_PAYMENT') return { refund: 0, ownerKeep: 0, late: false, text: 'Nothing has been paid, so nothing is charged.' };
  if (b.paymentMode === 'CASH_AT_PICKUP') return { refund: 0, ownerKeep: 0, late, text: 'Paid at pickup, so no money has moved.' };
  if (role === 'RENTER' && late) return { refund: paid - oneDay, ownerKeep: oneDay, late, text: `Less than 24 h before pickup: 1 day’s rent (${inr(oneDay)}) goes to the owner and ${inr(paid - oneDay)} is refunded.` };
  return { refund: paid, ownerKeep: 0, late, text: `Full refund of ${inr(paid)}.` };
}

export async function cancelBooking(bookingId: string, actor: Actor, reason: string): Promise<Loaded> {
  let refundId: string | null = null;
  const who = actor.role === 'RENTER' ? 'the renter' : actor.role === 'OWNER' ? 'the owner' : actor.role === 'ADMIN' ? 'Kirayo admin' : 'Kirayo';
  const b = await transition(bookingId, 'CANCELLED', actor, {
    lock: true,
    message: `Booking cancelled by ${who}${reason ? `: ${reason}` : ''}.`,
    data: { cancelReason: reason || null, cancelledBy: actor.role, holdExpiresAt: null },
    after: async (tx, cur) => {
      const t = cancellationTerms(cur, actor.role);
      if (t.ownerKeep) await tx.booking.update({ where: { id: cur.id }, data: { ownerKeepAmount: t.ownerKeep } });
      const rf = await addRefund(tx, cur.id, t.refund, 'CANCELLATION');
      refundId = rf?.id ?? null;
      if (t.ownerKeep && isOnline(cur)) await createPayout(tx, cur, t.ownerKeep - platformFeeFor(t.ownerKeep, PLATFORM_FEE_PERCENT));
      if (actor.role === 'OWNER' && cur.status === 'CONFIRMED') await tx.user.update({ where: { id: cur.ownerId }, data: { ownerCancellations: { increment: 1 } } });
      if (t.refund) await postSystem(tx, cur.conversationId, `${inr(t.refund)} will be refunded to the original payment method.`, cur.id);
    },
    mail: async (cur) => {
      const text = `Booking ${cur.code} for ${cur.item.title} was cancelled by ${who}${reason ? `: ${reason}` : ''}.`;
      await mail.status(cur.renter.email, `Booking cancelled · ${cur.code}`, text, `/bookings/${cur.id}`);
      await mail.status(cur.owner.email, `Booking cancelled · ${cur.code}`, text, `/owner/bookings/${cur.id}`);
    },
  });
  if (refundId) await processRefund(refundId);
  return b;
}

/** Hold expiry: cancel unpaid bookings whose 12 h hold is over (job). */
export async function expireHold(bookingId: string) {
  return cancelBooking(bookingId, { role: 'SYSTEM' }, 'payment not completed in time — the dates are free again');
}

/** From the day after pickup day, the owner can mark that the renter never came. */
export async function markNoShow(bookingId: string, ownerId: string) {
  let refundId: string | null = null;
  const b = await transition(bookingId, 'CANCELLED', { role: 'OWNER', userId: ownerId }, {
    lock: true,
    message: 'Owner marked: renter didn’t come for pickup. Deposit and delivery fee are refunded; 1 day’s rent goes to the owner.',
    data: { cancelReason: 'Renter didn’t come for pickup (no-show)', cancelledBy: 'OWNER', holdExpiresAt: null },
    before: async (_tx, cur) => {
      if (todayIST() <= dayOf(cur.startDate)) throw new BookingError(`You can mark a no-show from ${fmtDay(addDays(dayOf(cur.startDate), 1))}.`);
    },
    after: async (tx, cur) => {
      const oneDay = Math.min(cur.pricePerDay, cur.rentAmount);
      await tx.booking.update({ where: { id: cur.id }, data: { ownerKeepAmount: oneDay } });
      if (isOnline(cur)) {
        const rf = await addRefund(tx, cur.id, cur.amountPaid - oneDay, 'CANCELLATION');
        refundId = rf?.id ?? null;
        await createPayout(tx, cur, oneDay - platformFeeFor(oneDay, PLATFORM_FEE_PERCENT));
      }
    },
    mail: (cur) => mail.status(cur.renter.email, `Marked as no-show · ${cur.code}`, `The owner marked that you didn’t come to collect ${cur.item.title}. Deposit and delivery fee are refunded; 1 day’s rent was kept.`, `/bookings/${cur.id}`),
  });
  if (refundId) await processRefund(refundId);
  return b;
}

// ---------------------------------------------------------------------------
// Handover: pickup and return
// ---------------------------------------------------------------------------

export async function addConditionReport(bookingId: string, userId: string, stage: 'PICKUP' | 'RETURN', photos: string[], notes: string) {
  const b = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!b || (b.renterId !== userId && b.ownerId !== userId)) throw new BookingError('Booking not found.');
  const okStatus = stage === 'PICKUP' ? ['CONFIRMED', 'PICKED_UP'] : ['PICKED_UP', 'RETURNED'];
  if (!okStatus.includes(b.status)) throw new BookingError('Condition photos can’t be added at this stage.');
  if (photos.length < 1 || photos.length > MAX_CONDITION_PHOTOS) throw new BookingError(`Add 1–${MAX_CONDITION_PHOTOS} photos.`);
  const existing = await prisma.conditionReport.findFirst({ where: { bookingId, stage, byUserId: userId } });
  const report = existing
    ? await prisma.conditionReport.update({ where: { id: existing.id }, data: { photos, notes } })
    : await prisma.conditionReport.create({ data: { bookingId, stage, byUserId: userId, photos, notes } });
  if (!existing) await postSystem(prisma, b.conversationId, `${userId === b.ownerId ? 'Owner' : 'Renter'} added ${photos.length} ${stage === 'PICKUP' ? 'pickup' : 'return'} condition photo${photos.length > 1 ? 's' : ''}.`, b.id);
  return report;
}

export async function recordPickup(bookingId: string, ownerId: string, otp: string, cashCollected: boolean) {
  return transition(bookingId, 'PICKED_UP', { role: 'OWNER', userId: ownerId }, {
    message: 'Handed over — the renter’s pickup code matched. Enjoy the rental!',
    data: { otpAttempts: 0 },
    before: async (tx, cur) => {
      if (todayIST() < dayOf(cur.startDate)) throw new BookingError(`Pickup is on ${fmtDay(cur.startDate)}. You can hand over from that day.`);
      const rep = await tx.conditionReport.findFirst({ where: { bookingId, stage: 'PICKUP', byUserId: ownerId } });
      if (!rep || rep.photos.length < 2) throw new BookingError('Upload at least 2 condition photos at pickup first.');
      if (cur.paymentMode === 'CASH_AT_PICKUP' && !cashCollected) throw new BookingError(`Tick “I collected ${inr(cur.total)}” before entering the code.`);
      await checkOtp(tx, cur, otp, cur.pickupOtp);
      if (cur.paymentMode === 'CASH_AT_PICKUP') await tx.booking.update({ where: { id: cur.id }, data: { cashCollected: true, amountPaid: cur.total, paidAt: new Date() } });
    },
    mail: (cur) => mail.status(cur.renter.email, `Picked up · ${cur.item.title}`, `You picked up ${cur.item.title}. Return it by ${fmtDay(cur.endDate)}; your return code is on the booking page.`, `/bookings/${cur.id}`),
  });
}

export async function recordReturn(bookingId: string, ownerId: string, otp: string) {
  return transition(bookingId, 'RETURNED', { role: 'OWNER', userId: ownerId }, {
    message: `Returned — the return code matched. The owner has ${RETURN_CONFIRM_HOURS} h to confirm “All OK” or raise a claim.`,
    data: { otpAttempts: 0 },
    before: async (tx, cur) => {
      const rep = await tx.conditionReport.findFirst({ where: { bookingId, stage: 'RETURN', byUserId: ownerId } });
      if (!rep || rep.photos.length < 2) throw new BookingError('Upload at least 2 condition photos at return first.');
      await checkOtp(tx, cur, otp, cur.returnOtp);
    },
    mail: (cur) => mail.status(cur.renter.email, `Returned · ${cur.item.title}`, `Thanks for returning ${cur.item.title}. The owner will check it within ${RETURN_CONFIRM_HOURS} h, then your deposit is settled.`, `/bookings/${cur.id}`),
  });
}

async function checkOtp(tx: Prisma.TransactionClient, cur: Booking, given: string, expected: string) {
  if (cur.otpAttempts >= 10) throw new BookingError('Too many wrong codes. Contact Kirayo support.');
  if (String(given).trim() !== expected) {
    // Count the miss outside the rolled-back transaction.
    void prisma.booking.update({ where: { id: cur.id }, data: { otpAttempts: { increment: 1 } } }).catch(() => {});
    throw new BookingError('That code is not right. Ask the renter to read it from their booking page.');
  }
}

// ---------------------------------------------------------------------------
// After return: All OK, claim, dispute, admin decision, settlement
// ---------------------------------------------------------------------------

export async function confirmReturnOk(bookingId: string, actor: Actor, auto = false) {
  await transition(bookingId, 'RETURN_CONFIRMED', actor, {
    message: auto ? `No response from the owner within ${RETURN_CONFIRM_HOURS} h — return confirmed automatically.` : 'Owner confirmed: all OK. The deposit is being refunded.',
    before: async (tx) => {
      if (await tx.damageClaim.findUnique({ where: { bookingId } })) throw new BookingError('A claim is open on this booking.');
    },
  });
  return settleDeposit(bookingId);
}

export async function raiseClaim(bookingId: string, ownerId: string, c: { amount: number; lateFee: number; reason: string; photos: string[] }) {
  const b = await prisma.$transaction(async (tx) => {
    const cur = await tx.booking.findUnique({ where: { id: bookingId }, include: { item: true, renter: true } });
    if (!cur || cur.ownerId !== ownerId) throw new BookingError('Booking not found.');
    if (cur.status !== 'RETURNED') throw new BookingError('You can claim only after the return, before confirming it.');
    if (await tx.damageClaim.findUnique({ where: { bookingId } })) throw new BookingError('A claim already exists for this booking.');
    if (!Number.isInteger(c.amount) || c.amount < 1) throw new BookingError('Enter the claim amount.');
    if (c.amount > cur.deposit) throw new BookingError(`A claim can be at most the deposit (${inr(cur.deposit)}).`);
    if (c.lateFee > c.amount) throw new BookingError('The late fee is part of the claim amount.');
    const maxLate = lateDays(cur, cur.returnedAt ?? new Date()) * cur.pricePerDay;
    if (c.lateFee > maxLate) throw new BookingError(`The late fee can be at most ${inr(maxLate)} (${lateDays(cur, cur.returnedAt ?? new Date())} late day(s) × ${inr(cur.pricePerDay)}).`);
    if (c.reason.trim().length < 5) throw new BookingError('Describe what happened.');
    await tx.damageClaim.create({ data: { bookingId, amount: c.amount, lateFee: c.lateFee, reason: c.reason.trim(), photos: c.photos } });
    await postSystem(tx, cur.conversationId, `Owner claimed ${inr(c.amount)} from the deposit: ${c.reason.trim()}. The renter has ${CLAIM_RESPONSE_HOURS} h to accept or dispute.`, cur.id);
    return cur;
  });
  await mail.claimRaised(b.renter.email, b.item.title, inr(c.amount), `/bookings/${b.id}`);
}

export async function respondClaim(bookingId: string, renterId: string, accept: boolean, note: string, auto = false) {
  const claim = await prisma.damageClaim.findUnique({ where: { bookingId } });
  if (!claim || claim.status !== 'OPEN') throw new BookingError('There is no open claim to answer.');
  const setClaim = async (tx: Prisma.TransactionClient, status: ClaimStatus) => {
    const r = await tx.damageClaim.updateMany({ where: { id: claim.id, status: 'OPEN' }, data: { status, renterNote: note || null, decidedAt: status === 'ACCEPTED' ? new Date() : null } });
    if (r.count !== 1) throw new BookingError('The claim just changed. Refresh the page.');
  };
  if (accept) {
    await transition(bookingId, 'RETURN_CONFIRMED', auto ? { role: 'SYSTEM' } : { role: 'RENTER', userId: renterId }, {
      message: auto ? `No answer from the renter within ${CLAIM_RESPONSE_HOURS} h — the claim of ${inr(claim.amount)} was accepted automatically.` : `Renter accepted the claim of ${inr(claim.amount)}.`,
      after: (tx) => setClaim(tx, 'ACCEPTED'),
      mail: (b) => mail.claimDecided(b.owner.email, b.item.title, inr(claim.amount), `/owner/bookings/${b.id}`),
    });
    return settleDeposit(bookingId);
  }
  if (note.trim().length < 5) throw new BookingError('Tell the admin why you disagree.');
  await transition(bookingId, 'DISPUTED', { role: 'RENTER', userId: renterId }, {
    message: `Renter disputed the claim: ${note.trim()}. Kirayo admin will review both condition reports and decide.`,
    after: (tx) => setClaim(tx, 'DISPUTED'),
    mail: (b) => mail.status(b.owner.email, `Claim disputed · ${b.code}`, `${b.renter.name} disputed your claim on ${b.item.title}. Kirayo admin will decide.`, `/owner/bookings/${b.id}`),
  });
}

export async function decideDispute(bookingId: string, adminId: string, amount: number, note: string) {
  const claim = await prisma.damageClaim.findUnique({ where: { bookingId } });
  if (!claim || claim.status !== 'DISPUTED') throw new BookingError('This claim is not disputed.');
  if (!Number.isInteger(amount) || amount < 0 || amount > claim.amount) throw new BookingError(`Decide an amount between ₹0 and ${inr(claim.amount)}.`);
  await transition(bookingId, 'RETURN_CONFIRMED', { role: 'ADMIN', userId: adminId }, {
    message: `Kirayo admin decided the claim: ${inr(amount)} goes to the owner${note ? ` — ${note}` : ''}.`,
    after: async (tx) => {
      const r = await tx.damageClaim.updateMany({ where: { id: claim.id, status: 'DISPUTED' }, data: { status: 'RESOLVED', adminDecisionAmount: amount, adminNote: note || null, decidedAt: new Date() } });
      if (r.count !== 1) throw new BookingError('The claim just changed. Refresh the page.');
    },
    mail: async (b) => {
      await mail.claimDecided(b.renter.email, b.item.title, inr(amount), `/bookings/${b.id}`);
      await mail.claimDecided(b.owner.email, b.item.title, inr(amount), `/owner/bookings/${b.id}`);
    },
  });
  return settleDeposit(bookingId);
}

/**
 * RETURN_CONFIRMED → refund (deposit − claim). Online: Razorpay/demo refund,
 * then DEPOSIT_REFUNDED + owner payout. Cash: recorded only (owner hands the
 * deposit back in cash), no refund or payout.
 */
export async function settleDeposit(bookingId: string) {
  let refundId: string | null = null;
  await prisma.$transaction(async (tx) => {
    const b = await tx.booking.findUnique({ where: { id: bookingId }, include: { claim: true, refunds: true } });
    if (!b || b.status !== 'RETURN_CONFIRMED') return;
    const claim = claimAmountFor(b.claim);
    const refund = Math.max(0, b.deposit - claim);
    if (!isOnline(b)) return;
    const existing = b.refunds.find((r) => r.kind === 'DEPOSIT');
    if (existing) {
      refundId = existing.status === 'REFUNDED' ? null : existing.id;
      return;
    }
    const rf = await addRefund(tx, b.id, refund, 'DEPOSIT');
    refundId = rf?.id ?? null;
  });
  const b = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!b || b.status !== 'RETURN_CONFIRMED') return;
  if (refundId) await processRefund(refundId);
  else await finishDepositRefund(bookingId);
}

/** Marks the deposit as settled and creates the owner payout (online only). */
async function finishDepositRefund(bookingId: string) {
  const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { claim: true, refunds: true, item: true, renter: true } });
  if (!b || b.status !== 'RETURN_CONFIRMED') return;
  const claim = claimAmountFor(b.claim);
  const refund = Math.max(0, b.deposit - claim);
  const msg = isOnline(b)
    ? refund > 0
      ? `Deposit refund of ${inr(refund)} sent to the original payment method${claim ? ` (${inr(claim)} kept for the claim)` : ''}.`
      : `The full deposit (${inr(b.deposit)}) went to the owner for the claim.`
    : `Deposit settled in cash: the owner returns ${inr(refund)}${claim ? ` (${inr(claim)} kept for the claim)` : ''}.`;
  await transition(bookingId, 'DEPOSIT_REFUNDED', { role: 'SYSTEM' }, {
    message: msg,
    after: async (tx, cur) => {
      if (isOnline(cur)) await createPayout(tx, cur, payoutFor(cur, claim));
    },
    mail: (cur) => mail.depositRefunded(cur.renter.email, cur.item.title, inr(refund), `/bookings/${cur.id}`),
  });
}

/** Admin: retry a FAILED (or stuck PENDING) refund. */
export async function retryRefund(refundId: string) {
  const r = await prisma.depositRefund.findUnique({ where: { id: refundId } });
  if (!r) throw new BookingError('Refund not found.');
  if (r.status === 'REFUNDED') return r;
  return processRefund(refundId);
}

// ---------------------------------------------------------------------------
// Late return & extension
// ---------------------------------------------------------------------------

/** Days past the end date (0 if not late). OVERDUE is computed, not a status. */
export function lateDays(b: Pick<Booking, 'endDate'>, at: Date = new Date()): number {
  return Math.max(0, diffDays(dayOf(b.endDate), todayIST(at)));
}

export function isOverdue(b: Pick<Booking, 'status' | 'endDate'>, now = new Date()) {
  return b.status === 'PICKED_UP' && lateDays(b, now) > 0;
}

export function extensionQuote(b: Pick<Booking, 'startDate' | 'endDate' | 'pricePerDay' | 'pricePerWeek' | 'rentAmount' | 'extensionAmount'>, newEnd: string) {
  const days = countDays(dayOf(b.startDate), newEnd);
  const baseRent = b.rentAmount - b.extensionAmount;
  const fullRent = rentFor(days, b.pricePerDay, b.pricePerWeek);
  const extraDays = diffDays(dayOf(b.endDate), newEnd);
  // Never charge more than plain daily rate for the extra days, never less than 0.
  const extraAmount = Math.max(0, Math.min(extraDays * b.pricePerDay, fullRent - baseRent - b.extensionAmount));
  return { days, extraDays, extraAmount };
}

export async function requestExtension(bookingId: string, renterId: string, newEnd: string) {
  const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { item: true, extensions: true } });
  if (!b || b.renterId !== renterId) throw new BookingError('Booking not found.');
  if (b.status !== 'PICKED_UP') throw new BookingError('You can extend only while you have the item.');
  if (b.extensions.some((e) => e.status === 'PENDING' || (e.status === 'ACCEPTED' && isOnline(b)))) throw new BookingError('An extension request is already open.');
  if (newEnd <= dayOf(b.endDate)) throw new BookingError('Pick a new return date after the current one.');
  const q = extensionQuote(b, newEnd);
  if (q.days > b.item.maxDays) throw new BookingError(`This item can be rented for at most ${b.item.maxDays} days in total.`);
  if (!(await isRangeFree(prisma, b.itemId, addDays(dayOf(b.endDate), 1), newEnd))) throw new BookingError('Those extra days are already booked or blocked.');
  const ext = await prisma.extensionRequest.create({ data: { bookingId, newEndDate: toDbDate(newEnd), extraDays: q.extraDays, extraAmount: q.extraAmount } });
  await postSystem(prisma, b.conversationId, `Renter asked to extend until ${fmtDay(newEnd)} (+${q.extraDays} day${q.extraDays > 1 ? 's' : ''}, ${inr(q.extraAmount)}).`, b.id);
  const owner = await prisma.user.findUnique({ where: { id: b.ownerId } });
  if (owner) await mail.status(owner.email, `Extension request · ${b.item.title}`, `The renter asked to keep ${b.item.title} until ${fmtDay(newEnd)}.`, `/owner/bookings/${b.id}`);
  return ext;
}

/** Owner accepts/declines. Accept re-checks the extra dates (item locked). Cash bookings extend right away. */
export async function respondExtension(extensionId: string, ownerId: string, accept: boolean) {
  const out = await prisma.$transaction(async (tx) => {
    const ext = await tx.extensionRequest.findUnique({ where: { id: extensionId }, include: { booking: true } });
    if (!ext || ext.booking.ownerId !== ownerId) throw new BookingError('Request not found.');
    if (ext.status !== 'PENDING') throw new BookingError('This request was already answered.');
    const b = ext.booking;
    if (!accept) {
      await tx.extensionRequest.update({ where: { id: ext.id }, data: { status: 'DECLINED', decidedAt: new Date() } });
      await postSystem(tx, b.conversationId, 'Owner declined the extension. Please return on the original date.', b.id);
      return { ext, b, accepted: false };
    }
    await lockItem(tx, b.itemId);
    if (b.status !== 'PICKED_UP') throw new BookingError('The rental is no longer active.');
    if (!(await isRangeFree(tx, b.itemId, addDays(dayOf(b.endDate), 1), dayOf(ext.newEndDate), b.id))) throw new BookingError('Those extra days are no longer free.');
    if (isOnline(b)) {
      await tx.extensionRequest.update({ where: { id: ext.id }, data: { status: 'ACCEPTED', decidedAt: new Date() } });
      await postSystem(tx, b.conversationId, `Owner accepted the extension to ${fmtDay(ext.newEndDate)}. Renter: pay ${inr(ext.extraAmount)} to lock it in.`, b.id);
    } else {
      await applyExtension(tx, ext, b, null);
      await postSystem(tx, b.conversationId, `Extension accepted — new return date ${fmtDay(ext.newEndDate)}. ${inr(ext.extraAmount)} is paid to the owner in cash / UPI.`, b.id);
    }
    return { ext, b, accepted: true };
  });
  const renter = await prisma.user.findUnique({ where: { id: out.b.renterId } });
  if (renter) await mail.status(renter.email, `Extension ${out.accepted ? 'accepted' : 'declined'}`, out.accepted ? `Your extension to ${fmtDay(out.ext.newEndDate)} was accepted.` : 'Your extension request was declined.', `/bookings/${out.b.id}`);
}

async function applyExtension(tx: Prisma.TransactionClient, ext: ExtensionRequest, b: Booking, paymentId: string | null) {
  const newRent = b.rentAmount + ext.extraAmount;
  const r = await tx.booking.updateMany({
    where: { id: b.id, status: 'PICKED_UP', endDate: b.endDate },
    data: { endDate: ext.newEndDate, days: countDays(dayOf(b.startDate), dayOf(ext.newEndDate)), rentAmount: newRent, extensionAmount: b.extensionAmount + ext.extraAmount, platformFee: platformFeeFor(newRent, PLATFORM_FEE_PERCENT), total: b.total + ext.extraAmount },
  });
  if (r.count !== 1) throw new BookingError('This booking just changed. Refresh and try again.');
  await tx.extensionRequest.update({ where: { id: ext.id }, data: { status: 'PAID', paymentId, decidedAt: ext.decidedAt ?? new Date() } });
}

/** Online extension payment: atomic + idempotent like the main payment. */
export async function payExtension(extensionId: string, renterId: string, paymentId: string) {
  return prisma.$transaction(async (tx) => {
    const ext = await tx.extensionRequest.findUnique({ where: { id: extensionId }, include: { booking: true } });
    if (!ext || ext.booking.renterId !== renterId) throw new BookingError('Request not found.');
    if (ext.status === 'PAID' && ext.paymentId === paymentId) return ext;
    if (ext.status !== 'ACCEPTED') throw new BookingError('This extension can’t be paid now.');
    await lockItem(tx, ext.booking.itemId);
    if (!(await isRangeFree(tx, ext.booking.itemId, addDays(dayOf(ext.booking.endDate), 1), dayOf(ext.newEndDate), ext.booking.id))) throw new BookingError('Those extra days were just taken.');
    await applyExtension(tx, ext, ext.booking, paymentId);
    await postSystem(tx, ext.booking.conversationId, `Extension paid (${inr(ext.extraAmount)}). New return date: ${fmtDay(ext.newEndDate)}.`, ext.booking.id);
    return ext;
  });
}

// ---------------------------------------------------------------------------
// "What do I do next?" — Next card + progress bar (Golden rule 4)
// ---------------------------------------------------------------------------

export type ViewerRole = 'RENTER' | 'OWNER';
export type NextStep = { text: string; buttonLabel?: string; href?: string; tone: 'action' | 'info' | 'wait' | 'alert' | 'done' };
export type BookingForNext = Booking & {
  item: Pick<Item, 'title'>;
  renter: Pick<User, 'name'>;
  owner: Pick<User, 'name'>;
  claim?: DamageClaim | null;
  extensions?: ExtensionRequest[];
  refunds?: DepositRefund[];
  payout?: Payout | null;
  reviews?: Pick<Review, 'fromUserId'>[];
};

const first = (n: string) => n.split(' ')[0];
const hoursLeftTxt = (until: Date, now: Date) => {
  const h = Math.max(0, Math.ceil((until.getTime() - now.getTime()) / 3600000));
  return h <= 1 ? 'less than an hour' : `${h} h`;
};

export function nextStepFor(b: BookingForNext, role: ViewerRole, now = new Date()): NextStep {
  const today = todayIST(now);
  const start = dayOf(b.startDate);
  const end = dayOf(b.endDate);
  const r = first(b.renter.name);
  const o = first(b.owner.name);
  const page = role === 'RENTER' ? `/bookings/${b.id}` : `/owner/bookings/${b.id}`;
  const reviewed = b.reviews?.some((x) => x.fromUserId === (role === 'RENTER' ? b.renterId : b.ownerId));
  const ext = b.extensions?.find((e) => e.status === 'PENDING' || (e.status === 'ACCEPTED' && isOnline(b)));
  const late = lateDays(b, now);
  switch (b.status) {
    case 'PENDING_PAYMENT': {
      const left = b.holdExpiresAt ? hoursLeftTxt(b.holdExpiresAt, now) : '';
      return role === 'RENTER'
        ? { text: `Pay to confirm — the dates are held for you (hold expires in ${left}).`, buttonLabel: 'Continue to booking', href: `/book/${b.id}`, tone: 'action' }
        : { text: `Waiting for ${r} to pay (hold expires in ${left}). The dates are held until then.`, tone: 'wait' };
    }
    case 'CONFIRMED': {
      const cash = b.paymentMode === 'CASH_AT_PICKUP';
      if (role === 'RENTER') {
        const when = start === today ? 'today' : start === addDays(today, 1) ? 'tomorrow' : `on ${fmtDay(start)}`;
        return { text: `Pickup ${when}. Show your pickup OTP to ${o} at handover${cash ? ` and pay ${inr(b.total)} in cash / UPI` : ''}.`, buttonLabel: 'Show your pickup OTP', href: `${page}#otp`, tone: start <= today ? 'action' : 'info' };
      }
      if (start > today) return { text: `Confirmed — on pickup day (${fmtDay(start)}) take condition photos${cash ? `, collect ${inr(b.total)}` : ''} and enter ${r}’s OTP.`, buttonLabel: 'Open handover', href: `${page}#handover`, tone: 'info' };
      return { text: `Pickup ${start === today ? 'today' : `was due ${fmtDay(start)}`}: take at least 2 condition photos${cash ? `, tick “I collected ${inr(b.total)}”` : ''}, then enter ${r}’s OTP.`, buttonLabel: 'Start handover', href: `${page}#handover`, tone: 'action' };
    }
    case 'PICKED_UP': {
      if (role === 'RENTER') {
        if (ext?.status === 'ACCEPTED') return { text: `${o} accepted your extension to ${fmtDay(ext.newEndDate)} — pay ${inr(ext.extraAmount)} to lock it in.`, buttonLabel: `Pay ${inr(ext.extraAmount)}`, href: `/pay/${b.id}?ext=${ext.id}`, tone: 'action' };
        if (late > 0) return { text: `Overdue by ${late} day${late > 1 ? 's' : ''} — please return it today. Late days can be charged from your deposit.`, buttonLabel: 'Show your return OTP', href: `${page}#otp`, tone: 'alert' };
        if (end === today) return { text: 'Return due today — show your return OTP to the owner at handover.', buttonLabel: 'Show your return OTP', href: `${page}#otp`, tone: 'action' };
        if (end === addDays(today, 1)) return { text: `Return due tomorrow (${fmtDay(end)}). Need longer? Request an extension.`, buttonLabel: 'Show your return OTP', href: `${page}#otp`, tone: 'action' };
        if (ext?.status === 'PENDING') return { text: `Waiting for ${o} to answer your extension request to ${fmtDay(ext.newEndDate)}.`, tone: 'wait' };
        return { text: `In use — return by ${fmtDay(end)} (${diffDays(today, end)} days left). Need longer? Request an extension.`, buttonLabel: 'Request extension', href: `${page}#extension`, tone: 'info' };
      }
      if (ext?.status === 'PENDING') return { text: `${r} asked to extend until ${fmtDay(ext.newEndDate)} (${inr(ext.extraAmount)}) — accept or decline.`, buttonLabel: 'Answer extension', href: `${page}#extension`, tone: 'action' };
      if (late > 0) return { text: `Overdue by ${late} day${late > 1 ? 's' : ''}. When it comes back, take return photos and enter ${r}’s return OTP. You can claim a late fee.`, buttonLabel: 'Open return handover', href: `${page}#handover`, tone: 'alert' };
      if (end <= addDays(today, 1)) return { text: `Return due ${end === today ? 'today' : 'tomorrow'}: take at least 2 return photos, then enter ${r}’s return OTP.`, buttonLabel: 'Open return handover', href: `${page}#handover`, tone: 'action' };
      return { text: `Out with ${r} — due back ${fmtDay(end)}.`, tone: 'wait' };
    }
    case 'RETURNED': {
      const until = new Date((b.returnedAt ?? now).getTime() + RETURN_CONFIRM_HOURS * 3600000);
      if (b.claim?.status === 'OPEN') {
        const cUntil = new Date(b.claim.createdAt.getTime() + CLAIM_RESPONSE_HOURS * 3600000);
        return role === 'RENTER'
          ? { text: `${o} claimed ${inr(b.claim.amount)} from your deposit — accept or dispute (${hoursLeftTxt(cUntil, now)} left, then it’s accepted automatically).`, buttonLabel: 'Review the claim', href: `${page}#claim`, tone: 'alert' }
          : { text: `Waiting for ${r} to accept or dispute your claim (auto-accepted in ${hoursLeftTxt(cUntil, now)}).`, tone: 'wait' };
      }
      return role === 'RENTER'
        ? { text: `Waiting for ${o} to check the item (auto-OK in ${hoursLeftTxt(until, now)}). Then your deposit is refunded.`, tone: 'wait' }
        : { text: `Check the item and confirm within ${hoursLeftTxt(until, now)}: “All OK” or claim damage / late fee.`, buttonLabel: 'Check return', href: `${page}#confirm`, tone: 'action' };
    }
    case 'DISPUTED':
      return { text: 'Waiting for Kirayo admin to review both condition reports and decide the claim.', tone: 'wait' };
    case 'RETURN_CONFIRMED': {
      const failed = b.refunds?.some((x) => x.kind === 'DEPOSIT' && x.status === 'FAILED');
      if (role === 'RENTER') return failed ? { text: 'Your deposit refund hit a snag — Kirayo admin is retrying it.', tone: 'wait' } : { text: 'Return confirmed — your deposit refund is being processed.', tone: 'wait' };
      return { text: 'Return confirmed — the deposit is being settled, then your payout is created.', tone: 'wait' };
    }
    case 'DEPOSIT_REFUNDED':
      if (!reviewed) return { text: role === 'RENTER' ? `All done! Rate ${o} and the item.` : `All done! Rate ${r} as a renter.`, buttonLabel: role === 'RENTER' ? `Rate ${o}` : `Rate ${r}`, href: `${role === 'RENTER' ? '/bookings' : '/owner/bookings'}/${b.id}/review`, tone: 'action' };
      return { text: role === 'RENTER' ? 'All done — thanks for renting on Kirayo.' : b.payout ? `All done — payout ${inr(b.payout.amount)} is ${b.payout.status === 'PAID' ? 'paid' : 'scheduled'}.` : 'All done.', tone: 'done' };
    case 'CANCELLED':
      return { text: `Cancelled${b.cancelReason ? ` — ${b.cancelReason}` : ''}.`, buttonLabel: role === 'RENTER' ? 'Find something else' : undefined, href: role === 'RENTER' ? '/browse' : undefined, tone: 'done' };
  }
}

export type Step = { label: string; state: 'done' | 'now' | 'todo' };

export function progressSteps(b: Pick<Booking, 'status' | 'paymentMode'>, role: ViewerRole): Step[] {
  const labels = role === 'RENTER'
    ? ['Dates agreed', b.paymentMode === 'CASH_AT_PICKUP' ? 'Confirmed' : 'Paid', 'Picked up', 'Returned', 'Deposit back']
    : ['Accepted', b.paymentMode === 'CASH_AT_PICKUP' ? 'Confirmed' : 'Paid', 'Handed over', 'Returned', 'Settled'];
  const at: Record<BookingStatus, number> = { PENDING_PAYMENT: 1, CONFIRMED: 2, PICKED_UP: 3, RETURNED: 4, DISPUTED: 4, RETURN_CONFIRMED: 4, DEPOSIT_REFUNDED: 5, CANCELLED: -1 };
  const n = at[b.status];
  return labels.map((label, i) => ({ label, state: n === -1 ? (i === 0 ? 'done' : 'todo') : i < n ? 'done' : i === n ? 'now' : 'todo' }));
}
