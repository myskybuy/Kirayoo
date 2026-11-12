// Shared seed helpers (used by seed.ts and add-demo-owners.ts).
import fs from 'node:fs';
import path from 'node:path';
import type { Category, PrismaClient } from '@prisma/client';
import { ADMIN, CITIES } from './demo-data';
import { CATALOG, type CatalogItem } from './catalog';

const DEMO_DIR = path.join(process.cwd(), 'public', 'demo');

/** Local demo photos for a catalog entry (1 or 2 files). */
export function photosFor(c: CatalogItem): string[] {
  return [1, 2].map((n) => `${c.photo}-${n}.jpg`).filter((f) => fs.existsSync(path.join(DEMO_DIR, f))).map((f) => `/demo/${f}`);
}

/** Small deterministic PRNG so every seed run produces the same demo. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const FIRST = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Kabir', 'Isha', 'Vivek', 'Meera', 'Aditya', 'Kavya', 'Rahul', 'Sneha', 'Arnav', 'Diya', 'Karan', 'Pooja', 'Siddharth', 'Nisha', 'Varun', 'Tanvi', 'Harsh', 'Aisha', 'Nikhil', 'Shreya', 'Manav', 'Ritika', 'Dev', 'Sana', 'Yash', 'Tara', 'Ishaan', 'Neel', 'Zoya', 'Kunal', 'Pallavi', 'Omkar', 'Lavanya', 'Farhan', 'Gauri', 'Sameer'];
const LAST = ['Sharma', 'Mehta', 'Nair', 'Iyer', 'Reddy', 'Kulkarni', 'Deshmukh', 'Gill', 'Kapoor', 'Menon', 'Rao', 'Joshi', 'Bose', 'Chopra', 'Patel', 'Shetty', 'Banerjee', 'Pillai', 'Verma', 'Gupta', 'Malhotra', 'Khan', 'Das', 'Saxena', 'Hegde', 'Bhat', 'Jain', 'Sinha'];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

export async function seedCities(prisma: PrismaClient) {
  for (const [ci, c] of CITIES.entries()) {
    const city = await prisma.city.upsert({ where: { name: c.name }, update: { sortOrder: ci }, create: { name: c.name, sortOrder: ci } });
    for (const [ai, a] of c.areas.entries()) {
      await prisma.area.upsert({ where: { cityId_name: { cityId: city.id, name: a } }, update: { sortOrder: ai }, create: { cityId: city.id, name: a, sortOrder: ai } });
    }
  }
}

export async function seedAdmin(prisma: PrismaClient) {
  return prisma.user.upsert({
    where: { email: ADMIN.email },
    update: { isAdmin: true, isBlocked: false },
    create: { email: ADMIN.email, name: ADMIN.name, isAdmin: true, idStatus: 'VERIFIED', city: 'Bengaluru', area: 'Indiranagar', createdAt: new Date('2025-01-05') },
  });
}

type ItemOpts = { status?: 'ACTIVE' | 'PENDING_REVIEW' | 'REJECTED' | 'PAUSED'; rejectReason?: string; cash?: boolean; deliver?: boolean; createdAt?: Date };

export function itemData(ownerId: string, c: CatalogItem, city: string, area: string, o: ItemOpts = {}) {
  return {
    ownerId,
    title: c.title,
    category: c.category as Category,
    description: c.desc,
    photos: photosFor(c),
    pricePerDay: c.day,
    pricePerWeek: c.week ?? null,
    deposit: c.deposit,
    minDays: c.minDays ?? 1,
    maxDays: c.maxDays ?? 30,
    canPickup: true,
    canDeliver: o.deliver ?? false,
    acceptsCashAtPickup: o.cash ?? false,
    pickupNote: `Near ${area} main road`,
    city,
    area,
    status: o.status ?? 'ACTIVE',
    rejectReason: o.rejectReason ?? null,
    // Demo page views (stable per title + area) so "Trending" has something to rank.
    views: (o.status ?? 'ACTIVE') === 'ACTIVE' ? 6 + ([...(c.title + area)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % 230) : 0,
    createdAt: o.createdAt ?? new Date(),
  };
}

/**
 * 2–3 VERIFIED owners in every seeded area, each with 2–3 ACTIVE items.
 * Idempotent: owners are upserted by email; items are only added to owners
 * who have none yet (safe on an existing DB — `npm run db:add-demo-owners`).
 */
export async function seedAreaOwners(prisma: PrismaClient) {
  const r = rng(20261013);
  let owners = 0;
  let items = 0;
  for (const c of CITIES) {
    for (const area of c.areas) {
      const n = 2 + Math.floor(r() * 2);
      for (let i = 0; i < n; i++) {
        const first = FIRST[Math.floor(r() * FIRST.length)];
        const last = LAST[Math.floor(r() * LAST.length)];
        const email = `${slug(first)}.${slug(area)}${i ? i + 1 : ''}@kirayo.test`;
        const days = 40 + Math.floor(r() * 500);
        const owner = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            name: `${first} ${last}`,
            phone: `+91 9${Math.floor(100000000 + r() * 899999999)}`,
            city: c.name,
            area,
            address: `${10 + Math.floor(r() * 200)}, ${area}, ${c.name}`,
            idStatus: 'VERIFIED',
            ownerStatus: 'APPROVED',
            idDocType: 'Aadhaar',
            idSubmittedAt: new Date(Date.now() - days * 86400000),
            idReviewedAt: new Date(Date.now() - days * 86400000 + 3 * 3600000),
            createdAt: new Date(Date.now() - (days + 2) * 86400000),
          },
        });
        owners++;
        if ((await prisma.item.count({ where: { ownerId: owner.id } })) > 0) continue;
        const k = 2 + Math.floor(r() * 2);
        const used = new Set<number>();
        for (let j = 0; j < k; j++) {
          let idx = Math.floor(r() * CATALOG.length);
          while (used.has(idx)) idx = (idx + 1) % CATALOG.length;
          used.add(idx);
          await prisma.item.create({
            data: itemData(owner.id, CATALOG[idx], c.name, area, {
              cash: r() < 0.35,
              deliver: r() < 0.45,
              createdAt: new Date(Date.now() - Math.floor(r() * 60) * 86400000 - Math.floor(r() * 86400000)),
            }),
          });
          items++;
        }
      }
    }
  }
  return { owners, items };
}

export function readSeedAsset(name: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), 'prisma', 'seed-assets', name));
}
