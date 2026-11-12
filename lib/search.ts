import type { Category, Item, Prisma, User } from '@prisma/client';
import { prisma } from './db';
import { LIVE_OWNER } from './owner-gate';
import { addDays, avatarColor, dayOf, fmtDay, fmtRange, initials, todayIST, toDbDate } from './format';
import { CATEGORIES, categoryLabel, PAGE_SIZE } from './constants';
import { freeItemIds, occupyingWhere } from './bookings';
import type { CardData } from '@/components/ItemCard';

export type BrowseFilters = {
  q?: string;
  category?: Category;
  start?: string;
  end?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDeposit?: number;
  pickup?: boolean;
  delivery?: boolean;
  areas?: string[];
  sort?: 'nearest' | 'price' | 'price_desc' | 'newest';
  page?: number;
};

/** Items anyone may see: ACTIVE, not deleted, from live owners (approved + ID verified + not blocked), never the viewer's own. */
export function visibleWhere(viewerId?: string | null): Prisma.ItemWhereInput {
  return {
    status: 'ACTIVE',
    deletedAt: null,
    owner: LIVE_OWNER,
    ...(viewerId ? { ownerId: { not: viewerId } } : {}),
  };
}

type Row = Item & { owner: Pick<User, 'id' | 'name'> };

async function areaOrder(city: string) {
  const areas = await prisma.area.findMany({ where: { city: { name: city } }, orderBy: { sortOrder: 'asc' } });
  return new Map(areas.map((a) => [a.name, a.sortOrder]));
}

export async function browse(city: string, myArea: string, viewerId: string | null, f: BrowseFilters) {
  const where: Prisma.ItemWhereInput = {
    ...visibleWhere(viewerId),
    city,
    ...(f.category ? { category: f.category } : {}),
    ...(f.q ? { OR: [{ title: { contains: f.q, mode: 'insensitive' } }, { description: { contains: f.q, mode: 'insensitive' } }] } : {}),
    ...(f.minPrice || f.maxPrice ? { pricePerDay: { ...(f.minPrice ? { gte: f.minPrice } : {}), ...(f.maxPrice ? { lte: f.maxPrice } : {}) } } : {}),
    ...(f.maxDeposit ? { deposit: { lte: f.maxDeposit } } : {}),
    ...(f.areas?.length ? { area: { in: f.areas } } : {}),
  };
  if (f.pickup && !f.delivery) where.canPickup = true;
  if (f.delivery && !f.pickup) where.canDeliver = true;

  let rows: Row[] = await prisma.item.findMany({ where, include: { owner: { select: { id: true, name: true } } } });
  if (f.start && f.end) {
    const free = await freeItemIds(rows.map((r) => r.id), f.start, f.end);
    rows = rows.filter((r) => free.has(r.id));
  }
  const order = await areaOrder(city);
  const me = order.get(myArea) ?? 0;
  const dist = (r: Row) => Math.abs((order.get(r.area) ?? 99) - me);
  const sort = f.sort ?? 'nearest';
  rows.sort((a, b) =>
    sort === 'price' ? a.pricePerDay - b.pricePerDay
    : sort === 'price_desc' ? b.pricePerDay - a.pricePerDay
    : sort === 'newest' ? b.createdAt.getTime() - a.createdAt.getTime()
    : dist(a) - dist(b) || b.createdAt.getTime() - a.createdAt.getTime(),
  );
  const page = Math.max(1, f.page ?? 1);
  const total = rows.length;
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return { total, page, cards: await toCards(pageRows, f.start && f.end ? { start: f.start, end: f.end } : undefined) };
}

/** Card data incl. rating and "Available from …" for a list of items. */
export async function toCards(rows: Row[], range?: { start: string; end: string }): Promise<CardData[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const today = todayIST();
  const horizon = addDays(today, 60);
  const [ratings, bookings, blocked] = await Promise.all([
    prisma.review.groupBy({ by: ['itemId'], where: { itemId: { in: ids } }, _avg: { rating: true }, _count: true }),
    range ? Promise.resolve([]) : prisma.booking.findMany({ where: { itemId: { in: ids }, endDate: { gte: toDbDate(today) }, startDate: { lte: toDbDate(horizon) }, ...occupyingWhere() }, select: { itemId: true, startDate: true, endDate: true } }),
    range ? Promise.resolve([]) : prisma.blockedDate.findMany({ where: { itemId: { in: ids }, date: { gte: toDbDate(today), lte: toDbDate(horizon) } }, select: { itemId: true, date: true } }),
  ]);
  return rows.map((r) => {
    const rating = ratings.find((x) => x.itemId === r.id);
    let availability = range ? `Free ${fmtRange(range.start, range.end)}` : 'Available today';
    let tone: 'ok' | 'warn' = 'ok';
    if (!range) {
      const busy = new Set<string>();
      for (const b of bookings.filter((b) => b.itemId === r.id)) for (let d = dayOf(b.startDate); d <= dayOf(b.endDate); d = addDays(d, 1)) busy.add(d);
      for (const b of blocked.filter((b) => b.itemId === r.id)) busy.add(dayOf(b.date));
      let d = today;
      while (busy.has(d) && d < horizon) d = addDays(d, 1);
      if (d !== today) {
        availability = d >= horizon ? 'Fully booked' : `Available from ${fmtDay(d).replace(/^\w+ /, '')}`;
        tone = 'warn';
      }
    }
    return {
      href: `/items/${r.id}${range ? `?start=${range.start}&end=${range.end}` : ''}`,
      title: r.title,
      photo: r.photos[0],
      categoryLabel: categoryLabel(r.category),
      pricePerDay: r.pricePerDay,
      place: `${r.area}, ${r.city}`,
      rating: rating?._avg.rating ?? null,
      reviews: rating?._count ?? 0,
      availability,
      availabilityTone: tone,
      deposit: r.deposit,
      ownerInitials: initials(r.owner.name),
      ownerColor: avatarColor(r.owner.id),
      ownerName: r.owner.name,
    };
  });
}

/** Home rails: nearest areas first, and newest in the city. */
export async function homeRails(city: string, myArea: string, viewerId: string | null) {
  const near = await browse(city, myArea, viewerId, { sort: 'nearest' });
  const recentRows = await prisma.item.findMany({ where: { ...visibleWhere(viewerId), city }, include: { owner: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 8 });
  return { near: near.cards.slice(0, 8), nearTotal: near.total, recent: await toCards(recentRows) };
}

export function parseFilters(sp: Record<string, string | string[] | undefined>): BrowseFilters {
  const one = (k: string) => (Array.isArray(sp[k]) ? (sp[k] as string[])[0] : (sp[k] as string | undefined));
  const num = (k: string) => {
    const n = Number(String(one(k) ?? '').replace(/[^\d]/g, ''));
    return n > 0 ? n : undefined;
  };
  const cat = CATEGORIES.find((c) => c.slug === one('category'));
  const start = one('start');
  const end = one('end');
  const dateOk = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const areas = sp.area ? (Array.isArray(sp.area) ? sp.area : [sp.area]) : [];
  const sort = one('sort');
  return {
    q: one('q')?.trim().slice(0, 80) || undefined,
    category: cat?.key,
    start: dateOk(start) && dateOk(end) && start! <= end! ? start : undefined,
    end: dateOk(start) && dateOk(end) && start! <= end! ? end : undefined,
    minPrice: num('min'),
    maxPrice: num('max'),
    maxDeposit: num('deposit'),
    pickup: one('pickup') === '1',
    delivery: one('delivery') === '1',
    areas: areas.filter(Boolean),
    sort: sort === 'price' || sort === 'price_desc' || sort === 'newest' ? sort : 'nearest',
    page: Number(one('page')) || 1,
  };
}
