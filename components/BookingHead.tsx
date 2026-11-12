import Link from 'next/link';
import type { Booking, Item, User } from '@prisma/client';
import { fmtRange } from '@/lib/format';

/** R14 header: photo, code, other party, title, dates. */
export default function BookingHead({ b, role, back }: { b: Booking & { item: Item; owner: User; renter: User }; role: 'RENTER' | 'OWNER'; back: { href: string; label: string } }) {
  const other = role === 'RENTER' ? b.owner : b.renter;
  return (
    <>
      <Link href={back.href} style={{ fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}>← {back.label}</Link>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center' }}>
        <Link href={`/items/${b.itemId}`} style={{ width: '120px', height: '90px', borderRadius: '18px', background: 'var(--kb-bfd1bd)', flex: 'none', overflow: 'hidden' }}>{b.item.photos[0] && <img src={b.item.photos[0]} alt={b.item.title} className="k-photo" />}</Link>
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="mute" style={{ fontSize: '13px' }}>Booking {b.code} · {role === 'RENTER' ? `${other.name}, ${b.item.area}` : `Renter: ${other.name}`}</span>
          <h1 className="d" style={{ fontSize: 'clamp(28px,3vw,40px)', fontWeight: '700', lineHeight: '1.08' }}>{b.item.title}</h1>
          <span style={{ fontSize: '14px' }}>{fmtRange(b.startDate, b.endDate)} · {b.days} day{b.days > 1 ? 's' : ''} · {b.mode === 'DELIVERY' ? 'Delivery' : 'Self pickup'}{b.paymentMode === 'CASH_AT_PICKUP' ? ' · cash / UPI at pickup' : ''}</span>
        </div>
        {b.conversationId && <Link className="btn btn-o" href={`/chat/${b.conversationId}`}>Chat with {other.name.split(' ')[0]}</Link>}
      </div>
    </>
  );
}
