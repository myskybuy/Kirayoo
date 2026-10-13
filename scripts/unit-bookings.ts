// Unit checks for the pure booking rules (lib/pricing.ts). npm run test:unit
import { countDays, overlaps, quote, rangeError, rentFor, platformFeeFor } from '../lib/pricing';
import { addDays, diffDays, eachDay } from '../lib/format';

let fail = 0;
function check(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  (got ${JSON.stringify(got)}, want ${JSON.stringify(want)})`}`);
}

// Days: max(1, end − start); occupied start..end inclusive.
check('days: same-day rental counts as 1', countDays('2026-10-16', '2026-10-16'), 1);
check('days: 16 → 19 Oct = 3', countDays('2026-10-16', '2026-10-19'), 3);
check('days: across month end', countDays('2026-10-30', '2026-11-02'), 3);
check('occupied days are inclusive', eachDay('2026-10-16', '2026-10-19').length, 4);
check('diffDays negative', diffDays('2026-10-19', '2026-10-16'), -3);
check('addDays leap year', addDays('2028-02-28', 1), '2028-02-29');

// Rent without/with weekly price.
check('rent: daily only', rentFor(3, 1200), 3600);
check('rent: weekly, 7 days', rentFor(7, 1200, 7000), 7000);
check('rent: weekly, 10 days = 1 week + 3 days', rentFor(10, 1200, 7000), 7000 + 3600);
check('rent: weekly, 6 days stays daily', rentFor(6, 1200, 7000), 7200);
check('rent: weekly never more than daily', rentFor(8, 100, 900), 800);
check('rent: 14 days = 2 weeks', rentFor(14, 300, 1500), 3000);

// Quote: total = rent + deposit + delivery; fee hidden from renter.
const q = quote({ pricePerDay: 1200, pricePerWeek: 7000, deposit: 15000 }, '2026-10-16', '2026-10-26', 'DELIVERY', 99, 10);
check('quote: days', q.days, 10);
check('quote: rent', q.rent, 10600);
check('quote: weekly discount', q.weeklyDiscount, 1400);
check('quote: total incl. deposit + delivery', q.total, 10600 + 15000 + 99);
check('quote: platform fee 10% (owner side)', q.platformFee, 1060);
check('quote: pickup has no delivery fee', quote({ pricePerDay: 100, deposit: 500 }, '2026-10-16', '2026-10-17', 'PICKUP', 99).deliveryFee, 0);
check('platform fee rounds', platformFeeFor(1005, 5), 50);

// Range limits.
const item = { minDays: 2, maxDays: 5 };
check('range: start in the past', rangeError(item, '2026-10-10', '2026-10-14', '2026-10-13'), 'The start date is in the past.');
check('range: end before start', rangeError(item, '2026-10-16', '2026-10-15', '2026-10-13'), 'The return date must be after the pickup date.');
check('range: below minDays', rangeError(item, '2026-10-16', '2026-10-17', '2026-10-13'), 'This item is rented for at least 2 days.');
check('range: above maxDays', rangeError(item, '2026-10-16', '2026-10-22', '2026-10-13'), 'This item can be rented for at most 5 days.');
check('range: ok at maxDays', rangeError(item, '2026-10-16', '2026-10-21', '2026-10-13'), null);
check('range: today is allowed', rangeError({ minDays: 1, maxDays: 30 }, '2026-10-13', '2026-10-14', '2026-10-13'), null);

// Overlap (inclusive end date): next booking may start the day after `end`.
check('overlap: same end/start day clashes', overlaps('2026-10-16', '2026-10-19', '2026-10-19', '2026-10-21'), true);
check('overlap: day after end is free', overlaps('2026-10-16', '2026-10-19', '2026-10-20', '2026-10-21'), false);
check('overlap: contained', overlaps('2026-10-16', '2026-10-25', '2026-10-18', '2026-10-19'), true);
check('overlap: before', overlaps('2026-10-16', '2026-10-19', '2026-10-10', '2026-10-15'), false);

console.log(fail ? `\n${fail} FAILED` : '\nAll unit checks passed.');
process.exit(fail ? 1 : 0);
