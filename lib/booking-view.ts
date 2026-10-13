import 'server-only';
import { notFound } from 'next/navigation';
import { prisma } from './db';
import type { SessionUser } from './auth';

export const bookingInclude = {
  item: true,
  renter: true,
  owner: true,
  claim: true,
  extensions: { orderBy: { createdAt: 'desc' } },
  refunds: { orderBy: { createdAt: 'asc' } },
  payout: true,
  reviews: true,
  conditionReports: { orderBy: { createdAt: 'asc' } },
  complaints: { orderBy: { createdAt: 'desc' } },
} as const;

/**
 * Loads a booking for a page. Only its renter or owner may see it
 * (`as` decides which side's page this is). Anyone else → 404.
 */
export async function loadBooking(id: string, user: SessionUser, as: 'RENTER' | 'OWNER') {
  const b = await prisma.booking.findUnique({ where: { id }, include: bookingInclude });
  if (!b) notFound();
  if (as === 'RENTER' && b.renterId !== user.id) notFound();
  if (as === 'OWNER' && b.ownerId !== user.id) notFound();
  return b;
}

export type FullBooking = NonNullable<Awaited<ReturnType<typeof prisma.booking.findUnique<{ where: { id: string }; include: typeof bookingInclude }>>>>;
