import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import type { User } from '@prisma/client';
import { prisma } from './db';
import { SESSION_COOKIE, SESSION_DAYS } from './constants';

export type SessionUser = User;

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  jar.delete(SESSION_COOKIE);
}

/** The logged-in user, or null. Blocked users are treated as logged out. */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const s = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!s || s.expiresAt < new Date() || s.user.isBlocked) return null;
  return s.user;
});

/** For pages: redirect to login (with return path) when logged out. */
export async function requireUser(next = '/'): Promise<SessionUser> {
  const u = await getUser();
  if (!u) redirect(`/login?next=${encodeURIComponent(next)}`);
  return u;
}

export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser('/admin');
  if (!u.isAdmin) redirect('/');
  return u;
}

/** For server actions / route handlers: throws instead of redirecting. */
export async function userOrThrow(): Promise<SessionUser> {
  const u = await getUser();
  if (!u) throw new AuthError('Please log in again.');
  return u;
}

export class AuthError extends Error {}
