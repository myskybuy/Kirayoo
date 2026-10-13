'use client';
import { useState } from 'react';
import { claimAction } from '@/app/actions/bookings';
import PhotoUploader from './PhotoUploader';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
const KINDS = ['Damage', 'Missing part', 'Late return'];

/** O07 "Report an issue": claim amount (≤ deposit), late fee, reason, photos. */
export default function ClaimForm({ bookingId, deposit, renterFirst, lateDays, pricePerDay }: { bookingId: string; deposit: number; renterFirst: string; lateDays: number; pricePerDay: number }) {
  const maxLate = Math.min(deposit, lateDays * pricePerDay);
  const [kind, setKind] = useState(lateDays > 0 ? 'Late return' : 'Damage');
  const [late, setLate] = useState(lateDays > 0 ? String(maxLate) : '0');
  const [extra, setExtra] = useState('');
  const lateN = Math.min(Number(late) || 0, maxLate);
  const total = Math.min(deposit, lateN + (Number(extra) || 0));
  return (
    <form action={claimAction} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="amount" value={total} />
      <input type="hidden" name="lateFee" value={lateN} />
      <div><span className="k-lbl" style={{ marginBottom: '6px' }}>What happened?</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {KINDS.map((k) => <button key={k} className="k-pill" type="button" aria-pressed={kind === k} onClick={() => setKind(k)} style={kind === k ? { background: '#23262A', color: '#fff' } : { background: '#fff', color: '#23262A', boxShadow: 'inset 0 0 0 1px #E3DACA' }}>{k}</button>)}
        </div>
      </div>
      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(220px,100%),1fr))' }}>
        {lateDays > 0 && (
          <label className="k-lbl">Late fee ({lateDays} late day{lateDays > 1 ? 's' : ''} × {inr(pricePerDay)}, max {inr(maxLate)})
            <input className="k-in" inputMode="numeric" value={late} onChange={(e) => setLate(e.target.value.replace(/\D/g, ''))} />
          </label>
        )}
        <label className="k-lbl">{kind === 'Late return' ? 'Anything else to deduct (optional)' : 'Amount to deduct'}
          <input className="k-in" inputMode="numeric" value={extra} onChange={(e) => setExtra(e.target.value.replace(/\D/g, ''))} placeholder="₹" />
        </label>
      </div>
      <div><span className="k-lbl" style={{ marginBottom: '6px' }}>Evidence (photos, repair quote)</span><PhotoUploader kind="claim" name="photos" max={6} tile={110} label="Add photos" /></div>
      <label className="k-lbl">Explain for {renterFirst} and the admin<textarea className="k-in" name="reason" required minLength={5} maxLength={500} placeholder="What is damaged or missing, and how you worked out the amount."></textarea></label>
      <div style={{ padding: '16px', borderRadius: '18px', background: '#F6F1E7', display: 'grid', gap: '6px', fontSize: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Deposit held</span><b>{inr(deposit)}</b></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8E2A20' }}><span>Your claim</span><b>− {inr(total)}</b></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E5A37' }}><span>Back to {renterFirst}</span><b>{inr(deposit - total)}</b></div>
        <span className="mute" style={{ fontSize: '12.5px' }}>{renterFirst} can accept or dispute within 48 h (no answer = accepted). If disputed, Kirayo admin decides using both condition reports.</span>
        {Number(extra) + lateN > deposit && <span style={{ color: '#8E2A20', fontSize: '12.5px', fontWeight: 700 }}>A claim can’t be more than the deposit — capped at {inr(deposit)}.</span>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="k-btn" type="submit" disabled={total < 1} style={{ background: '#B3372B', color: '#fff' }}>Submit claim of {inr(total)}</button></div>
    </form>
  );
}
