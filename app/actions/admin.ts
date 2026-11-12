'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { backTo } from '@/lib/admin';
import { postSystem } from '@/lib/chat';
import { mail } from '@/lib/mail';
import { BookingError, cancelBooking, decideDispute, retryRefund } from '@/lib/bookings';
import { inr } from '@/lib/format';
import { approveListing, decideOwnerApplication, rejectListing } from '@/lib/moderation';

async function admin() {
  const u = await getUser();
  if (!u?.isAdmin) throw new Error('Admins only.');
  return u;
}

function withMsg(url: string, key: 'ok' | 'error', msg: string) {
  const u = new URL(url, 'http://x');
  u.searchParams.set(key, msg);
  return u.pathname + u.search;
}

// ---------------- Listings ----------------

export async function approveListingAction(fd: FormData) {
  await admin();
  const back = backTo(fd.get('back'), '/admin/listings');
  await guarded(back, async () => `Approved “${(await approveListing(String(fd.get('id')))).title}”.`);
}

export async function rejectListingAction(fd: FormData) {
  await admin();
  const back = backTo(fd.get('back'), '/admin/listings');
  await guarded(back, async () => {
    const { item, takeDown } = await rejectListing(String(fd.get('id')), String(fd.get('reason') || ''));
    return takeDown ? `Took down “${item.title}”.` : `Sent “${item.title}” back for changes.`;
  });
}

// ---------------- ID verifications ----------------

export async function approveIdAction(fd: FormData) {
  await admin();
  const back = backTo(fd.get('back'), '/admin/ids');
  const u = await prisma.user.findUnique({ where: { id: String(fd.get('id')) } });
  if (!u || u.idStatus !== 'PENDING') redirect(withMsg(back, 'error', 'This ID is not waiting for review.'));
  await prisma.user.update({ where: { id: u.id }, data: { idStatus: 'VERIFIED', idReviewedAt: new Date(), idRejectReason: null } });
  await mail.idApproved(u.email);
  revalidatePath('/admin', 'layout');
  redirect(withMsg(back, 'ok', `Approved ${u.name}.`));
}

export async function rejectIdAction(fd: FormData) {
  await admin();
  const back = backTo(fd.get('back'), '/admin/ids');
  const reason = [String(fd.get('reason') || '').trim(), String(fd.get('note') || '').trim()].filter(Boolean).join('. ');
  if (reason.length < 3) redirect(withMsg(back, 'error', 'Choose a reason.'));
  const u = await prisma.user.findUnique({ where: { id: String(fd.get('id')) } });
  if (!u || u.idStatus !== 'PENDING') redirect(withMsg(back, 'error', 'This ID is not waiting for review.'));
  await prisma.user.update({ where: { id: u.id }, data: { idStatus: 'REJECTED', idReviewedAt: new Date(), idRejectReason: reason } });
  await mail.idRejected(u.email, reason);
  revalidatePath('/admin', 'layout');
  redirect(withMsg(back, 'ok', `Rejected ${u.name}'s ID — they were told why.`));
}

// ---------------- Owner applications ----------------

export async function approveOwnerAction(fd: FormData) {
  await admin();
  const back = backTo(fd.get('back'), '/admin/owners');
  await guarded(back, async () => {
    const u = await decideOwnerApplication(String(fd.get('id')), true);
    await mail.ownerApproved(u.email, u.idStatus === 'VERIFIED');
    return `Approved ${u.name} as an owner.`;
  });
}

export async function rejectOwnerAction(fd: FormData) {
  await admin();
  const back = backTo(fd.get('back'), '/admin/owners');
  await guarded(back, async () => {
    const u = await decideOwnerApplication(String(fd.get('id')), false, String(fd.get('reason') || ''));
    await mail.ownerRejected(u.email, u.ownerRejectReason ?? '');
    return `Rejected ${u.name}'s owner application — they were told why.`;
  });
}

// ---------------- Money: disputes, payouts, refunds ----------------

async function guarded(back: string, fn: () => Promise<string>) {
  let msg: string;
  try {
    msg = withMsg(back, 'ok', await fn());
  } catch (e) {
    if (!(e instanceof BookingError)) throw e;
    msg = withMsg(back, 'error', e.message);
  }
  revalidatePath('/admin', 'layout');
  redirect(msg);
}

export async function decideDisputeAction(fd: FormData) {
  const me = await admin();
  const back = backTo(fd.get('back'), '/admin/disputes');
  await guarded(back, async () => {
    const amount = Number(String(fd.get('amount') ?? '').replace(/[^\d]/g, ''));
    if (String(fd.get('amount') ?? '').trim() === '' || Number.isNaN(amount)) throw new BookingError('Choose the amount that goes to the owner.');
    await decideDispute(String(fd.get('bookingId')), me.id, amount, String(fd.get('note') || '').trim().slice(0, 500));
    return `Dispute closed — ${inr(amount)} to the owner, the rest refunded.`;
  });
}

export async function markPayoutPaidAction(fd: FormData) {
  await admin();
  const back = backTo(fd.get('back'), '/admin/payouts');
  await guarded(back, async () => {
    const ref = String(fd.get('reference') || '').trim();
    if (ref.length < 4) throw new BookingError('Enter the bank / UPI reference of the transfer.');
    const p = await prisma.payout.findUnique({ where: { id: String(fd.get('id')) }, include: { owner: true, booking: { select: { conversationId: true, id: true, code: true } } } });
    if (!p) throw new BookingError('Payout not found.');
    const r = await prisma.payout.updateMany({ where: { id: p.id, status: 'PENDING' }, data: { status: 'PAID', paidAt: new Date(), reference: ref.slice(0, 80) } });
    if (r.count !== 1) throw new BookingError('This payout was already marked paid.');
    await postSystem(prisma, p.booking.conversationId, `Kirayo paid ${inr(p.amount)} to the owner (ref ${ref}).`, p.booking.id);
    await mail.payoutPaid(p.owner.email, inr(p.amount), ref);
    return `Marked ${inr(p.amount)} to ${p.owner.name} as paid.`;
  });
}

export async function retryRefundAction(fd: FormData) {
  await admin();
  const back = backTo(fd.get('back'), '/admin/refunds');
  await guarded(back, async () => {
    const r = await retryRefund(String(fd.get('id')));
    if (r.status !== 'REFUNDED') throw new BookingError(`Refund failed again: ${r.error ?? 'unknown error'}`);
    return `Refunded ${inr(r.amount)} (${r.refundId}).`;
  });
}

export async function adminCancelBookingAction(fd: FormData) {
  const me = await admin();
  const back = backTo(fd.get('back'), '/admin/bookings');
  await guarded(back, async () => {
    const reason = String(fd.get('reason') || '').trim();
    if (reason.length < 3) throw new BookingError('Write a reason — both sides see it.');
    const b = await cancelBooking(String(fd.get('bookingId')), { role: 'ADMIN', userId: me.id }, reason.slice(0, 200));
    return `Cancelled ${b.code}. Any online payment is refunded in full.`;
  });
}

// ---------------- Users ----------------

export async function setBlockedAction(fd: FormData) {
  await admin();
  const back = backTo(fd.get('back'), '/admin/users');
  await guarded(back, async () => {
    const u = await prisma.user.findUnique({ where: { id: String(fd.get('id')) } });
    if (!u) throw new BookingError('User not found.');
    if (u.isAdmin) throw new BookingError('The admin account cannot be blocked.');
    const block = fd.get('block') === '1';
    await prisma.$transaction([
      prisma.user.update({ where: { id: u.id }, data: { isBlocked: block } }),
      ...(block ? [prisma.session.deleteMany({ where: { userId: u.id } })] : []),
    ]);
    return block ? `Blocked ${u.name} — they are logged out and their items are hidden.` : `Unblocked ${u.name}.`;
  });
}

// ---------------- Complaints & contact ----------------

export async function resolveComplaintAction(fd: FormData) {
  await admin();
  const back = backTo(fd.get('back'), '/admin/complaints');
  await guarded(back, async () => {
    const note = String(fd.get('note') || '').trim().slice(0, 500);
    const c = await prisma.complaint.findUnique({ where: { id: String(fd.get('id')) }, include: { booking: true, byUser: true } });
    if (!c) throw new BookingError('Complaint not found.');
    await prisma.complaint.update({ where: { id: c.id }, data: { status: 'RESOLVED', adminNote: note || null } });
    await postSystem(prisma, c.booking.conversationId, `Kirayo admin resolved the reported problem (${c.reason})${note ? `: ${note}` : '.'}`, c.bookingId);
    await mail.status(c.byUser.email, `Your report was resolved · ${c.booking.code}`, `Kirayo admin resolved your report "${c.reason}"${note ? `: ${note}` : '.'}`, `/bookings/${c.bookingId}`);
    return 'Complaint resolved.';
  });
}

export async function resolveContactAction(fd: FormData) {
  await admin();
  const back = backTo(fd.get('back'), '/admin/complaints?tab=contact');
  await guarded(back, async () => {
    await prisma.contactMessage.update({ where: { id: String(fd.get('id')) }, data: { resolved: true, adminNote: String(fd.get('note') || '').trim().slice(0, 500) || null } });
    return 'Message marked resolved.';
  });
}
