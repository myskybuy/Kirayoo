import 'server-only';
import { prisma } from './db';

export async function adminCounts() {
  const [ids, listings, disputes, complaints, contacts, payouts, refunds] = await Promise.all([
    prisma.user.count({ where: { idStatus: 'PENDING' } }),
    prisma.item.count({ where: { status: 'PENDING_REVIEW', deletedAt: null } }),
    prisma.damageClaim.count({ where: { status: 'DISPUTED' } }),
    prisma.complaint.count({ where: { status: 'OPEN' } }),
    prisma.contactMessage.count({ where: { resolved: false } }),
    prisma.payout.count({ where: { status: 'PENDING' } }),
    prisma.depositRefund.count({ where: { status: { in: ['PENDING', 'FAILED'] } } }),
  ]);
  return { ids, listings, disputes, complaints: complaints + contacts, payouts, refunds };
}

/** Only same-site admin paths are allowed as "back" targets. */
export function backTo(v: FormDataEntryValue | null, fallback: string) {
  const s = typeof v === 'string' ? v : '';
  return s.startsWith('/admin') ? s : fallback;
}
