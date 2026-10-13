import 'server-only';
import crypto from 'node:crypto';
import type { OtpPurpose } from '@prisma/client';
import { prisma } from './db';
import { mail, smtpConfigured } from './mail';

const TTL_MS = 10 * 60 * 1000;
const RESEND_MS = 30 * 1000;
export const MAX_ATTEMPTS = 5;

const hash = (email: string, code: string) =>
  crypto.createHash('sha256').update(`${email.toLowerCase()}:${code}:${process.env.CRON_SECRET || 'kirayo'}`).digest('hex');

/** Dev only: show the OTP on screen when SMTP is not set, or always for @*.test demo emails. */
export function showOtpOnScreen(email: string) {
  if (process.env.NODE_ENV === 'production') return false;
  return !smtpConfigured() || /@[^@]+\.test$/i.test(email);
}

export type OtpRequest = { ok: true; devCode?: string } | { ok: false; error: string; waitSeconds?: number };

export async function requestOtp(email: string, purpose: OtpPurpose, name?: string): Promise<OtpRequest> {
  email = email.trim().toLowerCase();
  const last = await prisma.emailOtp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } });
  if (last && Date.now() - last.createdAt.getTime() < RESEND_MS) {
    const wait = Math.ceil((RESEND_MS - (Date.now() - last.createdAt.getTime())) / 1000);
    return { ok: false, error: `Please wait ${wait} s before asking for a new code.`, waitSeconds: wait };
  }
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  await prisma.emailOtp.create({
    data: { email, purpose, name: name || null, codeHash: hash(email, code), expiresAt: new Date(Date.now() + TTL_MS) },
  });
  if (!smtpConfigured()) console.log(`[otp] ${email} -> ${code}`);
  // Demo .test addresses can't receive mail; skip sending when the code is shown on screen anyway.
  if (!(smtpConfigured() && /@[^@]+\.test$/i.test(email))) await mail.otp(email, code);
  return { ok: true, devCode: showOtpOnScreen(email) ? code : undefined };
}

export type OtpCheck = { ok: true; purpose: OtpPurpose; name: string | null } | { ok: false; error: string };

export async function verifyOtp(email: string, code: string): Promise<OtpCheck> {
  email = email.trim().toLowerCase();
  const otp = await prisma.emailOtp.findFirst({ where: { email, consumedAt: null }, orderBy: { createdAt: 'desc' } });
  if (!otp) return { ok: false, error: 'No code was sent to this email. Ask for a new one.' };
  if (otp.expiresAt < new Date()) return { ok: false, error: 'This code has expired. Ask for a new one.' };
  if (otp.attempts >= MAX_ATTEMPTS) return { ok: false, error: 'Too many wrong tries. Ask for a new code.' };
  if (otp.codeHash !== hash(email, code.trim())) {
    const n = otp.attempts + 1;
    await prisma.emailOtp.update({ where: { id: otp.id }, data: { attempts: n } });
    return { ok: false, error: n >= MAX_ATTEMPTS ? 'Too many wrong tries. Ask for a new code.' : `That code is not right. ${MAX_ATTEMPTS - n} tries left.` };
  }
  // Consume atomically so the same code can't be used twice.
  const used = await prisma.emailOtp.updateMany({ where: { id: otp.id, consumedAt: null }, data: { consumedAt: new Date() } });
  if (used.count !== 1) return { ok: false, error: 'This code was already used.' };
  return { ok: true, purpose: otp.purpose, name: otp.name };
}

/** Seconds until a resend is allowed (0 = now). */
export async function resendWait(email: string): Promise<number> {
  const last = await prisma.emailOtp.findFirst({ where: { email: email.toLowerCase() }, orderBy: { createdAt: 'desc' } });
  if (!last) return 0;
  return Math.max(0, Math.ceil((RESEND_MS - (Date.now() - last.createdAt.getTime())) / 1000));
}
