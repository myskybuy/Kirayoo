'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { BookingError } from '@/lib/bookings';
import { applyAsOwner } from '@/lib/moderation';
import type { FormState } from './auth';

/** Owner application form (/owner/apply): NONE / REJECTED → PENDING. */
export async function applyOwnerAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: 'Please log in again.' };
  try {
    await applyAsOwner(user.id, {
      name: String(fd.get('name') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      categories: fd.getAll('categories').map(String),
      plans: String(fd.get('plans') ?? ''),
      terms: fd.get('terms') === 'on',
    });
  } catch (e) {
    if (e instanceof BookingError) return { error: e.message };
    throw e;
  }
  revalidatePath('/admin', 'layout');
  redirect('/owner/apply?sent=1');
}
