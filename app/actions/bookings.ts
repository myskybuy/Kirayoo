'use server';
import { cancelBooking } from '@/lib/bookings';
import { step } from '@/lib/step';

export async function cancelBookingAction(fd: FormData) {
  const id = String(fd.get('bookingId'));
  await step(id, async ({ user, role }) => {
    const reason = String(fd.get('reason') || '').trim().slice(0, 200);
    await cancelBooking(id, { role, userId: user.id }, reason || (role === 'RENTER' ? 'renter cancelled' : 'owner cancelled'));
    return 'Booking cancelled.';
  });
}
