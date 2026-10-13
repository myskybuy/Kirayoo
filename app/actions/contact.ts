'use server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import type { FormState } from './auth';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  topic: z.string().trim().max(40),
  booking: z.string().trim().max(20),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters).').max(2000),
});

export async function contactAction(_: FormState, fd: FormData): Promise<FormState> {
  const p = schema.safeParse({ name: fd.get('name'), email: fd.get('email'), topic: fd.get('topic') ?? '', booking: fd.get('booking') ?? '', message: fd.get('message') });
  if (!p.success) return { error: p.error.issues[0].message };
  const v = p.data;
  await prisma.contactMessage.create({ data: { name: v.name, email: v.email, message: `[${v.topic || 'General'}]${v.booking ? ` Booking ${v.booking}.` : ''} ${v.message}` } });
  return { ok: 'Thanks — we usually reply within a working day. Check your email.' };
}
