// Adds the per-area demo owners (2–3 VERIFIED owners with 2–3 items each) to an
// existing database WITHOUT wiping anything.  npm run db:add-demo-owners
import { PrismaClient } from '@prisma/client';
import { seedAreaOwners, seedCities } from './seed-lib';

const prisma = new PrismaClient();
seedCities(prisma)
  .then(() => seedAreaOwners(prisma))
  .then((r) => console.log(`Area owners ensured: ${r.owners}, items added: ${r.items}`))
  .finally(() => prisma.$disconnect());
