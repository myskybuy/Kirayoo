'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { saveCheckoutAction } from '@/app/actions/checkout';
import type { FormState } from '@/app/actions/auth';

type Props = {
  bookingId: string;
  canPickup: boolean;
  canDeliver: boolean;
  initialMode: 'PICKUP' | 'DELIVERY';
  pickupNote: string;
  ownerFirst: string;
  area: string;
  address: string;
  phone: string;
  rent: number;
  dailyTotal: number;
  days: number;
  pricePerDay: number;
  deposit: number;
  deliveryFee: number;
  verified: boolean;
  idStatus: string;
  cancelLine: string;
};
const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function CheckoutForm(p: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCheckoutAction, undefined);
  const [mode, setMode] = useState(p.initialMode);
  const [address, setAddress] = useState(p.address);
  const [phone, setPhone] = useState(p.phone);
  const [terms, setTerms] = useState(false);
  const fee = mode === 'DELIVERY' ? p.deliveryFee : 0;
  const total = p.rent + p.deposit + fee;
  const opt = (on: boolean) => (on ? { boxShadow: 'inset 0 0 0 2px var(--kl-1f4d3a)', background: 'var(--kb-eef3ec)' } : { boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)', background: 'var(--kb-ffffff)' });

  return (
    <form action={action} style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'flex-start' }}>
      <input type="hidden" name="bookingId" value={p.bookingId} />
      <input type="hidden" name="mode" value={mode} />
      <main style={{ flex: '999 1 520px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="d" style={{ fontSize: '22px', fontWeight: '700' }}>Handover</h2>
          {p.canPickup && (
            <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px', borderRadius: '18px', cursor: 'pointer', ...opt(mode === 'PICKUP') }}>
              <input type="radio" name="m" checked={mode === 'PICKUP'} onChange={() => setMode('PICKUP')} style={{ width: '20px', height: '20px', accentColor: 'var(--kf-1f4d3a)', margin: '2px 0 0' }} />
              <div style={{ flex: '1' }}><b>Self pickup · free</b><p className="mute" style={{ fontSize: '13.5px' }}>{p.pickupNote || p.area}. The exact address is shared after payment.</p></div>
            </label>
          )}
          {p.canDeliver && (
            <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px', borderRadius: '18px', cursor: 'pointer', ...opt(mode === 'DELIVERY') }}>
              <input type="radio" name="m" checked={mode === 'DELIVERY'} onChange={() => setMode('DELIVERY')} style={{ width: '20px', height: '20px', accentColor: 'var(--kf-1f4d3a)', margin: '2px 0 0' }} />
              <div style={{ flex: '1' }}><b>Owner delivers and collects · {inr(p.deliveryFee)}</b><p className="mute" style={{ fontSize: '13.5px' }}>{p.ownerFirst} brings it to you and picks it up on the return day. One flat fee for both trips.</p></div>
            </label>
          )}
          {mode === 'DELIVERY' && <div><label className="lbl" htmlFor="addr">Delivery address</label><input className="in" id="addr" name="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Flat, building, street, area, PIN" maxLength={300} /></div>}
          <div><label className="lbl" htmlFor="ph">Phone for handover (shared with the owner after payment)</label><input className="in" id="ph" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98450 12345" /></div>
        </div>
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 className="d" style={{ fontSize: '22px', fontWeight: '700' }}>Good to know</h2>
          <ul style={{ margin: '0', paddingLeft: '18px', color: 'var(--kf-474c52)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>{p.cancelLine}</li>
            <li>Both of you photograph the item at pickup and return. Those photos decide any damage claim.</li>
            <li>Late return: {inr(p.pricePerDay)} per late day can be claimed from the deposit.</li>
            <li>The deposit is refunded after the owner confirms the return (automatically after 48 h).</li>
          </ul>
          <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', paddingTop: '6px', cursor: 'pointer' }}>
            <input type="checkbox" name="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--kf-1f4d3a)', margin: '2px 0 0', flex: 'none' }} />
            <span>I agree to the rental terms and the <Link href="/deposit-policy" target="_blank">Rental &amp; deposit policy</Link>, and will return the item in the same condition.</span>
          </label>
        </div>
      </main>
      <aside style={{ flex: '1 1 340px', minWidth: '0', position: 'sticky', top: '20px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 26px 56px -20px rgba(31,77,58,.42)' }}>
          <h2 className="d" style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Price details</h2>
          <div className="kv"><span>Rent · {inr(p.pricePerDay)} × {p.days} day{p.days > 1 ? 's' : ''}</span><span>{inr(p.dailyTotal)}</span></div>
          {p.dailyTotal > p.rent && <div className="kv" style={{ color: 'var(--kf-1e5a37)' }}><span>Weekly price discount</span><span>−{inr(p.dailyTotal - p.rent)}</span></div>}
          {fee > 0 && <div className="kv"><span>Delivery fee</span><span>{inr(fee)}</span></div>}
          <div className="kv" style={{ fontWeight: '700' }}><span>Rent subtotal</span><span>{inr(p.rent + fee)}</span></div>
          <div className="kv" style={{ color: 'var(--kf-1e5a37)', fontWeight: '700', padding: '10px 12px', borderRadius: '14px', background: 'var(--kb-dceedf)', margin: '4px 0' }}><span>Refundable deposit</span><span>{inr(p.deposit)}</span></div>
          <div style={{ height: '1px', background: 'var(--kb-e3daca)', margin: '8px 0' }}></div>
          <div className="kv" style={{ fontWeight: '800', fontSize: '19px' }}><span>Total to pay</span><span>{inr(total)}</span></div>
          <p className="mute" style={{ fontSize: '12.5px', marginBottom: '10px' }}>You get {inr(p.deposit)} back after a clean return.</p>
          {!p.verified && (
            <p className="k-alert warn" style={{ marginBottom: '8px' }}>
              {p.idStatus === 'PENDING' ? 'Your ID is under review — usually approved within a few hours. You can pay as soon as it is approved.' : 'Verify your ID to pay — usually approved within a few hours. Submitting it extends your hold by 12 h.'}
            </p>
          )}
          {state?.error && <p className="k-alert err" role="alert">{state.error}</p>}
          <button className="btn btn-p" type="submit" disabled={pending || !terms} style={{ width: '100%' }}>{pending ? 'Saving…' : p.verified ? 'Continue to payment' : p.idStatus === 'PENDING' ? 'Save & check ID status' : 'Confirm & verify ID'}</button>
          {!terms && <p className="mute" style={{ fontSize: '12.5px', textAlign: 'center', marginTop: '6px' }}>Tick “I agree” to continue.</p>}
          {!p.verified && p.idStatus !== 'PENDING' && <p className="mute" style={{ fontSize: '12.5px', textAlign: 'center' }}>One-time check, about 2 minutes</p>}
        </div>
      </aside>
    </form>
  );
}
