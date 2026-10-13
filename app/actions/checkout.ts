'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { DELIVERY_FEE } from '@/lib/constants';
import { confirmCash, BookingError } from '@/lib/bookings';
import type { FormState } from './auth';

const schema = z.object({
  mode: z.enum(['PICKUP', 'DELIVERY']),
  address: z.string().trim().max(300),
  phone: z.string().trim().max(20).refine((v) => /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(v), 'Enter a valid Indian mobile number for the handover.'),
  terms: z.literal('on', { message: 'Please agree to the rental terms.' }),
});

/** R08: choose pickup/delivery (+ address), agree to terms. Then ID gate → payment. */
export async function saveCheckoutAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: 'Please log in again.' };
  const id = String(fd.get('bookingId'));
  const p = schema.safeParse({ mode: fd.get('mode'), address: fd.get('address') ?? '', phone: fd.get('phone') ?? '', terms: fd.get('terms') });
  if (!p.success) return { error: p.error.issues[0].message };
  const b = await prisma.booking.findUnique({ where: { id }, include: { item: true } });
  if (!b || b.renterId !== user.id) return { error: 'Booking not found.' };
  if (b.status !== 'PENDING_PAYMENT') redirect(`/bookings/${b.id}`);
  if (!b.holdExpiresAt || b.holdExpiresAt < new Date()) return { error: 'The 12 h hold has expired. Send a new request in chat.' };
  if (p.data.mode === 'DELIVERY' && !b.item.canDeliver) return { error: 'This owner does not deliver.' };
  if (p.data.mode === 'PICKUP' && !b.item.canPickup) return { error: 'This item is delivery only.' };
  if (p.data.mode === 'DELIVERY' && p.data.address.length < 10) return { error: 'Enter the full delivery address.' };
  const deliveryFee = p.data.mode === 'DELIVERY' ? DELIVERY_FEE : 0;
  // Only while still unpaid: price fields stay the snapshot taken at acceptance.
  const r = await prisma.booking.updateMany({
    where: { id: b.id, status: 'PENDING_PAYMENT' },
    data: { mode: p.data.mode, address: p.data.mode === 'DELIVERY' ? p.data.address : null, deliveryFee, total: b.rentAmount + b.deposit + deliveryFee },
  });
  if (r.count !== 1) redirect(`/bookings/${b.id}`);
  await prisma.user.update({ where: { id: user.id }, data: { phone: p.data.phone, ...(p.data.mode === 'DELIVERY' ? { address: p.data.address } : {}) } });
  if (user.idStatus !== 'VERIFIED') redirect(`/verify-id?next=${encodeURIComponent(`/pay/${b.id}`)}`);
  redirect(`/pay/${b.id}`);
}

/** R11 option 2: pay at pickup (cash / UPI). */
export async function confirmCashAction(fd: FormData) {
  const user = await getUser();
  if (!user) redirect('/login');
  const id = String(fd.get('bookingId'));
  try {
    await confirmCash(id, user.id);
  } catch (e) {
    if (!(e instanceof BookingError)) throw e;
    redirect(`/pay/${id}?error=${encodeURIComponent(e.message)}`);
  }
  redirect(`/bookings/${id}/confirmed`);
}
