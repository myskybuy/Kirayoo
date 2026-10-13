'use client';
import Link from 'next/link';
import { useState } from 'react';
import RangeCalendar from './RangeCalendar';
import { quote, rangeError } from '@/lib/pricing';

type Props = {
  item: { id: string; pricePerDay: number; pricePerWeek: number | null; deposit: number; minDays: number; maxDays: number; canPickup: boolean; canDeliver: boolean; pickupNote: string | null; area: string };
  ownerFirst: string;
  today: string;
  unavailable: string[];
  deliveryFee: number;
  initial: { start?: string; end?: string };
  loggedIn: boolean;
  isOwner: boolean;
};

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
const nice = (d?: string) => (d ? new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(d + 'T00:00:00Z')).replace(',', '') : 'Add date');

export default function BookingWidget({ item, ownerFirst, today, unavailable, deliveryFee, initial, loggedIn, isOwner }: Props) {
  const [range, setRange] = useState<{ start?: string; end?: string }>(initial);
  const [mode, setMode] = useState<'PICKUP' | 'DELIVERY'>(item.canPickup ? 'PICKUP' : 'DELIVERY');
  const [msg, setMsg] = useState('');
  const complete = range.start && range.end;
  const err = complete ? rangeError(item, range.start!, range.end!, today) : null;
  const q = complete && !err ? quote(item, range.start!, range.end!, mode, deliveryFee) : null;
  const qs = new URLSearchParams({ item: item.id, ...(range.start ? { start: range.start } : {}), ...(range.end ? { end: range.end } : {}), mode });
  const chatHref = `/chat/new?${qs}`;
  const href = loggedIn ? chatHref : `/login?next=${encodeURIComponent(`/items/${item.id}?${new URLSearchParams({ ...(range.start ? { start: range.start } : {}), ...(range.end ? { end: range.end } : {}) })}`)}`;

  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 26px 56px -20px rgba(31,77,58,.42)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span><span className="d" style={{ fontSize: '30px', fontWeight: '700' }}>{inr(item.pricePerDay)}</span><span className="mute"> / day</span></span>
        <span className="mute" style={{ fontSize: '13px' }}>Deposit {inr(item.deposit)}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: '18px', boxShadow: 'inset 0 0 0 1.5px #E3DACA', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderRight: '1.5px solid #E3DACA' }}><span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '.06em', color: '#1F4D3A' }}>PICKUP</span><p style={{ fontWeight: '700', fontSize: '14.5px' }}>{nice(range.start)}</p></div>
        <div style={{ padding: '10px 14px' }}><span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '.06em', color: '#1F4D3A' }}>RETURN</span><p style={{ fontWeight: '700', fontSize: '14.5px' }}>{nice(range.end)}</p></div>
      </div>
      <div>
        <RangeCalendar small today={today} unavailable={unavailable} value={range} onChange={(r) => { setMsg(''); setRange(r); }} onBlocked={setMsg} />
        <p className="mute" style={{ fontSize: '12px', marginTop: '6px' }}>{q ? `${q.days} day${q.days > 1 ? 's' : ''} selected` : range.start ? 'Now tap the return day' : 'Tap a pickup day, then a return day'}</p>
      </div>
      {(msg || err) && <p className="k-alert warn" role="alert">{msg || err}</p>}
      <fieldset style={{ border: '0', margin: '0', padding: '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <legend style={{ fontSize: '13px', fontWeight: '700', color: '#474C52', marginBottom: '6px' }}>Handover</legend>
        {item.canPickup && (
          <label className="opt" style={mode === 'PICKUP' ? { background: '#EEF3EC', boxShadow: 'inset 0 0 0 2px #1F4D3A' } : { background: '#fff', boxShadow: 'inset 0 0 0 1px #E3DACA' }}>
            <input type="radio" name="ho" checked={mode === 'PICKUP'} onChange={() => setMode('PICKUP')} />
            <span style={{ flex: '1' }}><b>Self pickup</b><br /><span className="mute" style={{ fontSize: '12.5px' }}>{item.pickupNote || item.area}</span></span><b>Free</b>
          </label>
        )}
        {item.canDeliver && (
          <label className="opt" style={mode === 'DELIVERY' ? { background: '#EEF3EC', boxShadow: 'inset 0 0 0 2px #1F4D3A' } : { background: '#fff', boxShadow: 'inset 0 0 0 1px #E3DACA' }}>
            <input type="radio" name="ho" checked={mode === 'DELIVERY'} onChange={() => setMode('DELIVERY')} />
            <span style={{ flex: '1' }}><b>Owner delivers</b><br /><span className="mute" style={{ fontSize: '12.5px' }}>{item.area} &amp; nearby · drop-off + collection</span></span><b>{inr(deliveryFee)}</b>
          </label>
        )}
      </fieldset>
      {q && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14.5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ textDecoration: 'underline dotted #BFB4A0' }}>{inr(item.pricePerDay)} × {q.days} day{q.days > 1 ? 's' : ''}</span><span>{inr(q.dailyTotal)}</span></div>
          {q.weeklyDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E5A37' }}><span>Weekly price discount</span><span>−{inr(q.weeklyDiscount)}</span></div>}
          {q.deliveryFee > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery fee</span><span>{inr(q.deliveryFee)}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E5A37', fontWeight: '600' }}><span>Refundable deposit</span><span>{inr(q.deposit)}</span></div>
          <div style={{ height: '1px', background: '#E3DACA', margin: '6px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '17px' }}><span>Total</span><span>{inr(q.total)}</span></div>
        </div>
      )}
      {isOwner ? (
        <Link className="btn btn-o" href={`/owner/items/${item.id}/edit`} style={{ width: '100%' }}>This is your item · Edit</Link>
      ) : (
        <>
          {q ? <Link className="btn btn-p" href={href} style={{ width: '100%' }}>Request to book</Link> : <button className="btn btn-p" type="button" disabled style={{ width: '100%' }}>Request to book</button>}
          <p className="mute" style={{ fontSize: '12.5px', textAlign: 'center' }}>You won&apos;t pay yet. {ownerFirst} will accept or suggest new dates in chat.</p>
        </>
      )}
    </div>
  );
}
