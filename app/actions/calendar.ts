'use server';
import { redirect } from 'next/navigation';
import { setBlockedDayAction } from './items';

/** Owner calendar cell: block/unblock one day, then come back to the same window. */
export async function toggleBlockFormAction(fd: FormData) {
  const itemId = String(fd.get('itemId'));
  const day = String(fd.get('day'));
  await setBlockedDayAction(itemId, day, fd.get('block') === '1');
  redirect(`/owner/calendar?from=${encodeURIComponent(String(fd.get('from') || ''))}`);
}
