// Reviews: after RETURN_CONFIRMED, the renter rates the owner (which also
// counts for the item) and the owner rates the renter. One review per side.
import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { BookingError } from './bookings';
import { postSystem } from './chat';
import { OWNER_REVIEW_TAGS, RENTER_REVIEW_TAGS } from './constants';

export async function submitReview(bookingId: string, fromUserId: string, rating: number, tags: string[], text: string) {
  const b = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!b || (b.renterId !== fromUserId && b.ownerId !== fromUserId)) throw new BookingError('Booking not found.');
  if (b.status !== 'RETURN_CONFIRMED' && b.status !== 'DEPOSIT_REFUNDED') throw new BookingError('You can review after the return is confirmed.');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new BookingError('Choose 1 to 5 stars.');
  const fromRenter = b.renterId === fromUserId;
  const allowed = fromRenter ? RENTER_REVIEW_TAGS : OWNER_REVIEW_TAGS;
  const clean = [...new Set(tags)].filter((t) => allowed.includes(t));
  try {
    const r = await prisma.review.create({
      data: { bookingId, fromUserId, toUserId: fromRenter ? b.ownerId : b.renterId, itemId: fromRenter ? b.itemId : null, rating, tags: clean, text: text.trim().slice(0, 1000) },
    });
    await postSystem(prisma, b.conversationId, `${fromRenter ? 'Renter' : 'Owner'} left a ${rating}-star review.`, b.id);
    return r;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw new BookingError('You already reviewed this booking.');
    throw e;
  }
}
