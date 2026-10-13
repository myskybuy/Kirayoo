// Demo bookings in every status, so every screen can be shown right after
// `npm run setup`. Mostly Riya (renter) ↔ Arjun (owner).
import crypto from 'node:crypto';
import type { BookingStatus, Item, PaymentMode, PrismaClient, User } from '@prisma/client';
import { addDays, todayIST, toDbDate } from '../lib/format';
import { countDays, rentFor } from '../lib/pricing';

const H = 3600000;
const now = () => new Date();
const ago = (h: number) => new Date(Date.now() - h * H);
const d = (n: number) => addDays(todayIST(), n);
const otp = () => String(crypto.randomInt(1000, 10000));
let seq = 0;
const code = () => `KR-${todayIST().slice(0, 4)}-${String(480000 + ++seq * 137).padStart(6, '0')}`;

type Opts = {
  item: Item;
  renter: User;
  start: string;
  end: string;
  status: BookingStatus;
  pay?: PaymentMode | null;
  mode?: 'PICKUP' | 'DELIVERY';
  chat?: string[];
  createdHoursAgo?: number;
};

export async function seedBookings(prisma: PrismaClient, u: { riya: User; arjun: User }) {
  const { riya, arjun } = u;
  const items = await prisma.item.findMany({ where: { ownerId: arjun.id, status: 'ACTIVE' } });
  const it = (title: string) => items.find((i) => i.title.startsWith(title))!;
  const others = await prisma.user.findMany({ where: { email: { endsWith: '@kirayo.test' }, idStatus: 'VERIFIED', isAdmin: false, NOT: { id: { in: [riya.id, arjun.id] } }, city: 'Bengaluru' }, take: 8, orderBy: { email: 'asc' } });
  const PH = (slug: string) => [`/demo/${slug}-1.jpg`, `/demo/${slug}-2.jpg`, `/demo/${slug}-1.jpg`].filter((_, i) => i < 2);

  async function conv(item: Item, renter: User) {
    return prisma.conversation.upsert({ where: { itemId_renterId: { itemId: item.id, renterId: renter.id } }, update: {}, create: { itemId: item.id, renterId: renter.id, ownerId: item.ownerId, createdAt: ago(200) } });
  }
  async function say(convId: string, senderId: string | null, text: string, at: Date, extra: Record<string, unknown> = {}) {
    await prisma.message.create({ data: { conversationId: convId, senderId, type: senderId ? 'TEXT' : 'SYSTEM', text, createdAt: at, readAt: at, ...extra } });
  }

  async function mk(o: Opts) {
    const c = await conv(o.item, o.renter);
    const t0 = o.createdHoursAgo ?? 72;
    const lines = o.chat ?? ['Hi! Is this free for those dates?', 'Yes, it is. Send a booking request.'];
    for (const [i, l] of lines.entries()) await say(c.id, i % 2 === 0 ? o.renter.id : o.item.ownerId, l, ago(t0 + 2 - i * 0.2));
    const days = countDays(o.start, o.end);
    const rent = rentFor(days, o.item.pricePerDay, o.item.pricePerWeek);
    const mode = o.mode ?? 'PICKUP';
    const deliveryFee = mode === 'DELIVERY' ? 99 : 0;
    const total = rent + o.item.deposit + deliveryFee;
    const pay = o.pay === undefined ? 'DEMO' : o.pay;
    const online = pay === 'DEMO' || pay === 'RAZORPAY';
    const paid = o.status !== 'PENDING_PAYMENT' && o.status !== 'CANCELLED';
    const req = await prisma.message.create({ data: { conversationId: c.id, senderId: o.renter.id, type: 'BOOKING_REQUEST', startDate: toDbDate(o.start), endDate: toDbDate(o.end), requestStatus: 'ACCEPTED', createdAt: ago(t0), readAt: ago(t0) } });
    const b = await prisma.booking.create({
      data: {
        code: code(), itemId: o.item.id, renterId: o.renter.id, ownerId: o.item.ownerId, conversationId: c.id,
        startDate: toDbDate(o.start), endDate: toDbDate(o.end), days, pricePerDay: o.item.pricePerDay, pricePerWeek: o.item.pricePerWeek,
        rentAmount: rent, deposit: o.item.deposit, deliveryFee, platformFee: 0, total, mode,
        address: mode === 'DELIVERY' ? riya.address : null, pickupNote: o.item.pickupNote,
        paymentMode: paid ? pay : null, paymentId: paid && online ? `demo_pay_seed_${seq}` : null, amountPaid: paid && online ? total : 0, paidAt: paid ? ago(t0 - 1) : null,
        holdExpiresAt: o.status === 'PENDING_PAYMENT' ? new Date(Date.now() + 9 * H) : null,
        status: o.status, pickupOtp: otp(), returnOtp: otp(), createdAt: ago(t0),
        confirmedAt: paid ? ago(t0 - 1) : null,
      },
    });
    await prisma.message.update({ where: { id: req.id }, data: { bookingId: b.id } });
    await say(c.id, null, `Dates confirmed. ${o.renter.name.split(' ')[0]} has 12 h to pay — the dates are held until then.`, ago(t0 - 0.1), { bookingId: b.id });
    if (paid) await say(c.id, null, pay === 'CASH_AT_PICKUP' ? 'Confirmed with payment at pickup (cash / UPI). The owner collects rent + deposit at handover.' : `Payment of ₹${total.toLocaleString('en-IN')} received — booking ${b.code} is confirmed.`, ago(t0 - 1), { bookingId: b.id });
    await prisma.conversation.update({ where: { id: c.id }, data: { updatedAt: ago(Math.max(0, t0 - 2)), renterReadAt: now(), ownerReadAt: now() } });
    return { b, c, total };
  }

  async function pickedUp(id: string, convId: string, at: Date, slug: string, ownerId: string, renterId: string) {
    await prisma.conditionReport.create({ data: { bookingId: id, stage: 'PICKUP', byUserId: ownerId, photos: PH(slug), notes: 'Small scuff on the side — already there.', createdAt: at } });
    await prisma.conditionReport.create({ data: { bookingId: id, stage: 'PICKUP', byUserId: renterId, photos: [PH(slug)[0]], notes: '', createdAt: at } });
    await prisma.booking.update({ where: { id }, data: { pickedUpAt: at } });
    await say(convId, null, 'Handed over — the renter’s pickup code matched. Enjoy the rental!', at, { bookingId: id });
  }
  async function returned(id: string, convId: string, at: Date, slug: string, ownerId: string) {
    await prisma.conditionReport.create({ data: { bookingId: id, stage: 'RETURN', byUserId: ownerId, photos: PH(slug), notes: '', createdAt: at } });
    await prisma.booking.update({ where: { id }, data: { returnedAt: at } });
    await say(convId, null, 'Returned — the return code matched. The owner has 48 h to confirm “All OK” or raise a claim.', at, { bookingId: id });
  }
  async function settled(id: string, convId: string, at: Date, deposit: number, claim: number, payoutPaid: boolean, rent: number, ownerId: string) {
    await prisma.booking.update({ where: { id }, data: { returnConfirmedAt: at, refundedAt: at } });
    await prisma.depositRefund.create({ data: { bookingId: id, kind: 'DEPOSIT', amount: deposit - claim, status: 'REFUNDED', refundId: `demo_rfnd_seed_${id.slice(-6)}`, refundedAt: at, createdAt: at } });
    await prisma.payout.create({ data: { bookingId: id, ownerId, amount: rent + claim, status: payoutPaid ? 'PAID' : 'PENDING', paidAt: payoutPaid ? new Date(at.getTime() + 48 * H) : null, reference: payoutPaid ? `UTR${String(seq).padStart(4, '0')}7781` : null, createdAt: at } });
    await say(convId, null, `Deposit refund of ₹${(deposit - claim).toLocaleString('en-IN')} sent to the original payment method.`, at, { bookingId: id });
  }

  // 1. Pending booking request in chat (owner must answer).
  {
    const c = await conv(it('Sony A7'), riya);
    await say(c.id, riya.id, 'Hi Arjun! I need the camera for a wedding shoot. Is it free those days?', ago(3));
    await prisma.message.create({ data: { conversationId: c.id, senderId: riya.id, type: 'BOOKING_REQUEST', startDate: toDbDate(d(10)), endDate: toDbDate(d(13)), requestStatus: 'PENDING', createdAt: ago(2.9) } });
    await prisma.conversation.update({ where: { id: c.id }, data: { updatedAt: ago(2.9), renterReadAt: now() } });
  }
  // 2. PENDING_PAYMENT with a live hold.
  await mk({ item: it('Full HD home projector'), renter: riya, start: d(5), end: d(7), status: 'PENDING_PAYMENT', pay: null, createdHoursAgo: 3, chat: ['Is the projector free for a movie night?', 'Yes! Accepted your dates.'] });
  // 3. CONFIRMED, pickup tomorrow (online demo payment, delivery).
  await mk({ item: it('4-person dome tent'), renter: riya, start: d(1), end: d(3), status: 'CONFIRMED', mode: 'DELIVERY', createdHoursAgo: 30, chat: ['Planning a trip to Nandi Hills — is the tent waterproof?', 'Yes, with a rain fly. Delivery works too.'] });
  // 4. Cash-at-pickup booking (CONFIRMED, pay at pickup).
  await mk({ item: it('Bosch 500W'), renter: riya, start: d(2), end: d(4), status: 'CONFIRMED', pay: 'CASH_AT_PICKUP', createdHoursAgo: 20, chat: ['Can I pay cash when I pick up the drill?', 'Sure, cash or UPI at pickup is fine.'] });
  // 5. PICKED_UP, in use.
  {
    const { b, c } = await mk({ item: it('Yamaha acoustic guitar'), renter: riya, start: d(-2), end: d(2), status: 'PICKED_UP', createdHoursAgo: 96 });
    await pickedUp(b.id, c.id, ago(46), 'guitar', arjun.id, riya.id);
  }
  // 6. PICKED_UP and OVERDUE.
  {
    const { b, c } = await mk({ item: it('Mountain bike'), renter: riya, start: d(-6), end: d(-2), status: 'PICKED_UP', createdHoursAgo: 200 });
    await pickedUp(b.id, c.id, ago(140), 'mtb', arjun.id, riya.id);
  }
  // 7. RETURNED, waiting for the owner's check.
  {
    const { b, c } = await mk({ item: it('Aluminium folding ladder'), renter: riya, start: d(-5), end: d(-1), status: 'RETURNED', createdHoursAgo: 180 });
    await pickedUp(b.id, c.id, ago(118), 'ladder', arjun.id, riya.id);
    await returned(b.id, c.id, ago(5), 'ladder', arjun.id);
  }
  // 8. Claim OPEN, waiting for the renter.
  {
    const { b, c } = await mk({ item: it('JBL party speaker'), renter: riya, start: d(-8), end: d(-4), status: 'RETURNED', createdHoursAgo: 260 });
    await pickedUp(b.id, c.id, ago(190), 'speaker', arjun.id, riya.id);
    await returned(b.id, c.id, ago(30), 'speaker', arjun.id);
    await prisma.damageClaim.create({ data: { bookingId: b.id, amount: 1200, reason: 'Damage: the grille has a dent that is not in the pickup photos. Repair quote ₹1,200.', photos: ['/demo/speaker-2.jpg'], createdAt: ago(6) } });
    await say(c.id, null, 'Owner claimed ₹1,200 from the deposit: dented grille. The renter has 48 h to accept or dispute.', ago(6), { bookingId: b.id });
  }
  // 9. DISPUTED, waiting for the admin.
  {
    const renter = others[0] ?? riya;
    const { b, c } = await mk({ item: it('Sony 70–200mm'), renter, start: d(-9), end: d(-6), status: 'DISPUTED', createdHoursAgo: 300 });
    await pickedUp(b.id, c.id, ago(212), 'lens', arjun.id, renter.id);
    await returned(b.id, c.id, ago(70), 'lens', arjun.id);
    await prisma.damageClaim.create({ data: { bookingId: b.id, amount: 800, reason: 'Missing part: rear lens cap is missing. Replacement ₹800.', photos: [], status: 'DISPUTED', renterNote: 'The rear cap was on the lens when I returned it — it was checked in front of me.', createdAt: ago(60) } });
    await say(c.id, null, 'Renter disputed the claim. Kirayo admin will review both condition reports and decide.', ago(40), { bookingId: b.id });
  }
  // 10. Completed (DEPOSIT_REFUNDED) with both reviews, payout PAID.
  {
    const { b, c } = await mk({ item: it('PlayStation 5'), renter: riya, start: d(-20), end: d(-17), status: 'DEPOSIT_REFUNDED', createdHoursAgo: 560 });
    await pickedUp(b.id, c.id, ago(470), 'ps5', arjun.id, riya.id);
    await returned(b.id, c.id, ago(400), 'ps5', arjun.id);
    await settled(b.id, c.id, ago(390), b.deposit, 0, true, b.rentAmount, arjun.id);
    await prisma.review.create({ data: { bookingId: b.id, fromUserId: riya.id, toUserId: arjun.id, itemId: b.itemId, rating: 5, tags: ['Item as described', 'On time', 'Friendly'], text: 'Console was spotless, both controllers charged. Super smooth handover.', createdAt: ago(380) } });
    await prisma.review.create({ data: { bookingId: b.id, fromUserId: arjun.id, toUserId: riya.id, rating: 5, tags: ['Returned on time', 'Careful with item'], text: 'Returned everything packed exactly as given.', createdAt: ago(379) } });
  }
  // 11. Completed with a small accepted claim, payout PENDING (admin can pay it).
  {
    const { b, c } = await mk({ item: it('Carbon travel tripod'), renter: riya, start: d(-14), end: d(-12), status: 'DEPOSIT_REFUNDED', createdHoursAgo: 400 });
    await pickedUp(b.id, c.id, ago(330), 'tripod', arjun.id, riya.id);
    await returned(b.id, c.id, ago(280), 'tripod', arjun.id);
    await prisma.damageClaim.create({ data: { bookingId: b.id, amount: 300, reason: 'Missing part: quick-release plate not returned.', status: 'ACCEPTED', decidedAt: ago(270), createdAt: ago(275) } });
    await settled(b.id, c.id, ago(270), b.deposit, 300, false, b.rentAmount, arjun.id);
    await prisma.review.create({ data: { bookingId: b.id, fromUserId: riya.id, toUserId: arjun.id, itemId: b.itemId, rating: 4, tags: ['Clear instructions'], text: 'Solid tripod. I lost the plate, my bad — sorted fairly.', createdAt: ago(260) } });
  }
  // 12. CANCELLED (renter cancelled ≥ 24 h before, full refund).
  {
    const { b, c, total } = await mk({ item: it('Camping chairs'), renter: riya, start: d(12), end: d(14), status: 'CANCELLED', createdHoursAgo: 50 });
    await prisma.booking.update({ where: { id: b.id }, data: { paymentMode: 'DEMO', paymentId: `demo_pay_seed_c${seq}`, amountPaid: total, paidAt: ago(49), confirmedAt: ago(49), cancelledAt: ago(24), cancelReason: 'plans changed', cancelledBy: 'RENTER' } });
    await prisma.depositRefund.create({ data: { bookingId: b.id, kind: 'CANCELLATION', amount: total, status: 'REFUNDED', refundId: `demo_rfnd_seed_c${seq}`, refundedAt: ago(24), createdAt: ago(24) } });
    await say(c.id, null, 'Booking cancelled by the renter: plans changed.', ago(24), { bookingId: b.id });
  }
  // A problem report for the admin, on the in-use guitar.
  {
    const g = await prisma.booking.findFirst({ where: { itemId: it('Yamaha acoustic guitar').id, status: 'PICKED_UP' } });
    if (g) await prisma.complaint.create({ data: { bookingId: g.id, byUserId: riya.id, reason: 'Item not working', text: 'The low E string snapped on day one. Owner is not replying yet.', photos: [] } });
  }
  // A few more completed rentals so items and owners have ratings.
  const extra: [string, number, string][] = [['Sony A7', 5, 'Great camera, battery lasted all day.'], ['4-person dome tent', 4, 'Dry all night in the rain.'], ['Full HD home projector', 5, 'Bright enough for an evening screening.'], ['Bosch 500W', 5, 'Bits in perfect shape.'], ['Mountain bike', 4, 'Smooth gears, comfy saddle.'], ['Yamaha acoustic guitar', 5, 'Sounds lovely, well looked after.']];
  for (const [i, [title, rating, text]] of extra.entries()) {
    const renter = others[(i + 1) % Math.max(1, others.length)] ?? riya;
    const start = d(-40 - i * 5);
    const { b, c } = await mk({ item: it(title), renter, start, end: addDays(start, 2), status: 'DEPOSIT_REFUNDED', createdHoursAgo: (45 + i * 5) * 24 });
    await prisma.booking.update({ where: { id: b.id }, data: { pickedUpAt: ago((40 + i * 5) * 24), returnedAt: ago((38 + i * 5) * 24), returnConfirmedAt: ago((37 + i * 5) * 24), refundedAt: ago((37 + i * 5) * 24) } });
    await prisma.depositRefund.create({ data: { bookingId: b.id, kind: 'DEPOSIT', amount: b.deposit, status: 'REFUNDED', refundId: `demo_rfnd_x${i}`, refundedAt: ago((37 + i * 5) * 24) } });
    await prisma.payout.create({ data: { bookingId: b.id, ownerId: arjun.id, amount: b.rentAmount, status: 'PAID', paidAt: ago((35 + i * 5) * 24), reference: `UTR90${i}2231` } });
    await prisma.review.create({ data: { bookingId: b.id, fromUserId: renter.id, toUserId: arjun.id, itemId: b.itemId, rating, tags: ['Item as described', 'On time'], text, createdAt: ago((36 + i * 5) * 24) } });
    await prisma.review.create({ data: { bookingId: b.id, fromUserId: arjun.id, toUserId: renter.id, rating: 5, tags: ['Returned on time'], text: 'Easy renter.', createdAt: ago((36 + i * 5) * 24) } });
    void c;
  }
  // Neha (ID pending) asked about an item — chats work before verification.
  const neha = await prisma.user.findUnique({ where: { email: 'neha@kirayo.test' } });
  if (neha) {
    const c = await conv(it('Nintendo Switch') ?? it('Cajon'), neha);
    await say(c.id, neha.id, 'Hi! Does the Switch come with two controllers?', ago(1));
  }
}
