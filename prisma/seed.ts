import { PrismaClient } from '@prisma/client';
import { ADMIN, CITIES } from './demo-data';

const prisma = new PrismaClient();

export async function seedCities() {
  for (const [ci, c] of CITIES.entries()) {
    const city = await prisma.city.upsert({ where: { name: c.name }, update: { sortOrder: ci }, create: { name: c.name, sortOrder: ci } });
    for (const [ai, a] of c.areas.entries()) {
      await prisma.area.upsert({
        where: { cityId_name: { cityId: city.id, name: a } },
        update: { sortOrder: ai },
        create: { cityId: city.id, name: a, sortOrder: ai },
      });
    }
  }
}

async function main() {
  await seedCities();
  await prisma.user.upsert({
    where: { email: ADMIN.email },
    update: { isAdmin: true, isBlocked: false },
    create: { email: ADMIN.email, name: ADMIN.name, isAdmin: true, idStatus: 'VERIFIED', city: 'Bengaluru', area: 'Indiranagar' },
  });
  console.log('Seed done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
