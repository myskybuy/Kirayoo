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
    <article style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', padding: '14px', borderRadius: '26px', background: 'var(--kb-fffdf8)', boxShadow: '0 1px 2px rgba(35,38,42,.06),0 8px 24px -12px rgba(31,77,58,.22)' }}>
      <div style={{ width: '150px', maxWidth: '100%', height: '112px', borderRadius: '18px', background: 'var(--kb-bfd1bd)', overflow: 'hidden', flex: 'none' }}>{r.photo && <img src={r.photo} alt="" className="k-photo" />}</div>
      <div style={{ flex: '1 1 260px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}><span className="badge" style={{ background: r.badge.bg, color: r.badge.fg }}>{r.badge.text}</span>{r.code && <span className="mute" style={{ fontSize: '12.5px' }}>{r.code}</span>}</div>
        <b style={{ fontSize: '17px' }}>{r.title}</b>
        <span className="mute" style={{ fontSize: '13.5px' }}>{r.sub}</span>
        {(r.note || r.next) && <span style={{ fontSize: '13.5px', fontWeight: '600', color: r.noteTone === 'alert' || r.next?.tone === 'alert' ? 'var(--kf-8e2a20)' : 'var(--kf-1f4d3a)' }}>{r.note ?? r.next?.text}</span>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingRight: '6px' }}>
        <Link className="btn" href={r.detailsHref} style={{ color: 'var(--kf-1f4d3a)', boxShadow: 'inset 0 0 0 1.5px var(--kl-1f4d3a)' }}>{r.detailsLabel ?? 'Details'}</Link>
        {r.next?.buttonLabel && r.next.href && r.next.tone !== 'done' && <Link className="btn" href={r.next.href} style={{ background: 'var(--kb-c9491f)', color: 'var(--kf-ffffff)' }}>{r.next.buttonLabel}</Link>}
      </div>
    </article>
  );
}

export const BADGES: Record<string, { text: string; bg: string; fg: string }> = {
  PENDING_PAYMENT: { text: 'Pay to confirm', bg: 'var(--kb-fbebcf)', fg: 'var(--kf-7a4708)' },
  CONFIRMED: { text: 'Booked', bg: 'var(--kb-1f4d3a)', fg: 'var(--kf-ffffff)' },
  PICKED_UP: { text: 'In use', bg: 'var(--kb-dceedf)', fg: 'var(--kf-1e5a37)' },
  OVERDUE: { text: 'Overdue', bg: 'var(--kb-f7dcd7)', fg: 'var(--kf-8e2a20)' },
  RETURNED: { text: 'Returned', bg: 'var(--kb-fbebcf)', fg: 'var(--kf-7a4708)' },
  DISPUTED: { text: 'Claim disputed', bg: 'var(--kb-f7dcd7)', fg: 'var(--kf-8e2a20)' },
  RETURN_CONFIRMED: { text: 'Refund on its way', bg: 'var(--kb-dceedf)', fg: 'var(--kf-1e5a37)' },
  DEPOSIT_REFUNDED: { text: 'Completed', bg: 'var(--kb-ede5d5)', fg: 'var(--kf-474c52)' },
  CANCELLED: { text: 'Cancelled', bg: 'var(--kb-ede5d5)', fg: 'var(--kf-474c52)' },
  REQUEST: { text: 'Awaiting owner', bg: 'var(--kb-fbebcf)', fg: 'var(--kf-7a4708)' },
  COUNTER: { text: 'New dates suggested', bg: 'var(--kb-fbe3d8)', fg: 'var(--kf-9a3412)' },
};
