'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { BookingError } from '@/lib/bookings';
import { submitReview } from '@/lib/reviews';

export async function reviewAction(fd: FormData) {
  const user = await getUser();
  if (!user) redirect('/login');
  const id = String(fd.get('bookingId'));
  const back = String(fd.get('back') || '');
  const safeBack = back.startsWith('/bookings/') || back.startsWith('/owner/') ? back : `/bookings/${id}`;
  let tags: string[] = [];
  try {
    tags = JSON.parse(String(fd.get('tags') || '[]'));
  } catch {
    tags = [];
  }
  let q: string;
  try {
    await submitReview(id, user.id, Number(fd.get('rating')), Array.isArray(tags) ? tags.map(String) : [], String(fd.get('text') || ''));
    q = `ok=${encodeURIComponent('Thanks for your review!')}`;
  } catch (e) {
    if (!(e instanceof BookingError)) throw e;
    q = `error=${encodeURIComponent(e.message)}`;
  }
  revalidatePath('/', 'layout');
  redirect(`${safeBack}${safeBack.includes('?') ? '&' : '?'}${q}`);
}
