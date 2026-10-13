// Writes LOGINS.md from the seeded database (run after `npm run setup`).
//   npx tsx tools/write-logins.ts
import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TRY: Record<string, string> = {
  'admin@kirayo.test': 'Admin panel: approve Neha’s ID, approve pending listings, decide the disputed lens claim, pay the pending payout, resolve the complaint + contact message.',
  'riya@kirayo.test': 'Renter with a booking in every state: pay the held projector, show pickup OTP (tent tomorrow), cash-at-pickup drill, in-use guitar (report a problem / extend), overdue bike, answer the speaker claim, review history.',
  'arjun@kirayo.test': 'Owner with 16 live items in Bengaluru + Mumbai: answer Riya’s camera request, hand over the tent (photos + OTP), check the returned ladder (All OK or claim), see earnings and reviews.',
  'neha@kirayo.test': 'ID PENDING: chat works, but paying and listing are blocked until the admin approves.',
  'vikram@kirayo.test': 'ID REJECTED with a reason: see the rejected screen and re-upload.',
};

async function main() {
  const users = await prisma.user.findMany({ where: { email: { endsWith: '@kirayo.test' } }, include: { _count: { select: { items: true, rentals: true } } }, orderBy: [{ city: 'asc' }, { area: 'asc' }, { email: 'asc' }] });
  const cities = await prisma.city.findMany({ orderBy: { sortOrder: 'asc' }, include: { areas: { orderBy: { sortOrder: 'asc' } } } });
  const lines: string[] = [
    '# Kirayo demo logins',
    '',
    'All demo accounts use **email OTP**. In development the 6-digit code is shown on the verify page for every `@kirayo.test` address (and printed in the terminal), so no inbox is needed.',
    '',
    'Run `npm run setup` (fresh DB) or `npm run db:reset` to load this data. Dates are relative to the day you seed.',
    '',
    '## Start here',
    '',
    '| Role | Email | What to try |',
    '|---|---|---|',
  ];
  for (const e of Object.keys(TRY)) {
    const u = users.find((x) => x.email === e);
    if (!u) continue;
    const role = u.isAdmin ? 'Admin' : u._count.items ? 'Owner' : 'Renter';
    lines.push(`| ${role} · ${u.name} (${u.area ?? '—'}, ${u.city ?? '—'}) · ID ${u.idStatus.toLowerCase()} | \`${e}\` | ${TRY[e]} |`);
  }
  lines.push('', '## Every account by city → area', '', 'Area owners are ID-verified with 2–3 live items each, so every location shows results. Any of them can also rent.', '');
  for (const c of cities) {
    lines.push(`### ${c.name}`, '');
    for (const a of c.areas) {
      const here = users.filter((u) => u.city === c.name && u.area === a.name);
      if (!here.length) continue;
      lines.push(`**${a.name}**`, '');
      for (const u of here) {
        const role = u.isAdmin ? 'admin' : u._count.items ? `owner (${u._count.items} item${u._count.items > 1 ? 's' : ''})` : 'renter';
        lines.push(`- \`${u.email}\` — ${u.name}, ${role}, ID ${u.idStatus.toLowerCase()}${TRY[u.email] ? ` — ${TRY[u.email]}` : ''}`);
      }
      lines.push('');
    }
  }
  fs.writeFileSync('LOGINS.md', lines.join('\n'));
  console.log(`LOGINS.md: ${users.length} accounts`);
}
main().finally(() => prisma.$disconnect());
