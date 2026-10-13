import 'server-only';
import { prisma } from './db';
import { CATEGORIES, DELIVERY_FEE } from './constants';

export async function itemFormData() {
  const cities = await prisma.city.findMany({ orderBy: { sortOrder: 'asc' }, include: { areas: { orderBy: { name: 'asc' } } } });
  return {
    categories: CATEGORIES.map((c) => ({ key: c.key, label: c.label })),
    cities: cities.map((c) => ({ name: c.name, areas: c.areas.map((a) => a.name) })),
    deliveryFee: DELIVERY_FEE,
  };
}
