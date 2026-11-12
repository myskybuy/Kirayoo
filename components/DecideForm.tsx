'use client';
import { useState } from 'react';
import { decideDisputeAction } from '@/app/actions/admin';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

/** A06 "Decide the refund". */
export default function DecideForm({ bookingId, claim, deposit, renterFirst, ownerFirst, back, cash }: { bookingId: string; claim: number; deposit: number; renterFirst: string; ownerFirst: string; back: string; cash: boolean }) {
  const presets = [
    { label: 'Refund renter in full', sub: 'Claim not upheld', v: 0 },
    { label: 'Split 50 / 50', sub: `${inr(Math.round(claim / 2))} each`, v: Math.round(claim / 2) },
    { label: 'Uphold claim', sub: `${inr(claim)} to owner`, v: claim },
  ];
  const [amt, setAmt] = useState(0);
  const [custom, setCustom] = useState(false);
  return (
    <form action={decideDisputeAction} className="card" style={{ padding: '22px', display: 'flex', flexWrap: 'wrap', gap: '22px' }}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="back" value={back} />
      <input type="hidden" name="amount" value={amt} />
      <div style={{ flex: '2 1 380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <b className="d" style={{ fontSize: '20px' }}>Decide the refund</b>
        <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
          {presets.map((p) => {
            const on = !custom && amt === p.v;
            return <button key={p.label} className="opt" type="button" aria-pressed={on} onClick={() => { setCustom(false); setAmt(p.v); }} style={on ? { background: 'var(--kb-eef3ec)', boxShadow: 'inset 0 0 0 2px var(--kl-1f4d3a)', color: 'var(--kf-23262a)' } : { background: 'var(--kb-ffffff)', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)', color: 'var(--kf-23262a)' }}><b>{p.label}</b><span className="mute" style={{ fontSize: '12.5px' }}>{p.sub}</span></button>;
          })}
        </div>
        <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--kf-474c52)', display: 'flex', flexDirection: 'column', gap: '6px' }}>Or another amount to the owner (₹0 – {inr(claim)})
          <input className="k-in" inputMode="numeric" value={custom ? String(amt) : ''} placeholder="Custom amount" onChange={(e) => { setCustom(true); setAmt(Math.min(claim, Number(e.target.value.replace(/\D/g, '')) || 0)); }} />
        </label>
        <label htmlFor="why" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--kf-474c52)' }}>Decision note (sent to both)</label>
        <textarea id="why" name="note" maxLength={500} style={{ boxSizing: 'border-box', width: '100%', minHeight: '80px', padding: '12px 14px', borderRadius: '14px', border: '1.5px solid var(--kl-e3daca)', font: "500 14.5px/1.5 'Plus Jakarta Sans',sans-serif" }}></textarea>
      </div>
      <div style={{ flex: '1 1 260px', padding: '18px', borderRadius: '20px', background: 'var(--kb-f6f1e7)', display: 'flex', flexDirection: 'column' }}>
        <div className="kv"><span>Deposit</span><b>{inr(deposit)}</b></div>
        <div className="kv"><span>Claimed</span><span>{inr(claim)}</span></div>
        <div className="kv" style={{ color: 'var(--kf-8e2a20)' }}><span>To {ownerFirst}</span><b>{inr(amt)}</b></div>
        <div style={{ height: '1px', background: 'var(--kb-e3daca)', margin: '8px 0' }}></div>
        <div className="kv" style={{ fontWeight: '800', color: 'var(--kf-1e5a37)' }}><span>{renterFirst} gets back</span><span>{inr(deposit - amt)}</span></div>
        {cash && <span className="mute" style={{ fontSize: '12.5px' }}>Cash booking: this is recorded only; the owner settles in cash.</span>}
        <button className="btn" type="submit" style={{ background: 'var(--kb-23262a)', color: 'var(--kf-ffffff)', marginTop: '12px' }}>Close dispute</button>
      </div>
    </form>
  );
}
