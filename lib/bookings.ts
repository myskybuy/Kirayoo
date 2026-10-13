// Kirayo booking rules: pricing, availability/overlap, and (below) the booking
// state machine. Single source of truth — pages, actions, jobs and the e2e
// script all go through here.
import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from './db';
import { addDays, dayOf, eachDay, todayIST, toDbDate } from './format';

export type Tx = Prisma.TransactionClient | PrismaClient;

export * from './pricing';
import { countDays } from './pricing';

// ---------------------------------------------------------------------------
// Availability (DB)
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
export async function occupiedDays(itemId: string, from = todayIST(), to = addDays(todayIST(), 120)) {
  const [blocked, bookings] = await Promise.all([
    prisma.blockedDate.findMany({ where: { itemId, date: { gte: toDbDate(from), lte: toDbDate(to) } }, select: { date: true } }),
    prisma.booking.findMany({
      where: { itemId, startDate: { lte: toDbDate(to) }, endDate: { gte: toDbDate(from) }, ...occupyingWhere() },
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
