'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { answerRequest, type RequestAction } from '@/lib/chat';
import { BookingError } from '@/lib/bookings';
import { isDay } from '@/lib/format';

/** O04 Accept / Decline / Suggest dates (same rules as in chat). */
export async function answerRequestAction(fd: FormData) {
  const user = await getUser();
  if (!user) redirect('/login?next=/owner/requests');
  const action = String(fd.get('answer')) as RequestAction;
  const start = String(fd.get('start') || '');
  const end = String(fd.get('end') || '');
  let msg = '';
  let ok = '';
  try {
    if (action === 'COUNTER' && (!isDay(start) || !isDay(end))) throw new BookingError('Pick both dates to suggest.');
    await answerRequest(String(fd.get('messageId')), user.id, action, action === 'COUNTER' ? { start, end } : undefined);
    ok = action === 'ACCEPT' ? 'Accepted — the dates are held for 12 h while the renter pays.' : action === 'DECLINE' ? 'Request declined.' : 'Suggested dates sent to the renter.';
  } catch (e) {
    if (!(e instanceof BookingError)) throw e;
    msg = e.message;
  }
  revalidatePath('/owner', 'layout');
  redirect(`/owner/requests?${msg ? `error=${encodeURIComponent(msg)}` : `ok=${encodeURIComponent(ok)}`}`);
}
