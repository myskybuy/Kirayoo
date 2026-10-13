'use server';
import { prisma } from '@/lib/db';
import {
  addConditionReport,
  BookingError,
  cancelBooking,
  confirmReturnOk,
  markNoShow,
  raiseClaim,
  recordPickup,
  recordReturn,
  requestExtension,
  respondClaim,
  respondExtension,
} from '@/lib/bookings';
import { step } from '@/lib/step';
import { isDay, inr } from '@/lib/format';
import { publicUrlExists } from '@/lib/storage';
import { COMPLAINT_REASONS, MAX_CONDITION_PHOTOS } from '@/lib/constants';
import { postSystem } from '@/lib/chat';

const bid = (fd: FormData) => String(fd.get('bookingId'));

async function photosFrom(fd: FormData, field = 'photos', min = 0): Promise<string[]> {
  let list: unknown;
  try {
    list = JSON.parse(String(fd.get(field) ?? '[]'));
  } catch {
    list = [];
  }
  const photos = Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : [];
  if (photos.length < min) throw new BookingError(`Add at least ${min} photo${min > 1 ? 's' : ''}.`);
  if (photos.length > MAX_CONDITION_PHOTOS) throw new BookingError(`Up to ${MAX_CONDITION_PHOTOS} photos.`);
  for (const p of photos) if (!(await publicUrlExists(p))) throw new BookingError('A photo is missing — upload it again.');
  return photos;
}

export async function cancelBookingAction(fd: FormData) {
  const id = bid(fd);
  await step(id, async ({ user, role }) => {
    const reason = String(fd.get('reason') || '').trim().slice(0, 200);
    await cancelBooking(id, { role, userId: user.id }, reason || (role === 'RENTER' ? 'renter cancelled' : 'owner cancelled'));
    return 'Booking cancelled.';
  });
}

/** Condition photos at pickup or return (owner required ≥2; renter optional). */
export async function conditionAction(fd: FormData) {
  const id = bid(fd);
  const stage = fd.get('stage') === 'RETURN' ? 'RETURN' : 'PICKUP';
  await step(id, async ({ user, role }) => {
    const photos = await photosFrom(fd, 'photos', role === 'OWNER' ? 2 : 1);
    await addConditionReport(id, user.id, stage, photos, String(fd.get('notes') || '').trim().slice(0, 500));
    return `${stage === 'PICKUP' ? 'Pickup' : 'Return'} photos saved.`;
  }, '#handover');
}

export async function pickupAction(fd: FormData) {
  const id = bid(fd);
  await step(id, async ({ user, role }) => {
    if (role !== 'OWNER') throw new BookingError('Only the owner enters the pickup code.');
    await recordPickup(id, user.id, String(fd.get('otp') || ''), fd.get('cash') === 'on');
    return 'Handed over — the rental has started.';
  }, '#handover');
}

export async function noShowAction(fd: FormData) {
  const id = bid(fd);
  await step(id, async ({ user, role }) => {
    if (role !== 'OWNER') throw new BookingError('Only the owner can mark a no-show.');
    await markNoShow(id, user.id);
    return 'Marked as no-show. The renter gets the deposit back; 1 day’s rent is yours.';
  });
}

export async function returnAction(fd: FormData) {
  const id = bid(fd);
  await step(id, async ({ user, role }) => {
    if (role !== 'OWNER') throw new BookingError('Only the owner enters the return code.');
    await recordReturn(id, user.id, String(fd.get('otp') || ''));
    return 'Returned. Now check the item: All OK, or claim within 48 h.';
  }, '#confirm');
}

export async function returnOkAction(fd: FormData) {
  const id = bid(fd);
  await step(id, async ({ user, role }) => {
    if (role !== 'OWNER') throw new BookingError('Only the owner confirms the return.');
    await confirmReturnOk(id, { role: 'OWNER', userId: user.id });
    return 'Return confirmed — the deposit is refunded and your payout is created.';
  });
}

export async function claimAction(fd: FormData) {
  const id = bid(fd);
  await step(id, async ({ user, role }) => {
    if (role !== 'OWNER') throw new BookingError('Only the owner can claim.');
    const amount = Number(String(fd.get('amount') || '').replace(/[^\d]/g, ''));
    const lateFee = Number(String(fd.get('lateFee') || '0').replace(/[^\d]/g, '')) || 0;
    const kind = String(fd.get('kind') || 'Damage');
    const reason = `${kind}: ${String(fd.get('reason') || '').trim()}`.slice(0, 600);
    const photos = await photosFrom(fd, 'photos', 0);
    await raiseClaim(id, user.id, { amount, lateFee, reason, photos });
    return `Claim of ${inr(amount)} sent. The renter has 48 h to accept or dispute.`;
  }, '#confirm');
}

export async function respondClaimAction(fd: FormData) {
  const id = bid(fd);
  await step(id, async ({ user, role }) => {
    if (role !== 'RENTER') throw new BookingError('Only the renter answers a claim.');
    const accept = fd.get('answer') === 'accept';
    await respondClaim(id, user.id, accept, String(fd.get('note') || '').trim().slice(0, 600));
    return accept ? 'Claim accepted — the rest of your deposit is being refunded.' : 'Disputed — Kirayo admin will review both condition reports and decide.';
  }, '#claim');
}

export async function requestExtensionAction(fd: FormData) {
  const id = bid(fd);
  await step(id, async ({ user, role }) => {
    if (role !== 'RENTER') throw new BookingError('Only the renter can ask to extend.');
    const newEnd = String(fd.get('newEnd') || '');
    if (!isDay(newEnd)) throw new BookingError('Pick a new return date.');
    await requestExtension(id, user.id, newEnd);
    return 'Extension requested — the owner will accept or decline.';
  }, '#extension');
}

export async function respondExtensionAction(fd: FormData) {
  const id = bid(fd);
  await step(id, async ({ user, role }) => {
    if (role !== 'OWNER') throw new BookingError('Only the owner answers an extension.');
    const accept = fd.get('answer') === 'accept';
    await respondExtension(String(fd.get('extensionId')), user.id, accept);
    return accept ? 'Extension accepted.' : 'Extension declined.';
  }, '#extension');
}

/** "Report a problem" during the rental → Complaint for the admin. */
export async function complaintAction(fd: FormData) {
  const id = bid(fd);
  await step(id, async ({ user }) => {
    const reason = String(fd.get('reason') || '');
    if (!COMPLAINT_REASONS.includes(reason)) throw new BookingError('Choose what the problem is.');
    const text = String(fd.get('text') || '').trim();
    if (text.length < 10) throw new BookingError('Describe the problem in a sentence or two.');
    const photos = await photosFrom(fd, 'photos', 0);
    const b = await prisma.booking.findUniqueOrThrow({ where: { id } });
    if (!['CONFIRMED', 'PICKED_UP', 'RETURNED', 'DISPUTED'].includes(b.status)) throw new BookingError('Problems can be reported while the booking is active.');
    await prisma.complaint.create({ data: { bookingId: id, byUserId: user.id, reason, text: text.slice(0, 1000), photos } });
    await postSystem(prisma, b.conversationId, `${user.id === b.renterId ? 'Renter' : 'Owner'} reported a problem to Kirayo: ${reason}.`, b.id);
    return 'Thanks — Kirayo admin has your report and will get back to you.';
  });
}
