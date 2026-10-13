// End-to-end flow through the lib/ functions against the real DB.
// Prints PASS/FAIL per step and removes everything it created.   npm run e2e
process.env.KIRAYO_MAIL_SILENT = '1';
import { PrismaClient, type Item, type User } from '@prisma/client';
import * as B from '../lib/bookings';
import * as C from '../lib/chat';
import { runDueJobs } from '../lib/jobs';
import { payTarget } from '../lib/pay-target';
import { submitReview } from '../lib/reviews';
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

const PHOTOS = ['/demo/tent-1.jpg', '/demo/tent-2.jpg'];

async function phase7(u: { owner: User; renter: User; renter2: User; it: Item }) {
  const { owner, renter, renter2 } = u;
  const it = await item(owner.id, { title: `E2E handover ${TAG}`, pricePerDay: 400, pricePerWeek: null, deposit: 3000 });

  // --- Pickup ---------------------------------------------------------------
  console.log('\n# Pickup handover');
  const b = await hold(it, owner, renter, d(0), d(3));
  await demoPay(b);
  const bk = await booking(b.id);
  await expectError('pickup needs ≥2 owner condition photos first', () => B.recordPickup(b.id, owner.id, bk.pickupOtp, false), /at least 2 condition photos/);
  await B.addConditionReport(b.id, owner.id, 'PICKUP', PHOTOS, 'small scuff');
  await B.addConditionReport(b.id, renter.id, 'PICKUP', [PHOTOS[0]], '');
  await expectError('wrong pickup OTP is rejected', () => B.recordPickup(b.id, owner.id, '0000' === bk.pickupOtp ? '1111' : '0000', false), /not right/);
  await expectError('the renter cannot enter the code', () => B.recordPickup(b.id, renter.id, bk.pickupOtp, false), /Only the owner/);
  await B.recordPickup(b.id, owner.id, bk.pickupOtp, false);
  check('right pickup OTP → PICKED_UP with timestamp', (await booking(b.id)).status === 'PICKED_UP' && !!(await booking(b.id)).pickedUpAt);
  check('return OTP differs from pickup OTP', bk.returnOtp !== bk.pickupOtp);

  // --- Extension --------------------------------------------------------------
  console.log('\n# Extension');
  const ext = await B.requestExtension(b.id, renter.id, d(5));
  check('extension quote: +2 days × ₹400 = ₹800', ext.extraDays === 2 && ext.extraAmount === 800 && ext.status === 'PENDING');
  await expectError('a second open extension request is refused', () => B.requestExtension(b.id, renter.id, d(6)), /already open/);
  await B.respondExtension(ext.id, owner.id, true);
  check('owner accepts → ACCEPTED, waiting for online payment', (await prisma.extensionRequest.findUniqueOrThrow({ where: { id: ext.id } })).status === 'ACCEPTED' && dayOf((await booking(b.id)).endDate) === d(3));
  const blocker = await hold(it, owner, renter2, d(6), d(7));
  check('dates after the extension can still be booked by others', blocker.status === 'PENDING_PAYMENT');
  await B.payExtension(ext.id, renter.id, `demo_pay_ext_${TAG}`);
  const be = await booking(b.id);
  check('extension paid → endDate + rentAmount updated', dayOf(be.endDate) === d(5) && be.rentAmount === 1200 + 800 && be.extensionAmount === 800 && be.days === 5);
  await B.payExtension(ext.id, renter.id, `demo_pay_ext_${TAG}`);
  check('paying the same extension twice is a no-op', (await booking(b.id)).rentAmount === 2000);
  await expectError('cannot extend into booked dates', () => B.requestExtension(b.id, renter.id, d(7)), /already booked/);

  // --- Return + claim + dispute + admin decision -------------------------------
  console.log('\n# Return, claim, dispute, admin decision');
  await expectError('return needs ≥2 return photos', () => B.recordReturn(b.id, owner.id, be.returnOtp), /at least 2 condition photos at return/);
  await B.addConditionReport(b.id, owner.id, 'RETURN', PHOTOS, '');
  await expectError('wrong return OTP is rejected', () => B.recordReturn(b.id, owner.id, be.pickupOtp), /not right/);
  await B.recordReturn(b.id, owner.id, be.returnOtp);
  check('right return OTP → RETURNED', (await booking(b.id)).status === 'RETURNED');
  await expectError('claim above the deposit is refused', () => B.raiseClaim(b.id, owner.id, { amount: 3001, lateFee: 0, reason: 'Broken leg', photos: [] }), /at most the deposit/);
  await B.raiseClaim(b.id, owner.id, { amount: 1000, lateFee: 0, reason: 'Damage: torn rain fly', photos: [PHOTOS[0]] });
  check('claim OPEN, booking stays RETURNED', (await booking(b.id)).claim?.status === 'OPEN');
  await expectError('dispute needs a note', () => B.respondClaim(b.id, renter.id, false, ''), /why you disagree/);
  await B.respondClaim(b.id, renter.id, false, 'It was already torn at pickup — see my photo.');
  check('renter disputes → DISPUTED', (await booking(b.id)).status === 'DISPUTED' && (await booking(b.id)).claim?.status === 'DISPUTED');
  await expectError('admin cannot decide more than the claim', () => B.decideDispute(b.id, owner.id, 1500, ''), /between ₹0 and/);
  await B.decideDispute(b.id, owner.id, 600, 'Partly pre-existing');
  const done = await booking(b.id);
  const depRefund = done.refunds.find((r) => r.kind === 'DEPOSIT');
  check('admin decision → DEPOSIT_REFUNDED', done.status === 'DEPOSIT_REFUNDED' && done.claim?.status === 'RESOLVED');
  check('refund = deposit − decided amount (₹3,000 − ₹600 = ₹2,400)', depRefund?.amount === 2400 && depRefund.status === 'REFUNDED');
  check('payout = rent incl. extension − fee + claim (₹2,000 + ₹600)', done.payout?.amount === 2000 - done.platformFee + 600 && done.payout.status === 'PENDING');
  const nsR = B.nextStepFor({ ...done, item: it, renter, owner, reviews: [] }, 'RENTER');
  check('Next card after refund: rate the owner', /Rate/.test(nsR.buttonLabel ?? ''));

  // --- Jobs: 48 h auto-OK and claim auto-accept --------------------------------
  console.log('\n# 48 h jobs');
  const j1 = await hold(it, owner, renter, d(10), d(10));
  await demoPay(j1);
  await prisma.booking.update({ where: { id: j1.id }, data: { status: 'RETURNED', returnedAt: new Date(Date.now() - 49 * 3600000), pickedUpAt: new Date() } });
  const j2 = await hold(it, owner, renter, d(12), d(12));
  await demoPay(j2);
  await prisma.booking.update({ where: { id: j2.id }, data: { status: 'RETURNED', returnedAt: new Date(Date.now() - 50 * 3600000), pickedUpAt: new Date() } });
  await prisma.damageClaim.create({ data: { bookingId: j2.id, amount: 500, reason: 'Late return', createdAt: new Date(Date.now() - 49 * 3600000) } });
  await runDueJobs({ force: true });
  const a1 = await booking(j1.id);
  const a2 = await booking(j2.id);
  check('no owner action for 48 h → auto-OK → full deposit refunded', a1.status === 'DEPOSIT_REFUNDED' && a1.refunds.find((r) => r.kind === 'DEPOSIT')?.amount === 3000);
  check('no renter answer for 48 h → claim auto-accepted, refund = deposit − claim', a2.status === 'DEPOSIT_REFUNDED' && a2.claim?.status === 'ACCEPTED' && a2.refunds.find((r) => r.kind === 'DEPOSIT')?.amount === 2500 && a2.payout?.amount === 400 + 500);

  // --- Cash at pickup, full path -----------------------------------------------
  console.log('\n# Cash at pickup path');
  const cashItem = await item(owner.id, { title: `E2E cash ${TAG}`, acceptsCashAtPickup: true, pricePerDay: 300, pricePerWeek: null, deposit: 2000 });
  const c = await hold(cashItem, owner, renter, d(0), d(1));
  await B.confirmCash(c.id, renter.id);
  const cb = await booking(c.id);
  await B.addConditionReport(c.id, owner.id, 'PICKUP', PHOTOS, '');
  await expectError('cash booking: must tick “I collected ₹X”', () => B.recordPickup(c.id, owner.id, cb.pickupOtp, false), /I collected/);
  await B.recordPickup(c.id, owner.id, cb.pickupOtp, true);
  check('cash collected recorded at pickup', (await booking(c.id)).cashCollected && (await booking(c.id)).amountPaid === cb.total);
  await B.addConditionReport(c.id, owner.id, 'RETURN', PHOTOS, '');
  await B.recordReturn(c.id, owner.id, cb.returnOtp);
  await B.confirmReturnOk(c.id, { role: 'OWNER', userId: owner.id });
  const cDone = await booking(c.id);
  check('cash: settled without refund API or payout', cDone.status === 'DEPOSIT_REFUNDED' && cDone.refunds.length === 0 && !cDone.payout);

  // --- No-show ---------------------------------------------------------------
  console.log('\n# No-show');
  const ns = await hold(it, owner, renter, d(0), d(2));
  await demoPay(ns);
  await expectError('no-show not allowed on the pickup day itself', () => B.markNoShow(ns.id, owner.id), /You can mark a no-show from/);
  await prisma.booking.update({ where: { id: ns.id }, data: { startDate: new Date(d(-1)) } }); // pickup was yesterday
  await B.markNoShow(ns.id, owner.id);
  const nsb = await booking(ns.id);
  check('no-show → CANCELLED, 1 day kept, rest refunded', nsb.status === 'CANCELLED' && nsb.ownerKeepAmount === 400 && nsb.refunds[0]?.amount === nsb.amountPaid - 400 && nsb.payout?.amount === 400);

  await phase9({ owner, renter, booking: done });
}

async function phase9(u: { owner: User; renter: User; booking: { id: string } }) {
  const { owner, renter, booking: done } = u;
  console.log('\n# Reviews');
  await submitReview(done.id, renter.id, 5, ['On time', 'Friendly', 'Not a real tag'], 'Smooth rental.');
  const rv = await prisma.review.findFirstOrThrow({ where: { bookingId: done.id, fromUserId: renter.id } });
  check('renter rates owner (+ item), unknown tags dropped', rv.toUserId === owner.id && !!rv.itemId && rv.tags.length === 2);
  await expectError('one review per side', () => submitReview(done.id, renter.id, 4, [], ''), /already reviewed/);
  await submitReview(done.id, owner.id, 4, ['Returned on time'], 'Careful renter.');
  check('owner rates renter (no item)', !!(await prisma.review.findFirst({ where: { bookingId: done.id, fromUserId: owner.id, toUserId: renter.id, itemId: null } })));
  const it = await item(owner.id, { title: `E2E review gate ${TAG}` });
  const early = await hold(it, owner, renter, d(50), d(51));
  await expectError('no review before the return is confirmed', () => submitReview(early.id, renter.id, 5, [], ''), /after the return is confirmed/);
  const b = await booking(done.id);
  const ns = B.nextStepFor({ ...b, item: it, renter, owner, reviews: await prisma.review.findMany({ where: { bookingId: done.id } }) }, 'RENTER');
  check('Next card after both reviews: all done', ns.tone === 'done');
}

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
