'use client';
import { useState } from 'react';
import { requestExtensionAction } from '@/app/actions/bookings';
import { countDays, rentFor } from '@/lib/pricing';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
const add = (d: string, n: number) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const nice = (d: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(d + 'T00:00:00Z')).replace(',', '');

/** R16 "Extend until…" with live price (same rule as the server). */
export default function ExtensionForm({ bookingId, start, end, pricePerDay, pricePerWeek, rentAmount, ownerFirst, unavailable, maxDays, cash }: { bookingId: string; start: string; end: string; pricePerDay: number; pricePerWeek: number | null; rentAmount: number; ownerFirst: string; unavailable: string[]; maxDays: number; cash: boolean }) {
  const [newEnd, setNewEnd] = useState(add(end, 1));
  const busy = new Set(unavailable);
  const extraDays = Math.max(0, Math.round((Date.parse(newEnd + 'T00:00:00Z') - Date.parse(end + 'T00:00:00Z')) / 86400000));
  const total = rentFor(countDays(start, newEnd), pricePerDay, pricePerWeek);
  const extra = Math.max(0, Math.min(extraDays * pricePerDay, total - rentAmount));
  let blocked = false;
  for (let d = add(end, 1); d <= newEnd; d = add(d, 1)) if (busy.has(d)) blocked = true;
  const tooLong = countDays(start, newEnd) > maxDays;
  return (
    <form action={requestExtensionAction} className="card" id="extension" style={{ padding: '26px', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="newEnd" value={newEnd} />
      <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h2 className="d" style={{ fontSize: '24px', fontWeight: '700' }}>Extend until…</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[1, 2, 4].map((n) => {
            const d = add(end, n);
            return <button key={n} className="k-pill" type="button" aria-pressed={newEnd === d} onClick={() => setNewEnd(d)} style={newEnd === d ? { background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)' } : { background: 'var(--kb-ffffff)', color: 'var(--kf-23262a)', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)' }}>+{n} day{n > 1 ? 's' : ''} · {nice(d)}</button>;
          })}
        </div>
        <label className="k-lbl">Or pick a date<input className="k-in" type="date" min={add(end, 1)} value={newEnd} onChange={(e) => e.target.value && setNewEnd(e.target.value)} /></label>
      </div>
      <div style={{ flex: '1 1 280px', padding: '20px', borderRadius: '20px', background: 'var(--kb-eef3ec)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>New return</span><b>{nice(newEnd)}</b></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Extra days</span><b>{extraDays}</b></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '17px' }}><span>Extra rent</span><span>{inr(extra)}</span></div>
        <span className="mute" style={{ fontSize: '12.5px' }}>{cash ? `If ${ownerFirst} accepts, pay the extra in cash / UPI.` : `If ${ownerFirst} accepts, you pay ${inr(extra)} online to lock it in.`}</span>
        {blocked && <span className="k-alert warn">Some of those days are already booked — pick an earlier date.</span>}
        {tooLong && <span className="k-alert warn">That’s longer than the maximum of {maxDays} days.</span>}
        <button className="k-btn g" type="submit" disabled={blocked || tooLong || extraDays < 1}>Ask {ownerFirst} to extend</button>
      </div>
    </form>
  );
}
