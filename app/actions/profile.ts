'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getUser } from '@/lib/auth';
import type { FormState } from './auth';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(80),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === '' || /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(v), 'Enter a valid Indian mobile number.'),
  address: z.string().trim().max(300),
});

export async function updateProfileAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: 'Please log in again.' };
  const p = schema.safeParse({ name: fd.get('name'), phone: fd.get('phone') ?? '', address: fd.get('address') ?? '' });
  if (!p.success) return { error: p.error.issues[0].message };
  await prisma.user.update({
    where: { id: user.id },
    data: { name: p.data.name, phone: p.data.phone || null, address: p.data.address || null },
  });
  revalidatePath('/profile');
  return { ok: 'Saved.' };
}
