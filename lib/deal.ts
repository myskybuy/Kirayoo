// "Deal pakki": a booking may be paid only when both sides agreed in chat —
// one side proposed the dates (request or counter) and the other accepted
// that exact card. The accepted card carries the booking id.
import type { Prisma, PrismaClient } from '@prisma/client';
import { BookingError } from './bookings';

type Db = PrismaClient | Prisma.TransactionClient;

export type Deal = { proposedBy: 'RENTER' | 'OWNER'; proposedAt: Date };

export async function agreedDeal(db: Db, bookingId: string): Promise<Deal | null> {
  const m = await db.message.findFirst({
    where: { bookingId, type: 'BOOKING_REQUEST', requestStatus: 'ACCEPTED' },
    include: { conversation: { select: { renterId: true } } },
  });
  if (!m) return null;
  return { proposedBy: m.senderId === m.conversation.renterId ? 'RENTER' : 'OWNER', proposedAt: m.createdAt };
}

export async function assertDealAgreed(db: Db, bookingId: string) {
  if (!(await agreedDeal(db, bookingId))) throw new BookingError('Payment opens only after you and the owner both agree the dates in chat.');
}
