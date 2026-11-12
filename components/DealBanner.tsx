import { prisma } from '@/lib/db';
import { agreedDeal } from '@/lib/deal';
import { fmtTime } from '@/lib/format';

/** "Deal pakki ✓✓" strip on checkout and payment: both sides agreed in chat. */
export default async function DealBanner({ bookingId, renterName, ownerName }: { bookingId: string; renterName: string; ownerName: string }) {
  const deal = await agreedDeal(prisma, bookingId);
  if (!deal) return null;
  const renter = renterName.split(' ')[0];
  const owner = ownerName.split(' ')[0];
  const [first, second] = deal.proposedBy === 'RENTER' ? [`You requested the dates`, `${owner} accepted`] : [`${owner} suggested the dates`, `You accepted`];
  return (
    <div className="k-dealbar" role="status" aria-label="Deal confirmed by both">
      <span className="k-agreed-ic" aria-hidden="true">🤝</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
        <b>Deal pakki <span className="k-ticks">✓✓</span> — confirmed by both {renter} &amp; {owner}</b>
        <small>✓ {first} · ✓ {second} · {fmtTime(deal.proposedAt)}</small>
      </span>
    </div>
  );
}
