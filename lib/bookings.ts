// Kirayo booking rules: pricing, availability/overlap, and (below) the booking
// state machine. Single source of truth — pages, actions, jobs and the e2e
// script all go through here.
import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from './db';
import { DELIVERY_FEE, PLATFORM_FEE_PERCENT } from './constants';
import { addDays, dayOf, diffDays, eachDay, isDay, todayIST, toDbDate } from './format';

export type Tx = Prisma.TransactionClient | PrismaClient;

// ---------------------------------------------------------------------------
// Pricing (pure)
// ---------------------------------------------------------------------------

/** days = max(1, end − start). The item is occupied start..end inclusive. */
export function countDays(start: string, end: string): number {
  return Math.max(1, diffDays(start, end));
}

/** Rent with optional weekly price: never more than the plain daily price. */
export function rentFor(days: number, pricePerDay: number, pricePerWeek?: number | null): number {
  const daily = days * pricePerDay;
  if (!pricePerWeek) return daily;
  const weekly = Math.floor(days / 7) * pricePerWeek + (days % 7) * pricePerDay;
  return Math.min(daily, weekly);
}

export function platformFeeFor(rent: number, percent = PLATFORM_FEE_PERCENT): number {
  return Math.round((rent * percent) / 100);
}

export type PriceInput = { pricePerDay: number; pricePerWeek?: number | null; deposit: number };
export type Quote = {
  days: number;
  rent: number;
  dailyTotal: number;
  weeklyDiscount: number;
  deposit: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
};

export function quote(p: PriceInput, start: string, end: string, mode: 'PICKUP' | 'DELIVERY' = 'PICKUP'): Quote {
  const days = countDays(start, end);
  const rent = rentFor(days, p.pricePerDay, p.pricePerWeek);
  const dailyTotal = days * p.pricePerDay;
  const deliveryFee = mode === 'DELIVERY' ? DELIVERY_FEE : 0;
  return {
    days,
    rent,
    dailyTotal,
    weeklyDiscount: dailyTotal - rent,
    deposit: p.deposit,
    deliveryFee,
    platformFee: platformFeeFor(rent),
    total: rent + p.deposit + deliveryFee,
  };
}

/** Checks dates against today (IST) and the item's min/max days. Returns an error message or null. */
export function rangeError(item: { minDays: number; maxDays: number }, start: string, end: string, today = todayIST()): string | null {
  if (!isDay(start) || !isDay(end)) return 'Pick a start and an end date.';
  if (start < today) return 'The start date is in the past.';
  if (end < start) return 'The return date must be after the pickup date.';
  const days = countDays(start, end);
  if (days < item.minDays) return `This item is rented for at least ${item.minDays} day${item.minDays > 1 ? 's' : ''}.`;
  if (days > item.maxDays) return `This item can be rented for at most ${item.maxDays} days.`;
  return null;
}

/** Inclusive date ranges overlap. */
export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

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
