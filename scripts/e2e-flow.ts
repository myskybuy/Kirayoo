// End-to-end flow through the lib/ functions against the real DB.
// Prints PASS/FAIL per step and removes everything it created.   npm run e2e
process.env.KIRAYO_MAIL_SILENT = '1';
import { PrismaClient, type Item, type User } from '@prisma/client';
import * as B from '../lib/bookings';
import * as C from '../lib/chat';
import { runDueJobs } from '../lib/jobs';
import { payTarget } from '../lib/pay-target';
import { addDays, dayOf, todayIST } from '../lib/format';

const prisma = new PrismaClient();
const TAG = `e2e${Date.now().toString(36)}`;
let failures = 0;
let passes = 0;

function check(name: string, ok: boolean, detail = '') {
  if (ok) passes++;
  else failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail ? `  — ${detail}` : ''}`);
}
async function expectError(name: string, fn: () => Promise<unknown>, match?: RegExp) {
  try {
    await fn();
    check(name, false, 'expected an error, got none');
  } catch (e) {
    const msg = (e as Error).message;
    check(name, !match || match.test(msg), msg);
  }
}

const today = todayIST();
const d = (n: number) => addDays(today, n);

async function user(name: string, verified = true): Promise<User> {
  return prisma.user.create({ data: { email: `${name}.${TAG}@kirayo.test`, name: `${name[0].toUpperCase()}${name.slice(1)} Tester`, city: 'Pune', area: 'Baner', idStatus: verified ? 'VERIFIED' : 'NONE' } });
}
async function item(ownerId: string, o: Partial<Item> = {}): Promise<Item> {
  return prisma.item.create({
    data: { ownerId, title: `E2E item ${TAG}`, category: 'CAMERAS', description: 'End-to-end test item, deleted afterwards.', photos: [], pricePerDay: 500, pricePerWeek: 3000, deposit: 4000, minDays: 1, maxDays: 30, canPickup: true, canDeliver: true, city: 'Pune', area: 'Baner', status: 'ACTIVE', ...o },
  });
}
const booking = (id: string) => prisma.booking.findUniqueOrThrow({ where: { id }, include: { claim: true, refunds: true, payout: true, extensions: true } });
async function request(convId: string, renterId: string, start: string, end: string) {
  await C.sendRequest(convId, renterId, start, end);
  return prisma.message.findFirstOrThrow({ where: { conversationId: convId, type: 'BOOKING_REQUEST', requestStatus: 'PENDING' }, orderBy: { createdAt: 'desc' } });
}

async function main() {
  console.log(`Kirayo e2e (${TAG}) — today ${today}\n`);
  const owner = await user('owner');
  const renter = await user('renter');
  const renter2 = await user('second');
  const it = await item(owner.id);
  const conv = await C.getOrCreateConversation(it.id, renter.id);
  const conv2 = await C.getOrCreateConversation(it.id, renter2.id);

  // --- Request → counter → accept → hold -----------------------------------
  console.log('# Request, counter, accept, hold');
  const r1 = await request(conv.id, renter.id, d(10), d(13));
  check('renter sends a booking request', r1.requestStatus === 'PENDING');
  await expectError('renter cannot accept their own request', () => C.answerRequest(r1.id, renter.id, 'ACCEPT'), /Waiting for the other side/);
  await C.answerRequest(r1.id, owner.id, 'COUNTER', { start: d(11), end: d(14) });
  const counter = await prisma.message.findFirstOrThrow({ where: { conversationId: conv.id, requestStatus: 'PENDING' } });
  check('owner counters → original COUNTERED, new PENDING card from owner', (await prisma.message.findUniqueOrThrow({ where: { id: r1.id } })).requestStatus === 'COUNTERED' && counter.senderId === owner.id && dayOf(counter.startDate!) === d(11));
  // A second renter asks for overlapping dates meanwhile.
  const r2 = await request(conv2.id, renter2.id, d(12), d(15));
  const accepted = await C.answerRequest(counter.id, renter.id, 'ACCEPT');
  const held = await booking(accepted.bookingId!);
  check('renter accepts counter → PENDING_PAYMENT booking with 12 h hold', held.status === 'PENDING_PAYMENT' && !!held.holdExpiresAt && Math.abs(held.holdExpiresAt.getTime() - Date.now() - 12 * 3600000) < 60000);
  check('price snapshot + rent (3 days × ₹500)', held.pricePerDay === 500 && held.pricePerWeek === 3000 && held.rentAmount === 1500 && held.total === 1500 + 4000 && held.days === 3);
  check('overlapping request from another renter auto-declined', (await prisma.message.findUniqueOrThrow({ where: { id: r2.id } })).requestStatus === 'DECLINED');
  check('…with SYSTEM message “Those dates were just booked…”', (await prisma.message.count({ where: { conversationId: conv2.id, type: 'SYSTEM', text: { contains: 'just booked by someone else' } } })) === 1);
  check('held dates are not free', !(await B.isRangeFree(prisma, it.id, d(14), d(16))));
  await expectError('a new request on held dates is refused', () => C.sendRequest(conv2.id, renter2.id, d(13), d(14)), /already booked/);
  const nsR = B.nextStepFor({ ...held, item: it, renter, owner }, 'RENTER');
  const nsO = B.nextStepFor({ ...held, item: it, renter, owner }, 'OWNER');
  check('Next card: renter “Pay to confirm”, owner waits', /Pay to confirm/.test(nsR.text) && nsR.href === `/book/${held.id}` && nsO.tone === 'wait');

  // --- Concurrency: two accepts for overlapping dates ----------------------
  console.log('\n# Two people never get the same dates');
  const it2 = await item(owner.id, { title: `E2E race ${TAG}` });
  const ca = await C.getOrCreateConversation(it2.id, renter.id);
  const cb = await C.getOrCreateConversation(it2.id, renter2.id);
  const ra = await request(ca.id, renter.id, d(20), d(22));
  const rb = await request(cb.id, renter2.id, d(21), d(23));
  const res = await Promise.allSettled([C.answerRequest(ra.id, owner.id, 'ACCEPT'), C.answerRequest(rb.id, owner.id, 'ACCEPT')]);
  const holds = await prisma.booking.count({ where: { itemId: it2.id, status: 'PENDING_PAYMENT' } });
  check('owner accepts two overlapping requests at once → only one hold', holds === 1 && res.filter((x) => x.status === 'fulfilled').length === 1, `holds=${holds}`);

  // --- Hold expiry ----------------------------------------------------------
  console.log('\n# Hold expiry');
  await prisma.booking.update({ where: { id: held.id }, data: { holdExpiresAt: new Date(Date.now() - 1000) } });
  check('expired hold no longer blocks the dates', await B.isRangeFree(prisma, it.id, d(11), d(14)));
  await runDueJobs({ force: true });
  const expired = await booking(held.id);
  check('job cancels it: CANCELLED, reason “payment not completed”', expired.status === 'CANCELLED' && /payment not completed/.test(expired.cancelReason ?? ''));
  check('SYSTEM message posted in chat', (await prisma.message.count({ where: { conversationId: conv.id, type: 'SYSTEM', bookingId: held.id, text: { contains: 'cancelled' } } })) >= 1);

  // --- Cancel a held deal from chat ----------------------------------------
  console.log('\n# Cancel a held deal');
  const r3 = await request(conv.id, renter.id, d(30), d(31));
  const acc3 = await C.answerRequest(r3.id, owner.id, 'ACCEPT');
  await B.cancelBooking(acc3.bookingId!, { role: 'OWNER', userId: owner.id }, 'changed my mind');
  check('owner cancels a held booking → CANCELLED, no money involved', (await booking(acc3.bookingId!)).status === 'CANCELLED' && (await prisma.depositRefund.count({ where: { bookingId: acc3.bookingId! } })) === 0);
  await expectError('a stranger cannot cancel', () => B.cancelBooking(acc3.bookingId!, { role: 'RENTER', userId: renter2.id }, 'x'), /Only the renter|isn’t possible/);

  // --- Withdraw / decline ----------------------------------------------------
  const r4 = await request(conv.id, renter.id, d(40), d(41));
  await C.answerRequest(r4.id, renter.id, 'WITHDRAW');
  check('renter withdraws own request', (await prisma.message.findUniqueOrThrow({ where: { id: r4.id } })).requestStatus === 'WITHDRAWN');
  const r5 = await request(conv.id, renter.id, d(42), d(43));
  await C.answerRequest(r5.id, owner.id, 'DECLINE');
  check('owner declines', (await prisma.message.findUniqueOrThrow({ where: { id: r5.id } })).requestStatus === 'DECLINED');

  await phase6and7({ owner, renter, renter2 });
}

/** Owner accepts a renter request for start..end and returns the held booking. */
async function hold(it: Item, owner: User, renter: User, start: string, end: string) {
  const conv = await C.getOrCreateConversation(it.id, renter.id);
  const m = await request(conv.id, renter.id, start, end);
  const r = await C.answerRequest(m.id, owner.id, 'ACCEPT');
  return booking(r.bookingId!);
}
async function demoPay(b: { id: string; total: number }) {
  return B.confirmPayment(b.id, { mode: 'DEMO', paymentId: `demo_pay_${Math.random().toString(36).slice(2)}`, amount: b.total });
}

async function phase6and7(u: { owner: User; renter: User; renter2: User }) {
  const { owner, renter, renter2 } = u;
  const it = await item(owner.id, { title: `E2E pay ${TAG}`, acceptsCashAtPickup: true });

  // --- ID gate --------------------------------------------------------------
  console.log('\n# Checkout & payment');
  const unverified = await user('unverified', false);
  const hb = await hold(it, owner, unverified, d(3), d(5));
  await expectError('ID gate: unverified renter cannot pay', () => payTarget(unverified, hb.id), /Verify your ID/);
  await expectError('ID gate: unverified renter cannot confirm cash', () => B.confirmCash(hb.id, unverified.id), /Verify your ID/);
  await B.cancelBooking(hb.id, { role: 'RENTER', userId: unverified.id }, 'test');

  // --- Demo pay → CONFIRMED, idempotent --------------------------------------
  const b1 = await hold(it, owner, renter, d(10), d(12));
  check('payTarget accepts a verified renter', (await payTarget(renter, b1.id)).amount === b1.total);
  const pid = `demo_pay_${TAG}`;
  const c1 = await B.confirmPayment(b1.id, { mode: 'DEMO', paymentId: pid, amount: b1.total });
  const after1 = await booking(b1.id);
  check('demo pay → CONFIRMED, amountPaid = total, hold cleared', c1.ok && after1.status === 'CONFIRMED' && after1.amountPaid === b1.total && !after1.holdExpiresAt && after1.paymentMode === 'DEMO');
  const c2 = await B.confirmPayment(b1.id, { mode: 'DEMO', paymentId: pid, amount: b1.total });
  check('duplicate verify with the same payment id is a no-op', c2.ok && 'already' in c2 && !!c2.already && (await prisma.message.count({ where: { bookingId: b1.id, text: { contains: 'received' } } })) === 1);
  check('SYSTEM message posted on confirmation', (await prisma.message.count({ where: { bookingId: b1.id, type: 'SYSTEM', text: { contains: 'is confirmed' } } })) === 1);
  const nsR = B.nextStepFor({ ...after1, item: it, renter, owner }, 'RENTER');
  check('Next card for renter: show pickup OTP', /pickup OTP/i.test(nsR.buttonLabel ?? ''));

  // --- Second renter cannot pay for the same dates -----------------------------
  const a = await hold(it, owner, renter, d(20), d(21));
  await prisma.booking.update({ where: { id: a.id }, data: { holdExpiresAt: new Date(Date.now() - 1000) } }); // A's hold lapsed (job not run yet)
  const bb = await hold(it, owner, renter2, d(20), d(22));
  const late = await B.confirmPayment(a.id, { mode: 'DEMO', paymentId: `demo_pay_late_${TAG}`, amount: a.total });
  const aAfter = await booking(a.id);
  check('late payer for taken dates: not confirmed, booking cancelled', !late.ok && aAfter.status === 'CANCELLED');
  check('…and the full amount is auto-refunded', aAfter.refunds.length === 1 && aAfter.refunds[0].kind === 'CONFLICT' && aAfter.refunds[0].amount === a.total && aAfter.refunds[0].status === 'REFUNDED');
  check('the other renter still pays fine', (await demoPay(bb)).ok && (await booking(bb.id)).status === 'CONFIRMED');
  const bothPaid = await prisma.booking.count({ where: { itemId: it.id, status: 'CONFIRMED', startDate: { lte: new Date(d(22)) }, endDate: { gte: new Date(d(20)) } } });
  check('never two confirmed bookings on the same dates', bothPaid === 1);

  // --- Cash at pickup --------------------------------------------------------
  const cb = await hold(it, owner, renter, d(30), d(32));
  await B.confirmCash(cb.id, renter.id);
  const cAfter = await booking(cb.id);
  check('cash at pickup → CONFIRMED, CASH_AT_PICKUP, nothing paid online', cAfter.status === 'CONFIRMED' && cAfter.paymentMode === 'CASH_AT_PICKUP' && cAfter.amountPaid === 0);
  const noCashItem = await item(owner.id, { title: `E2E nocash ${TAG}`, acceptsCashAtPickup: false });
  const nc = await hold(noCashItem, owner, renter, d(30), d(31));
  await expectError('cash refused when the item does not accept it', () => B.confirmCash(nc.id, renter.id), /does not accept/);

  // --- Cancellation refunds ---------------------------------------------------
  console.log('\n# Cancellation');
  await B.cancelBooking(b1.id, { role: 'RENTER', userId: renter.id }, 'plans changed');
  const k1 = await booking(b1.id);
  check('renter cancels ≥ 24 h before start → full refund', k1.status === 'CANCELLED' && k1.refunds[0]?.amount === k1.amountPaid && k1.refunds[0]?.status === 'REFUNDED' && !k1.payout);
  check('freed dates are available again', await B.isRangeFree(prisma, it.id, d(10), d(12)));
  const lateB = await hold(it, owner, renter, d(0), d(2));
  await demoPay(lateB);
  await B.cancelBooking(lateB.id, { role: 'RENTER', userId: renter.id }, 'sick');
  const k2 = await booking(lateB.id);
  check('renter cancels < 24 h before start → 1 day kept for owner', k2.refunds[0]?.amount === k2.amountPaid - 500 && k2.ownerKeepAmount === 500 && k2.payout?.amount === 500);
  const ob = await hold(it, owner, renter, d(40), d(41));
  await demoPay(ob);
  const before = (await prisma.user.findUniqueOrThrow({ where: { id: owner.id } })).ownerCancellations;
  await B.cancelBooking(ob.id, { role: 'OWNER', userId: owner.id }, 'item broke');
  const k3 = await booking(ob.id);
  check('owner cancels → full refund + recorded on owner', k3.refunds[0]?.amount === k3.amountPaid && (await prisma.user.findUniqueOrThrow({ where: { id: owner.id } })).ownerCancellations === before + 1);

  await phase7({ owner, renter, renter2, it });
}

// Later phases plug in here.
async function phase7(_u: { owner: User; renter: User; renter2: User; it: Item }) {}

async function cleanup() {
  const users = await prisma.user.findMany({ where: { email: { contains: `.${TAG}@` } }, select: { id: true } });
  const ids = users.map((u) => u.id);
  const items = await prisma.item.findMany({ where: { ownerId: { in: ids } }, select: { id: true } });
  const itemIds = items.map((i) => i.id);
  const bookings = await prisma.booking.findMany({ where: { OR: [{ itemId: { in: itemIds } }, { renterId: { in: ids } }] }, select: { id: true } });
  const bIds = bookings.map((b) => b.id);
  await prisma.$transaction([
    prisma.review.deleteMany({ where: { bookingId: { in: bIds } } }),
    prisma.complaint.deleteMany({ where: { bookingId: { in: bIds } } }),
    prisma.payout.deleteMany({ where: { bookingId: { in: bIds } } }),
    prisma.depositRefund.deleteMany({ where: { bookingId: { in: bIds } } }),
    prisma.damageClaim.deleteMany({ where: { bookingId: { in: bIds } } }),
    prisma.extensionRequest.deleteMany({ where: { bookingId: { in: bIds } } }),
    prisma.conditionReport.deleteMany({ where: { bookingId: { in: bIds } } }),
    prisma.booking.deleteMany({ where: { id: { in: bIds } } }),
    prisma.message.deleteMany({ where: { conversation: { itemId: { in: itemIds } } } }),
    prisma.conversation.deleteMany({ where: { itemId: { in: itemIds } } }),
    prisma.blockedDate.deleteMany({ where: { itemId: { in: itemIds } } }),
    prisma.item.deleteMany({ where: { id: { in: itemIds } } }),
    prisma.session.deleteMany({ where: { userId: { in: ids } } }),
    prisma.user.deleteMany({ where: { id: { in: ids } } }),
  ]);
  const left = await prisma.user.count({ where: { email: { contains: `.${TAG}@` } } });
  console.log(`\nCleanup: removed ${ids.length} users, ${itemIds.length} items, ${bIds.length} bookings${left ? ` — ${left} LEFT OVER` : ''}.`);
}

main()
  .catch((e) => {
    failures++;
    console.error('FAIL  crashed:', e);
  })
  .finally(async () => {
    await cleanup().catch((e) => console.error('cleanup failed', e));
    await prisma.$disconnect();
    console.log(`\n${passes} passed, ${failures} failed.`);
    process.exit(failures ? 1 : 0);
  });

export { check, expectError, booking, request, item, user, d, prisma };
