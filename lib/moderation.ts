// Owner applications and listing moderation. Server actions are thin
// wrappers around these so the rules are testable (scripts/e2e-flow.ts).
import { z } from 'zod';
import type { Category } from '@prisma/client';
import { prisma } from './db';
import { BookingError } from './bookings';
import { postSystem } from './chat';
import { CATEGORIES } from './constants';
import { isLiveOwner } from './owner-gate';

export const ownerApplicationSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(80),
  phone: z.string().trim().max(20).refine((v) => /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(v), 'Enter a valid Indian mobile number.'),
  categories: z.array(z.enum(CATEGORIES.map((c) => c.key) as [Category, ...Category[]])).min(1, 'Pick at least one category you will rent out.'),
  plans: z.string().trim().min(10, 'Tell us what you will rent (at least 10 characters).').max(600),
  terms: z.literal(true, { message: 'Please accept the owner terms.' }),
});
// Raw form values; validated by the schema inside applyAsOwner.
export type OwnerApplicationInput = { name: string; phone: string; categories: string[]; plans: string; terms: boolean };

/** NONE / REJECTED → PENDING, saving (or replacing) the application form. */
export async function applyAsOwner(userId: string, input: OwnerApplicationInput) {
  const p = ownerApplicationSchema.safeParse(input);
  if (!p.success) throw new BookingError(p.error.issues[0].message);
  const v = p.data;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.ownerStatus === 'PENDING') throw new BookingError('Your application is already under review.');
  if (user.ownerStatus === 'APPROVED') throw new BookingError('You are already an approved owner.');
  const now = new Date();
  const app = { name: v.name, phone: v.phone, categories: [...new Set(v.categories)], plans: v.plans, termsAt: now, submittedAt: now, reviewedAt: null };
  await prisma.$transaction([
    prisma.ownerApplication.upsert({ where: { userId }, create: { userId, ...app }, update: app }),
    // Only moves from NONE / REJECTED, so a double submit can't reset a decision.
    prisma.user.updateMany({
      where: { id: userId, ownerStatus: { in: ['NONE', 'REJECTED'] } },
      data: { ownerStatus: 'PENDING', ownerRejectReason: null, ...(user.phone ? {} : { phone: v.phone }) },
    }),
  ]);
}

/** Admin decision on a PENDING application. A rejection needs a reason the applicant can act on. */
export async function decideOwnerApplication(userId: string, approve: boolean, reason = '') {
  reason = reason.trim().slice(0, 300);
  if (!approve && reason.length < 3) throw new BookingError('Write a reason the applicant can act on.');
  const r = await prisma.user.updateMany({
    where: { id: userId, ownerStatus: 'PENDING' },
    data: approve ? { ownerStatus: 'APPROVED', ownerRejectReason: null } : { ownerStatus: 'REJECTED', ownerRejectReason: reason },
  });
  if (r.count !== 1) throw new BookingError('This application is not waiting for review.');
  await prisma.ownerApplication.updateMany({ where: { userId }, data: { reviewedAt: new Date() } });
  return prisma.user.findUniqueOrThrow({ where: { id: userId } });
}

/** PENDING_REVIEW → ACTIVE, only for live owners (approved + ID verified + not blocked). */
export async function approveListing(itemId: string) {
  const item = await prisma.item.findUnique({ where: { id: itemId }, include: { owner: true } });
  if (!item || item.deletedAt) throw new BookingError('Item not found.');
  if (!isLiveOwner(item.owner)) throw new BookingError(`${item.owner.name} is not an approved, ID-verified, active owner — the item can’t go live yet.`);
  const r = await prisma.item.updateMany({ where: { id: item.id, status: 'PENDING_REVIEW' }, data: { status: 'ACTIVE', rejectReason: null } });
  if (r.count !== 1) throw new BookingError('This listing is not waiting for review.');
  return item;
}

/**
 * Pending → REJECTED (changes requested), or live/paused → REJECTED as a
 * take-down ("Taken down: …"). Open requests on a taken-down item are closed.
 */
export async function rejectListing(itemId: string, reason: string) {
  reason = reason.trim().slice(0, 300);
  if (reason.length < 3) throw new BookingError('Write a short reason so the owner knows what to change.');
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item || item.deletedAt) throw new BookingError('Item not found.');
  if (item.status === 'REJECTED') throw new BookingError('This listing is already rejected.');
  const takeDown = item.status === 'ACTIVE' || item.status === 'PAUSED';
  await prisma.item.update({ where: { id: item.id }, data: { status: 'REJECTED', rejectReason: takeDown ? `Taken down: ${reason}` : reason } });
  if (takeDown) {
    const pending = await prisma.message.findMany({ where: { type: 'BOOKING_REQUEST', requestStatus: 'PENDING', conversation: { itemId: item.id } }, select: { id: true, conversationId: true } });
    for (const m of pending) {
      await prisma.message.update({ where: { id: m.id }, data: { requestStatus: 'DECLINED' } });
      await postSystem(prisma, m.conversationId, 'This item was taken down by Kirayo, so the request was closed.');
    }
  }
  return { item, takeDown };
}
