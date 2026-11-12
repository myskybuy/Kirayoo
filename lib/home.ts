import 'server-only';
import { prisma } from './db';
import { homeRails, toCards, visibleWhere } from './search';
import { CATEGORIES, PLATFORM_FEE_PERCENT } from './constants';
import { LIVE_OWNER } from './owner-gate';

export type Testimonial = { id: string; name: string; place: string; item: string; rating: number; text: string };

/** Everything the home page shows. All numbers are live counts — nothing invented. */
export async function homeData(city: string, area: string, viewerId: string | null) {
  const visible = visibleWhere(viewerId);
  const [rails, byCat, byArea, trendingRows, liveItems, liveOwners, cities, rentals, reviews] = await Promise.all([
    homeRails(city, area, viewerId),
    // Count + cheapest + average day price per category, for tiles, occasions and the earnings calculator.
    prisma.item.groupBy({ by: ['category'], where: { ...visible, city }, _count: true, _min: { pricePerDay: true }, _avg: { pricePerDay: true } }),
    prisma.item.groupBy({ by: ['area'], where: { ...visible, city }, _count: true }),
    // Most viewed in the city.
    prisma.item.findMany({ where: { ...visible, city, views: { gt: 0 } }, include: { owner: { select: { id: true, name: true } } }, orderBy: [{ views: 'desc' }, { createdAt: 'desc' }], take: 8 }),
    prisma.item.count({ where: visibleWhere(null) }),
    prisma.user.count({ where: { ...LIVE_OWNER, items: { some: { status: 'ACTIVE', deletedAt: null } } } }),
    prisma.city.count(),
    prisma.booking.count({ where: { status: { in: ['RETURN_CONFIRMED', 'DEPOSIT_REFUNDED'] } } }),
    // Renter → owner reviews (they carry an item) with something to say.
    prisma.review.findMany({
      where: { itemId: { not: null }, rating: { gte: 4 } },
      include: { fromUser: { select: { name: true, area: true, city: true } }, item: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
  ]);
  const cat = new Map(byCat.map((c) => [c.category, c]));
  const seen = new Set<string>();
  const testimonials: Testimonial[] = [];
  for (const r of reviews) {
    // One quote per reviewer, long enough to read as a real opinion.
    if (r.text.trim().length < 25 || seen.has(r.fromUserId) || !r.item) continue;
    seen.add(r.fromUserId);
    const [first, last] = r.fromUser.name.split(' ');
    testimonials.push({ id: r.id, name: `${first}${last ? ` ${last[0]}.` : ''}`, place: [r.fromUser.area, r.fromUser.city].filter(Boolean).join(', '), item: r.item.title, rating: r.rating, text: r.text.trim() });
    if (testimonials.length === 3) break;
  }
  return {
    rails,
    categories: CATEGORIES.map((c) => ({
      ...c,
      count: cat.get(c.key)?._count ?? 0,
      minPrice: cat.get(c.key)?._min.pricePerDay ?? null,
      avgPrice: Math.round(cat.get(c.key)?._avg.pricePerDay ?? 0),
    })),
    areaCounts: new Map(byArea.map((a) => [a.area, a._count])),
    trending: await toCards(trendingRows),
    platformFeePercent: PLATFORM_FEE_PERCENT,
    stats: { liveItems, liveOwners, cities, rentals },
    testimonials,
  };
}
