import Link from 'next/link';
import type { NextStep } from '@/lib/bookings';

export type RowData = {
  key: string;
  photo?: string | null;
  badge: { text: string; bg: string; fg: string };
  code?: string;
  title: string;
  sub: string;
  note?: string;
  noteTone?: 'ok' | 'alert';
  detailsHref: string;
  detailsLabel?: string;
  next?: NextStep;
};

/** R13 rental card row. */
export default function BookingRow(r: RowData) {
  return (
    <article style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', padding: '14px', borderRadius: '26px', background: '#FFFDF8', boxShadow: '0 1px 2px rgba(35,38,42,.06),0 8px 24px -12px rgba(31,77,58,.22)' }}>
      <div style={{ width: '150px', maxWidth: '100%', height: '112px', borderRadius: '18px', background: '#BFD1BD', overflow: 'hidden', flex: 'none' }}>{r.photo && <img src={r.photo} alt="" className="k-photo" />}</div>
      <div style={{ flex: '1 1 260px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}><span className="badge" style={{ background: r.badge.bg, color: r.badge.fg }}>{r.badge.text}</span>{r.code && <span className="mute" style={{ fontSize: '12.5px' }}>{r.code}</span>}</div>
        <b style={{ fontSize: '17px' }}>{r.title}</b>
        <span className="mute" style={{ fontSize: '13.5px' }}>{r.sub}</span>
        {(r.note || r.next) && <span style={{ fontSize: '13.5px', fontWeight: '600', color: r.noteTone === 'alert' || r.next?.tone === 'alert' ? '#8E2A20' : '#1F4D3A' }}>{r.note ?? r.next?.text}</span>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingRight: '6px' }}>
        <Link className="btn" href={r.detailsHref} style={{ color: '#1F4D3A', boxShadow: 'inset 0 0 0 1.5px #1F4D3A' }}>{r.detailsLabel ?? 'Details'}</Link>
        {r.next?.buttonLabel && r.next.href && r.next.tone !== 'done' && <Link className="btn" href={r.next.href} style={{ background: '#C9491F', color: '#fff' }}>{r.next.buttonLabel}</Link>}
      </div>
    </article>
  );
}

export const BADGES: Record<string, { text: string; bg: string; fg: string }> = {
  PENDING_PAYMENT: { text: 'Pay to confirm', bg: '#FBEBCF', fg: '#7A4708' },
  CONFIRMED: { text: 'Booked', bg: '#1F4D3A', fg: '#fff' },
  PICKED_UP: { text: 'In use', bg: '#DCEEDF', fg: '#1E5A37' },
  OVERDUE: { text: 'Overdue', bg: '#F7DCD7', fg: '#8E2A20' },
  RETURNED: { text: 'Returned', bg: '#FBEBCF', fg: '#7A4708' },
  DISPUTED: { text: 'Claim disputed', bg: '#F7DCD7', fg: '#8E2A20' },
  RETURN_CONFIRMED: { text: 'Refund on its way', bg: '#DCEEDF', fg: '#1E5A37' },
  DEPOSIT_REFUNDED: { text: 'Completed', bg: '#EDE5D5', fg: '#474C52' },
  CANCELLED: { text: 'Cancelled', bg: '#EDE5D5', fg: '#474C52' },
  REQUEST: { text: 'Awaiting owner', bg: '#FBEBCF', fg: '#7A4708' },
  COUNTER: { text: 'New dates suggested', bg: '#FBE3D8', fg: '#9A3412' },
};
