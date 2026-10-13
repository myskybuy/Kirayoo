// Pure pricing & date-range rules (no DB) — shared by server and client.
import { diffDays, isDay, todayIST } from './format';

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

export function platformFeeFor(rent: number, percent: number): number {
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

/** deliveryFee/feePercent come from env on the server and are passed down to the client. */
export function quote(p: PriceInput, start: string, end: string, mode: 'PICKUP' | 'DELIVERY', deliveryFeeFlat: number, feePercent = 0): Quote {
  const days = countDays(start, end);
  const rent = rentFor(days, p.pricePerDay, p.pricePerWeek);
  const dailyTotal = days * p.pricePerDay;
  const deliveryFee = mode === 'DELIVERY' ? deliveryFeeFlat : 0;
  return {
    days,
    rent,
    dailyTotal,
    weeklyDiscount: dailyTotal - rent,
    deposit: p.deposit,
    deliveryFee,
    platformFee: platformFeeFor(rent, feePercent),
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

