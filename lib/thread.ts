import { prisma } from './db';
import { participant } from './chat';
import { avatarColor, addDays, dayOf, initials, todayIST } from './format';
import { nextStepFor, occupiedDays, progressSteps, STATUS_LABEL } from './bookings';
import { DELIVERY_FEE, QUICK_REPLIES_OWNER, QUICK_REPLIES_RENTER } from './constants';
import type { ThreadData } from './thread-types';

/** Everything the chat screen needs (also returned by the 5 s polling route). */
export async function threadData(conversationId: string, userId: string): Promise<ThreadData> {
  const { conv, role } = await participant(conversationId, userId);
  const today = todayIST();
  const [messages, booking, occ] = await Promise.all([
    prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' }, take: 300 }),
    prisma.booking.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      include: { item: { select: { title: true } }, renter: { select: { name: true } }, owner: { select: { name: true } }, claim: true, extensions: true, refunds: true, payout: true, reviews: { select: { fromUserId: true } } },
    }),
    occupiedDays(conv.itemId, today, addDays(today, 180)),
  ]);
  const other = role === 'RENTER' ? conv.owner : conv.renter;
  const otherReadAt = role === 'RENTER' ? conv.ownerReadAt : conv.renterReadAt;
  const item = conv.item;
  const live = item.status === 'ACTIVE' && !item.deletedAt && conv.owner.idStatus === 'VERIFIED' && !conv.owner.isBlocked;
  return {
    id: conv.id,
    role,
    me: { id: userId, verified: (role === 'RENTER' ? conv.renter : conv.owner).idStatus === 'VERIFIED' },
    other: {
      name: other.name,
      initials: initials(other.name),
      color: avatarColor(other.id),
      sub: `${role === 'RENTER' ? 'Owner' : 'Renter'} · ${other.idStatus === 'VERIFIED' ? 'ID verified' : 'ID not verified yet'}${other.area ? ` · ${other.area}` : ''}`,
    },
    item: { id: item.id, title: item.title, photo: item.photos[0] ?? null, status: item.deletedAt ? 'REMOVED' : item.status, pricePerDay: item.pricePerDay, pricePerWeek: item.pricePerWeek, deposit: item.deposit, minDays: item.minDays, maxDays: item.maxDays, area: item.area, city: item.city, live },
    messages: messages.map((m) => ({
      id: m.id,
      type: m.type,
      text: m.text,
      mine: m.senderId === userId,
      fromRenter: m.senderId === conv.renterId,
      start: m.startDate ? dayOf(m.startDate) : null,
      end: m.endDate ? dayOf(m.endDate) : null,
      requestStatus: m.requestStatus,
      bookingId: m.bookingId,
      createdAt: m.createdAt.toISOString(),
      read: m.senderId === userId && !!otherReadAt && otherReadAt >= m.createdAt,
    })),
    booking: booking
      ? {
          id: booking.id,
          code: booking.code,
          status: booking.status,
          statusLabel: STATUS_LABEL[booking.status],
          holdExpiresAt: booking.holdExpiresAt?.toISOString() ?? null,
          start: dayOf(booking.startDate),
          end: dayOf(booking.endDate),
          total: booking.total,
          next: nextStepFor(booking, role),
          steps: progressSteps(booking, role),
          canCancel: booking.status === 'PENDING_PAYMENT',
          href: role === 'RENTER' ? `/bookings/${booking.id}` : `/owner/bookings/${booking.id}`,
        }
      : null,
    unavailable: [...new Set([...occ.booked, ...occ.blocked])].sort(),
    today,
    deliveryFee: DELIVERY_FEE,
    quickReplies: role === 'RENTER' ? QUICK_REPLIES_RENTER : QUICK_REPLIES_OWNER,
    pendingRequest: messages.some((m) => m.type === 'BOOKING_REQUEST' && m.requestStatus === 'PENDING'),
  };
}
