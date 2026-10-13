// Kirayo demo seed. `npm run setup` (fresh DB) or `npm run db:reset` (wipe + reload).
// Safety: if the DB contains any non-demo user (email not ending in .test),
// the seed does NOT wipe anything — it only tops up cities, admin and area owners.
import { PrismaClient } from '@prisma/client';
import { CATALOG } from './catalog';
import { itemData, readSeedAsset, seedAdmin, seedAreaOwners, seedCities } from './seed-lib';
import { seedBookings } from './seed-bookings';
import { importPrivateBuffer, wipeUploads } from '../lib/storage';

const prisma = new PrismaClient();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);
const find = (photo: string) => CATALOG.find((c) => c.photo === photo)!;

async function wipe() {
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.complaint.deleteMany(),
    prisma.payout.deleteMany(),
    prisma.depositRefund.deleteMany(),
    prisma.damageClaim.deleteMany(),
    prisma.extensionRequest.deleteMany(),
    prisma.conditionReport.deleteMany(),
    prisma.message.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.blockedDate.deleteMany(),
    prisma.item.deleteMany(),
    prisma.session.deleteMany(),
    prisma.emailOtp.deleteMany(),
    prisma.contactMessage.deleteMany(),
    prisma.user.deleteMany(),
    prisma.area.deleteMany(),
    prisma.city.deleteMany(),
  ]);
  await wipeUploads();
}

async function main() {
  const real = await prisma.user.count({ where: { NOT: { email: { endsWith: '.test' } } } });
  if (real > 0) {
    console.log(`Found ${real} non-demo user(s): not wiping. Topping up cities, admin and area owners only.`);
    await seedCities(prisma);
    await seedAdmin(prisma);
    console.log(await seedAreaOwners(prisma));
    return;
  }
  await wipe();
  await seedCities(prisma);
  await seedAdmin(prisma);

  const riya = await prisma.user.create({
    data: { email: 'riya@kirayo.test', name: 'Riya Sharma', phone: '+91 98450 12345', city: 'Bengaluru', area: 'Indiranagar', address: 'Flat 4B, Lakshmi Residency, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru 560008', idStatus: 'VERIFIED', idDocType: 'Aadhaar', idSubmittedAt: daysAgo(90), idReviewedAt: daysAgo(90), createdAt: daysAgo(95) },
  });
  const arjun = await prisma.user.create({
    data: { email: 'arjun@kirayo.test', name: 'Arjun Mehta', phone: '+91 99000 11223', city: 'Bengaluru', area: 'Indiranagar', address: '22, 100 Feet Road, Indiranagar, Bengaluru 560038', idStatus: 'VERIFIED', idDocType: 'Driving licence', idSubmittedAt: daysAgo(300), idReviewedAt: daysAgo(300), createdAt: daysAgo(310) },
  });
  const neha = await prisma.user.create({
    data: { email: 'neha@kirayo.test', name: 'Neha Kulkarni', city: 'Bengaluru', area: 'Koramangala', idStatus: 'PENDING', idDocType: 'Aadhaar', idSubmittedAt: new Date(Date.now() - 3 * 3600000), createdAt: daysAgo(2) },
  });
  await prisma.user.update({
    where: { id: neha.id },
    data: { idDocPath: await importPrivateBuffer(readSeedAsset('sample-id.jpg'), neha.id), selfiePath: await importPrivateBuffer(readSeedAsset('sample-selfie.jpg'), neha.id) },
  });
  const vikram = await prisma.user.create({
    data: { email: 'vikram@kirayo.test', name: 'Vikram Singh', city: 'Mumbai', area: 'Bandra West', idStatus: 'REJECTED', idDocType: 'PAN', idRejectReason: 'The photo is blurry — the name and ID number are not readable. Please upload a sharp photo in good light.', idSubmittedAt: daysAgo(3), idReviewedAt: daysAgo(2), createdAt: daysAgo(4) },
  });
  await prisma.user.update({
    where: { id: vikram.id },
    data: { idDocPath: await importPrivateBuffer(readSeedAsset('sample-id.jpg'), vikram.id), selfiePath: await importPrivateBuffer(readSeedAsset('sample-selfie.jpg'), vikram.id) },
  });

  // Arjun: 16 live items across all categories, in Bengaluru and Mumbai.
  const blr = ['mirrorless', 'lens', 'tripod', 'drill', 'ladder', 'speaker', 'tent', 'campchairs', 'ps5', 'projector', 'guitar', 'mtb'];
  const mum = ['dslr', 'karaoke', 'switch', 'cajon'];
  for (const [i, p] of blr.entries())
    await prisma.item.create({ data: itemData(arjun.id, find(p), 'Bengaluru', 'Indiranagar', { cash: i % 3 === 0, deliver: i % 2 === 0, createdAt: daysAgo(200 - i * 10) }) });
  for (const [i, p] of mum.entries())
    await prisma.item.create({ data: itemData(arjun.id, find(p), 'Mumbai', 'Andheri West', { cash: i % 2 === 0, deliver: true, createdAt: daysAgo(120 - i * 7) }) });
  await prisma.item.create({ data: itemData(arjun.id, find('screen'), 'Bengaluru', 'Indiranagar', { status: 'PENDING_REVIEW', createdAt: new Date(Date.now() - 5 * 3600000) }) });
  await prisma.item.create({ data: itemData(arjun.id, find('lights'), 'Bengaluru', 'Indiranagar', { status: 'REJECTED', rejectReason: 'Only 1 photo. Add photos of all strings and the plugs.', createdAt: daysAgo(4) }) });

  const area = await seedAreaOwners(prisma);

  // A few more listings waiting for admin review.
  const owners = await prisma.user.findMany({ where: { email: { in: ['kavya.koramangala@kirayo.test'] } } });
  const someOwners = owners.length ? owners : await prisma.user.findMany({ where: { email: { endsWith: '@kirayo.test' }, items: { some: {} }, NOT: { id: arjun.id } }, take: 3, orderBy: { email: 'asc' } });
  for (const [i, p] of ['piano', 'kayak', 'washer'].entries()) {
    const o = someOwners[i % someOwners.length];
    await prisma.item.create({ data: itemData(o.id, find(p), o.city!, o.area!, { status: 'PENDING_REVIEW', createdAt: new Date(Date.now() - (i + 2) * 3600000) }) });
  }

  await seedBookings(prisma, { riya, arjun });

  await prisma.contactMessage.create({ data: { name: 'Sanjay Rao', email: 'sanjay.rao@example.com', message: 'Do you plan to launch in Hyderabad? I have camping gear to lend.' } });

  console.log(`Seed done: area owners ${area.owners}, area items ${area.items}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
