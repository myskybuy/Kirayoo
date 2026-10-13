'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { ID_DOC_TYPES, HOLD_HOURS } from '@/lib/constants';
import { privateUrlExists } from '@/lib/storage';
import { postSystem } from '@/lib/chat';
import type { FormState } from './auth';

export async function submitIdAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: 'Please log in again.' };
  if (user.idStatus === 'VERIFIED') return { error: 'Your ID is already verified.' };
  if (user.idStatus === 'PENDING') return { error: 'Your ID is already under review.' };
  const type = String(fd.get('docType') || '');
  const doc = String(fd.get('doc') || '');
  const selfie = String(fd.get('selfie') || '');
  if (!(ID_DOC_TYPES as readonly string[]).includes(type)) return { error: 'Choose the type of ID.' };
  if (!doc || !(await privateUrlExists(doc, user.id))) return { error: 'Upload a photo of your ID.' };
  if (!selfie || !(await privateUrlExists(selfie, user.id))) return { error: 'Add a selfie.' };
  if (doc === selfie) return { error: 'The ID photo and the selfie must be different images.' };
  if (fd.get('consent') !== 'on') return { error: 'Please agree to the ID check terms.' };

  const now = new Date();
  await prisma.user.update({
    where: { id: user.id },
    data: { idStatus: 'PENDING', idDocType: type, idDocPath: doc, selfiePath: selfie, idSubmittedAt: now, idRejectReason: null, idReviewedAt: null },
  });
  // Submitting the ID extends any live payment hold by 12 h.
  const holds = await prisma.booking.findMany({ where: { renterId: user.id, status: 'PENDING_PAYMENT', holdExpiresAt: { gt: now } } });
  for (const b of holds) {
    await prisma.booking.update({ where: { id: b.id }, data: { holdExpiresAt: new Date(b.holdExpiresAt!.getTime() + HOLD_HOURS * 3600000) } });
    await postSystem(prisma, b.conversationId, `Renter submitted their ID for review — the payment hold was extended by ${HOLD_HOURS} h.`, b.id);
  }
  revalidatePath('/', 'layout');
  const n = String(fd.get('next') || '');
  redirect(`/verify-id?submitted=1${n.startsWith('/') && !n.startsWith('//') ? `&next=${encodeURIComponent(n)}` : ''}`);
}
