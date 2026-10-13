// Time-based work. runDueJobs() runs at the start of the relevant pages
// (throttled to once a minute per server process) and from
// GET /api/cron?secret=CRON_SECRET.
import { prisma } from './db';
import { mail } from './mail';
import { addDays, todayIST, toDbDate } from './format';
import { BookingError, confirmReturnOk, expireHold, lateDays, respondClaim, settleDeposit } from './bookings';
import { CLAIM_RESPONSE_HOURS, RETURN_CONFIRM_HOURS } from './constants';

let lastRun = 0;
let running: Promise<JobReport> | null = null;

export type JobReport = { holdsExpired: number; autoConfirmed: number; claimsAutoAccepted: number; reminders: number; settlements: number; errors: string[] };

export async function runDueJobs(opts: { force?: boolean; now?: Date } = {}): Promise<JobReport | null> {
  if (!opts.force && Date.now() - lastRun < 60_000) return null;
  if (running) return running;
  lastRun = Date.now();
  running = doJobs(opts.now ?? new Date()).finally(() => {
    running = null;
  });
  return running;
}

async function safe(report: JobReport, label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    return true;
  } catch (e) {
    // A BookingError here usually means someone acted at the same moment — fine.
    if (!(e instanceof BookingError)) report.errors.push(`${label}: ${(e as Error).message}`);
    return false;
  }
}

async function doJobs(now: Date): Promise<JobReport> {
  const r: JobReport = { holdsExpired: 0, autoConfirmed: 0, claimsAutoAccepted: 0, reminders: 0, settlements: 0, errors: [] };
  const today = todayIST(now);

  // 1. Expire payment holds → CANCELLED, dates freed, SYSTEM message.
  for (const b of await prisma.booking.findMany({ where: { status: 'PENDING_PAYMENT', holdExpiresAt: { lte: now } }, select: { id: true } }))
    if (await safe(r, `hold ${b.id}`, () => expireHold(b.id))) r.holdsExpired++;

  // 2. 48 h after return with no owner action and no claim → auto "All OK".
  const cutoff = new Date(now.getTime() - RETURN_CONFIRM_HOURS * 3600000);
  for (const b of await prisma.booking.findMany({ where: { status: 'RETURNED', returnedAt: { lte: cutoff }, claim: null }, select: { id: true } }))
    if (await safe(r, `auto-ok ${b.id}`, () => confirmReturnOk(b.id, { role: 'SYSTEM' }, true))) r.autoConfirmed++;

  // 3. Claim with no renter answer for 48 h → auto-accept.
  const claimCutoff = new Date(now.getTime() - CLAIM_RESPONSE_HOURS * 3600000);
  for (const c of await prisma.damageClaim.findMany({ where: { status: 'OPEN', createdAt: { lte: claimCutoff }, booking: { status: 'RETURNED' } }, select: { bookingId: true, booking: { select: { renterId: true } } } }))
    if (await safe(r, `claim ${c.bookingId}`, () => respondClaim(c.bookingId, c.booking.renterId, true, '', true))) r.claimsAutoAccepted++;

  // 4. Settlements stuck in RETURN_CONFIRMED with no failed refund (e.g. a crash mid-way).
  for (const b of await prisma.booking.findMany({ where: { status: 'RETURN_CONFIRMED', refunds: { none: { status: 'FAILED' } } }, select: { id: true } }))
    if (await safe(r, `settle ${b.id}`, () => settleDeposit(b.id))) r.settlements++;

  // 5. Reminder emails: pickup tomorrow, return tomorrow, overdue (daily).
  const tomorrow = toDbDate(addDays(today, 1));
  for (const b of await prisma.booking.findMany({ where: { status: 'CONFIRMED', startDate: tomorrow, pickupReminderAt: null }, include: { item: true, renter: true, owner: true } })) {
    await mail.pickupTomorrow(b.renter.email, b.item.title, `/bookings/${b.id}`);
    await mail.pickupTomorrow(b.owner.email, b.item.title, `/owner/bookings/${b.id}`);
    await prisma.booking.update({ where: { id: b.id }, data: { pickupReminderAt: now } });
    r.reminders++;
  }
  for (const b of await prisma.booking.findMany({ where: { status: 'PICKED_UP', endDate: tomorrow, returnReminderAt: null }, include: { item: true, renter: true } })) {
    await mail.returnTomorrow(b.renter.email, b.item.title, `/bookings/${b.id}`);
    await prisma.booking.update({ where: { id: b.id }, data: { returnReminderAt: now } });
    r.reminders++;
  }
  for (const b of await prisma.booking.findMany({ where: { status: 'PICKED_UP', endDate: { lt: toDbDate(today) } }, include: { item: true, renter: true } })) {
    if (b.overdueMailAt && todayIST(b.overdueMailAt) === today) continue;
    await mail.overdue(b.renter.email, b.item.title, lateDays(b, now), `/bookings/${b.id}`);
    await prisma.booking.update({ where: { id: b.id }, data: { overdueMailAt: now } });
    r.reminders++;
  }
  return r;
}
