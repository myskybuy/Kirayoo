import { prisma } from './db';
import { BookingError } from './bookings';
import { assertDealAgreed } from './deal';
import type { User } from '@prisma/client';

/**
 * What the renter is paying for: the booking itself, or an accepted extension.
 * Checks ownership, status, hold, the agreed deal and the ID gate before any
 * order is created.
 */
export async function payTarget(user: User, bookingId: string, extensionId?: string | null) {
  const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { item: true, extensions: true } });
  if (!b || b.renterId !== user.id) throw new BookingError('Booking not found.');
  if (user.idStatus !== 'VERIFIED') throw new BookingError('Verify your ID to pay — usually approved within a few hours.');
  if (extensionId) {
    const ext = b.extensions.find((e) => e.id === extensionId);
    if (!ext) throw new BookingError('Extension not found.');
    if (ext.status !== 'ACCEPTED') throw new BookingError(ext.status === 'PAID' ? 'This extension is already paid.' : 'The owner has not accepted this extension.');
    if (b.status !== 'PICKED_UP') throw new BookingError('The rental is no longer active.');
    return { kind: 'extension' as const, booking: b, ext, amount: ext.extraAmount, receipt: `${b.code}-X` };
  }
  if (b.status !== 'PENDING_PAYMENT') throw new BookingError(b.status === 'CANCELLED' ? 'This booking was cancelled.' : 'This booking is already paid.');
  if (!b.holdExpiresAt || b.holdExpiresAt < new Date()) throw new BookingError('The 12 h hold has expired. Send a new request in chat.');
  await assertDealAgreed(prisma, b.id);
  return { kind: 'booking' as const, booking: b, ext: null, amount: b.total, receipt: b.code };
}
