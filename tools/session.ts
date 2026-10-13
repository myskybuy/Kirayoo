// Dev helper: temporary sessions for browser tests.
//   npx tsx tools/session.ts create <email> [name] [--verified] [--city=Bengaluru --area=Indiranagar]
//   npx tsx tools/session.ts delete <token...>
import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const [cmd, ...args] = process.argv.slice(2);
const flag = (k: string) => args.find((a) => a.startsWith(`--${k}=`))?.split('=')[1];

async function main() {
  if (cmd === 'create') {
    const email = args[0].toLowerCase();
    const name = args[1] && !args[1].startsWith('--') ? args[1] : email.split('@')[0];
    const verified = args.includes('--verified');
    const user = await prisma.user.upsert({
      where: { email },
      update: verified ? { idStatus: 'VERIFIED' } : {},
      create: { email, name, idStatus: verified ? 'VERIFIED' : 'NONE', city: flag('city') ?? 'Bengaluru', area: flag('area') ?? 'Indiranagar' },
    });
    const token = 'test-' + crypto.randomBytes(16).toString('hex');
    await prisma.session.create({ data: { token, userId: user.id, expiresAt: new Date(Date.now() + 86400000) } });
    console.log(token);
  } else if (cmd === 'delete') {
    const r = await prisma.session.deleteMany({ where: { token: { in: args } } });
    console.log(`deleted ${r.count}`);
  } else console.log('usage: create <email> [name] [--verified] | delete <token...>');
}
main().finally(() => prisma.$disconnect());
