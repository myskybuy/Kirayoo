import { prisma } from './db';
import { addDays, todayIST, toDbDate } from './format';
import type { SessionUser } from './auth';

export type ActionBadge = { count: number; href: string; title: string };

/** Unread chat messages for the user (messages after their last read, not sent by them). */
export async function unreadCount(userId: string): Promise<number> {
  const convs = await prisma.conversation.findMany({
    where: { OR: [{ renterId: userId }, { ownerId: userId }] },
    select: { id: true, renterId: true, renterReadAt: true, ownerReadAt: true },
  });
  if (!convs.length) return 0;
  const counts = await Promise.all(
    convs.map((c) => {
      const readAt = c.renterId === userId ? c.renterReadAt : c.ownerReadAt;
      return prisma.message.count({
        where: {
          conversationId: c.id,
          OR: [{ senderId: null }, { senderId: { not: userId } }],
          ...(readAt ? { createdAt: { gt: readAt } } : {}),
        },
      });
    }),
  );
  return counts.reduce((a, b) => a + b, 0);
}

/** Things this person must act on, with a link straight to the right list. */
export async function actionCounts(user: SessionUser) {
  const now = new Date();
  const today = todayIST();
  const tomorrow = toDbDate(addDays(today, 1));
  const [requests, handovers, returnsToConfirm, paymentsDue, returnsDue, countersForMe, claimsForMe] = await Promise.all([
    prisma.message.count({
      where: { type: 'BOOKING_REQUEST', requestStatus: 'PENDING', conversation: { ownerId: user.id }, senderId: { not: user.id } },
    }),
    prisma.booking.count({ where: { ownerId: user.id, status: 'CONFIRMED', startDate: { lte: tomorrow } } }),
    prisma.booking.count({ where: { ownerId: user.id, status: 'RETURNED', claim: null } }),
    prisma.booking.count({ where: { renterId: user.id, status: 'PENDING_PAYMENT', holdExpiresAt: { gt: now } } }),
    prisma.booking.count({ where: { renterId: user.id, status: 'PICKED_UP', endDate: { lte: tomorrow } } }),
    prisma.message.count({
      where: { type: 'BOOKING_REQUEST', requestStatus: 'PENDING', conversation: { renterId: user.id }, senderId: { not: user.id } },
    }),
    prisma.damageClaim.count({ where: { status: 'OPEN', booking: { renterId: user.id } } }),
  ]);
  return { requests, handovers, returnsToConfirm, paymentsDue, returnsDue, countersForMe, claimsForMe };
}

export async function actionBadge(user: SessionUser): Promise<ActionBadge | null> {
  const c = await actionCounts(user);
  const parts: [number, string, string][] = [
    [c.paymentsDue, '/bookings?tab=action', 'payment due'],
    [c.claimsForMe, '/bookings?tab=action', 'claim to answer'],
    [c.returnsDue, '/bookings?tab=action', 'return due'],
    [c.countersForMe, '/chat', 'new dates suggested'],
    [c.requests, '/owner/requests', 'new request'],
    [c.handovers, '/owner/bookings?tab=upcoming', 'booking to hand over'],
    [c.returnsToConfirm, '/owner/bookings?tab=returned', 'return to confirm'],
  ];
  const active = parts.filter((p) => p[0] > 0);
  if (!active.length) return null;
  const count = active.reduce((a, p) => a + p[0], 0);
  return { count, href: active[0][1], title: active.map((p) => `${p[0]} ${p[2]}${p[0] > 1 ? 's' : ''}`).join(', ') };
}
