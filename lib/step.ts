import 'server-only';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from './db';
import { getUser, type SessionUser } from './auth';
import { BookingError } from './bookings';

type Role = 'RENTER' | 'OWNER';

/** Loads the booking and the caller's side; throws if the caller is neither. */
export async function sideOf(bookingId: string): Promise<{ user: SessionUser; role: Role; page: string }> {
  const user = await getUser();
  if (!user) redirect('/login');
  const b = await prisma.booking.findUnique({ where: { id: bookingId }, select: { renterId: true, ownerId: true } });
  if (!b) throw new BookingError('Booking not found.');
  if (b.renterId === user.id) return { user, role: 'RENTER', page: `/bookings/${bookingId}` };
  if (b.ownerId === user.id) return { user, role: 'OWNER', page: `/owner/bookings/${bookingId}` };
  throw new BookingError('Booking not found.');
}

/** Runs a booking step and returns to the booking page with a message. */
export async function step(bookingId: string, fn: (ctx: { user: SessionUser; role: Role }) => Promise<string>, anchor = '') {
  let page = `/bookings/${bookingId}`;
  let q = '';
  try {
    const s = await sideOf(bookingId);
    page = s.page;
    q = `ok=${encodeURIComponent(await fn(s))}`;
  } catch (e) {
    if (!(e instanceof BookingError)) throw e;
    q = `error=${encodeURIComponent(e.message)}`;
  }
  revalidatePath('/', 'layout');
  redirect(`${page}?${q}${anchor}`);
}

