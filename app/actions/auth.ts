'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { createSession, destroySession } from '@/lib/auth';
import { requestOtp, verifyOtp } from '@/lib/otp';

const PENDING_COOKIE = 'kirayo_otp';

export type FormState = { error?: string; ok?: string } | undefined;

type Pending = { email: string; next: string; devCode?: string; name?: string };

async function setPending(p: Pending) {
  (await cookies()).set(PENDING_COOKIE, JSON.stringify(p), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 15 * 60 });
}

export async function getPending(): Promise<Pending | null> {
  const raw = (await cookies()).get(PENDING_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Pending;
  } catch {
    return null;
  }
}

/** Only allow same-site relative paths after login. */
function safeNext(n: unknown): string {
  return typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : '/';
}

const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address.');
const nameSchema = z.string().trim().min(2, 'Enter your full name.').max(80);

export async function sendCodeAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = emailSchema.safeParse(fd.get('email'));
  if (!email.success) return { error: email.error.issues[0].message };
  const next = safeNext(fd.get('next'));
  const signupName = fd.get('name');
  let name: string | undefined;
  if (signupName !== null) {
    const n = nameSchema.safeParse(signupName);
    if (!n.success) return { error: n.error.issues[0].message };
    name = n.data;
  }
  const user = await prisma.user.findUnique({ where: { email: email.data } });
  if (user?.isBlocked) return { error: 'This account is blocked. Please contact Kirayo support.' };
  const res = await requestOtp(email.data, user ? 'LOGIN' : 'SIGNUP', name);
  if (!res.ok) return { error: res.error };
  await setPending({ email: email.data, next, devCode: res.devCode, name });
  redirect('/verify');
}

export async function resendCodeAction(): Promise<FormState> {
  const p = await getPending();
  if (!p) redirect('/login');
  const user = await prisma.user.findUnique({ where: { email: p.email } });
  const res = await requestOtp(p.email, user ? 'LOGIN' : 'SIGNUP', p.name);
  if (!res.ok) return { error: res.error };
  await setPending({ ...p, devCode: res.devCode });
  return { ok: 'A new code is on its way.' };
}

export async function verifyCodeAction(_: FormState, fd: FormData): Promise<FormState> {
  const p = await getPending();
  if (!p) return { error: 'Your code request expired. Go back and ask for a new code.' };
  const code = String(fd.get('code') || '').replace(/\D/g, '');
  if (code.length !== 6) return { error: 'Enter the 6-digit code.' };

  let user = await prisma.user.findUnique({ where: { email: p.email } });
  let name: string | undefined = p.name;
  if (!user && !name) {
    const n = nameSchema.safeParse(fd.get('name'));
    if (!n.success) return { error: 'New here? Enter your full name to create your account.' };
    name = n.data;
  }
  if (user?.isBlocked) return { error: 'This account is blocked. Please contact Kirayo support.' };

  const check = await verifyOtp(p.email, code);
  if (!check.ok) return { error: check.error };

  if (!user) {
    user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: { email: p.email, name: name || check.name || p.email.split('@')[0] },
    });
  }
  await createSession(user.id);
  (await cookies()).delete(PENDING_COOKIE);
  // Location is asked once, right after the first login.
  if (!user.city || !user.area) {
    const loc = (await cookies()).get('kirayo_loc')?.value;
    if (loc) {
      const [city, area] = decodeURIComponent(loc).split('|');
      if (city && area) await prisma.user.update({ where: { id: user.id }, data: { city, area } });
      else redirect(`/location?next=${encodeURIComponent(p.next)}`);
    } else redirect(`/location?next=${encodeURIComponent(p.next)}`);
  }
  redirect(p.next);
}

export async function logoutAction() {
  await destroySession();
  redirect('/');
}
