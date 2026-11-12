'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { Category } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { CATEGORIES, MAX_ITEM_PHOTOS } from '@/lib/constants';
import { isDay, todayIST, toDbDate } from '@/lib/format';
import { publicUrlExists } from '@/lib/storage';
import { postSystem } from '@/lib/chat';
import type { FormState } from './auth';

const money = (label: string, max: number) =>
  z.coerce.number({ message: `${label}: enter a number.` }).int(`${label}: whole rupees only.`).min(0, `${label} can’t be negative.`).max(max, `${label} is too high.`);

const itemSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(5, 'Title: at least 5 characters.').max(80, 'Title: at most 80 characters.'),
    category: z.enum(CATEGORIES.map((c) => c.key) as [Category, ...Category[]], { message: 'Pick a category.' }),
    location: z.string().min(3, 'Pick the area where the item is.'),
    description: z.string().trim().min(20, 'Description: at least 20 characters — say what is included.').max(2000),
    pricePerDay: money('Price per day', 100000).refine((v) => v >= 1, 'Price per day must be at least ₹1.'),
    pricePerWeek: z.union([z.literal(''), money('Price per week', 700000)]).transform((v) => (v === '' || v === 0 ? null : v)),
    deposit: money('Deposit', 500000),
    minDays: z.coerce.number().int().min(1, 'Minimum days: at least 1.').max(90),
    maxDays: z.coerce.number().int().min(1).max(90, 'Maximum days: at most 90.'),
    canPickup: z.boolean(),
    canDeliver: z.boolean(),
    acceptsCashAtPickup: z.boolean(),
    pickupNote: z.string().trim().max(160).optional(),
    photos: z.array(z.string()).min(1, 'Add at least one photo.').max(MAX_ITEM_PHOTOS, `Up to ${MAX_ITEM_PHOTOS} photos.`),
    blocked: z.array(z.string().refine(isDay)).max(400),
  })
  .refine((v) => v.maxDays >= v.minDays, { message: 'Maximum days must be at least the minimum days.' })
  .refine((v) => v.canPickup || v.canDeliver, { message: 'Choose pickup, delivery or both.' })
  .refine((v) => !v.pricePerWeek || v.pricePerWeek < v.pricePerDay * 7, { message: 'The weekly price should be less than 7 × the daily price.' });

function parseJson(v: FormDataEntryValue | null): unknown {
  try {
    return JSON.parse(String(v ?? '[]'));
  } catch {
    return [];
  }
}

export async function saveItemAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: 'Please log in again.' };
  if (user.ownerStatus !== 'APPROVED') return { error: 'Your owner application must be approved before you list items.' };
  if (user.idStatus !== 'VERIFIED') return { error: 'Verify your ID before listing items.' };

  const parsed = itemSchema.safeParse({
    id: fd.get('id') || undefined,
    title: fd.get('title'),
    category: fd.get('category'),
    location: fd.get('location'),
    description: fd.get('description'),
    pricePerDay: fd.get('pricePerDay'),
    pricePerWeek: String(fd.get('pricePerWeek') ?? '').trim(),
    deposit: fd.get('deposit'),
    minDays: fd.get('minDays'),
    maxDays: fd.get('maxDays'),
    canPickup: fd.get('canPickup') === 'on',
    canDeliver: fd.get('canDeliver') === 'on',
    acceptsCashAtPickup: fd.get('acceptsCashAtPickup') === 'on',
    pickupNote: String(fd.get('pickupNote') ?? ''),
    photos: parseJson(fd.get('photos')),
    blocked: parseJson(fd.get('blocked')),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const [city, area] = v.location.split('|');
  const validArea = await prisma.area.findFirst({ where: { name: area, city: { name: city } } });
  if (!validArea) return { error: 'Pick the area where the item is.' };
  for (const p of v.photos) if (!(await publicUrlExists(p))) return { error: 'A photo is missing — please upload it again.' };

  if (v.id) {
    const existing = await prisma.item.findUnique({ where: { id: v.id } });
    if (!existing || existing.ownerId !== user.id || existing.deletedAt) return { error: 'Item not found.' };
  }

  const data = {
    title: v.title,
    category: v.category,
    description: v.description,
    photos: v.photos,
    pricePerDay: v.pricePerDay,
    pricePerWeek: v.pricePerWeek,
    deposit: v.deposit,
    minDays: v.minDays,
    maxDays: v.maxDays,
    canPickup: v.canPickup,
    canDeliver: v.canDeliver,
    acceptsCashAtPickup: v.acceptsCashAtPickup,
    pickupNote: v.pickupNote || null,
    city,
    area,
    // New and edited items always go back to review. Existing bookings keep
    // their own price snapshot, so editing never changes them.
    status: 'PENDING_REVIEW' as const,
    rejectReason: null,
  };
  const today = todayIST();
  const blocked = [...new Set(v.blocked.filter((d) => d >= today))];

  await prisma.$transaction(async (tx) => {
    const item = v.id ? await tx.item.update({ where: { id: v.id }, data }) : await tx.item.create({ data: { ...data, ownerId: user.id } });
    await tx.blockedDate.deleteMany({ where: { itemId: item.id, date: { gte: toDbDate(today) } } });
    if (blocked.length) await tx.blockedDate.createMany({ data: blocked.map((d) => ({ itemId: item.id, date: toDbDate(d) })), skipDuplicates: true });
  });
  revalidatePath('/owner/listings');
  redirect('/owner/listings?tab=pending&saved=1');
}

async function ownItem(id: string) {
  const user = await getUser();
  if (!user) throw new Error('Please log in again.');
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item || item.ownerId !== user.id || item.deletedAt) throw new Error('Item not found.');
  return { user, item };
}

export async function pauseItemAction(fd: FormData) {
  const { item } = await ownItem(String(fd.get('id')));
  await prisma.item.updateMany({ where: { id: item.id, status: 'ACTIVE' }, data: { status: 'PAUSED' } });
  revalidatePath('/owner/listings');
  redirect('/owner/listings?tab=paused');
}

export async function resumeItemAction(fd: FormData) {
  const { item } = await ownItem(String(fd.get('id')));
  // A paused item was already approved, so it goes straight back live.
  await prisma.item.updateMany({ where: { id: item.id, status: 'PAUSED' }, data: { status: 'ACTIVE' } });
  revalidatePath('/owner/listings');
  redirect('/owner/listings?tab=active');
}

/** Items with upcoming or active bookings can't be deleted — only paused. */
export async function deleteItemAction(fd: FormData) {
  const { item } = await ownItem(String(fd.get('id')));
  const live = await prisma.booking.count({
    where: {
      itemId: item.id,
      OR: [
        { status: { in: ['CONFIRMED', 'PICKED_UP', 'RETURNED', 'DISPUTED', 'RETURN_CONFIRMED'] } },
        { status: 'PENDING_PAYMENT', holdExpiresAt: { gt: new Date() } },
      ],
    },
  });
  if (live > 0) redirect(`/owner/listings?error=${encodeURIComponent('This item has upcoming or active bookings, so it can only be paused.')}`);
  const pending = await prisma.message.findMany({
    where: { type: 'BOOKING_REQUEST', requestStatus: 'PENDING', conversation: { itemId: item.id } },
    select: { id: true, conversationId: true },
  });
  await prisma.$transaction(async (tx) => {
    await tx.item.update({ where: { id: item.id }, data: { deletedAt: new Date(), status: 'PAUSED' } });
    for (const m of pending) {
      await tx.message.update({ where: { id: m.id }, data: { requestStatus: 'DECLINED' } });
      await postSystem(tx, m.conversationId, 'The owner removed this item, so the request was closed.');
    }
  });
  revalidatePath('/owner/listings');
  redirect('/owner/listings?deleted=1');
}

/** Owner calendar: block or unblock one future day (not a booked one). */
export async function setBlockedDayAction(itemId: string, day: string, blocked: boolean): Promise<boolean> {
  const { item } = await ownItem(itemId);
  if (!isDay(day) || day < todayIST()) return false;
  if (blocked) await prisma.blockedDate.upsert({ where: { itemId_date: { itemId: item.id, date: toDbDate(day) } }, update: {}, create: { itemId: item.id, date: toDbDate(day) } });
  else await prisma.blockedDate.deleteMany({ where: { itemId: item.id, date: toDbDate(day) } });
  revalidatePath('/owner/calendar');
  return true;
}
