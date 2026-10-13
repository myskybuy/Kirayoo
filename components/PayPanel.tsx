'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { confirmCashAction } from '@/app/actions/checkout';

type Props = {
  bookingId: string;
  extensionId?: string;
  amount: number;
  cashAllowed: boolean;
  ownerFirst: string;
  razorpay: boolean;
  deposit: number;
};
const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

type RzpResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
declare global {
  interface Window {
    Razorpay?: new (o: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: { error?: { description?: string; reason?: string } }) => void) => void };
  }
}

function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((res) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => res(true);
    s.onerror = () => res(false);
    document.body.appendChild(s);
  });
}

/** R11: Option 1 pay online now (Razorpay test / demo) · Option 2 pay at pickup. */
export default function PayPanel(p: Props) {
  const router = useRouter();
  const [opt, setOpt] = useState<'online' | 'cash'>('online');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const failUrl = (reason: string) => `/pay/${p.bookingId}?failed=1&reason=${encodeURIComponent(reason)}${p.extensionId ? `&ext=${p.extensionId}` : ''}`;

  async function post(url: string, body: Record<string, unknown>) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { ok: r.ok, j: await r.json().catch(() => ({ error: 'Something went wrong.' })) };
  }

  async function demo(outcome: 'success' | 'fail') {
    setBusy(true);
    setError('');
    try {
      const { ok, j } = await post('/api/payments/demo', { bookingId: p.bookingId, extensionId: p.extensionId, outcome });
      if (!ok) return setError(j.error);
      if (j.failed) return router.push(failUrl(j.reason));
      if (j.error) setError(j.error);
      if (j.redirect) router.push(j.redirect);
    } catch {
      setError('Network error — nothing was charged. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function payOnline() {
    setBusy(true);
    setError('');
    try {
      const { ok, j } = await post('/api/payments/order', { bookingId: p.bookingId, extensionId: p.extensionId });
      if (!ok) return setError(j.error);
      if (j.mode === 'demo') return demo('success');
      if (!(await loadCheckout()) || !window.Razorpay) return setError('Could not load Razorpay. Check your connection and try again.');
      const rzp = new window.Razorpay({
        key: j.key,
        order_id: j.orderId,
        amount: j.amount,
        currency: j.currency,
        name: j.name,
        description: j.description,
        prefill: j.prefill,
        theme: { color: '#1F4D3A' },
        handler: async (resp: RzpResponse) => {
          setBusy(true);
          const v = await post('/api/payments/verify', { bookingId: p.bookingId, extensionId: p.extensionId, ...resp });
          if (!v.ok) return router.push(failUrl(v.j.error || 'Payment could not be verified.'));
          if (v.j.error) setError(v.j.error);
          router.push(v.j.redirect);
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on('payment.failed', (r) => router.push(failUrl(r.error?.description || r.error?.reason || 'The payment failed.')));
      rzp.open();
    } catch {
      setError('Network error — nothing was charged. Try again.');
      setBusy(false);
    }
  }

  const choice = (on: boolean) => (on ? { background: '#EEF3EC', boxShadow: 'inset 0 0 0 2px #1F4D3A', color: '#23262A' } : { background: '#fff', boxShadow: 'inset 0 0 0 1px #E3DACA', color: '#23262A' });
  const dot = (on: boolean) => (on ? { width: '22px', height: '22px', borderRadius: '50%', background: '#1F4D3A', boxShadow: 'inset 0 0 0 5px #DCE6DA', flex: 'none' } : { width: '22px', height: '22px', borderRadius: '50%', background: '#fff', boxShadow: 'inset 0 0 0 1.5px #BFB4A0', flex: 'none' });

  return (
    <>
      <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <b style={{ fontSize: '14px', color: '#474C52' }}>How do you want to pay?</b>
        <button className="pm" type="button" aria-pressed={opt === 'online'} onClick={() => setOpt('online')} style={choice(opt === 'online')}>
          <span style={dot(opt === 'online')}></span>
          <span style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>Option 1 — Pay online now<span className="mute" style={{ fontSize: '12.5px', fontWeight: '500' }}>UPI, card or netbanking via Razorpay. Confirms your booking instantly.</span></span>
          <b>{inr(p.amount)}</b>
        </button>
        {p.cashAllowed && (
          <button className="pm" type="button" aria-pressed={opt === 'cash'} onClick={() => setOpt('cash')} style={choice(opt === 'cash')}>
            <span style={dot(opt === 'cash')}></span>
            <span style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>Option 2 — Pay at pickup (cash / UPI)<span className="mute" style={{ fontSize: '12.5px', fontWeight: '500' }}>Booking is confirmed now; you pay {p.ownerFirst} {inr(p.amount)} in person at pickup.</span></span>
            <b>₹0 now</b>
          </button>
        )}
        {opt === 'online' ? (
          <div style={{ padding: '16px', borderRadius: '18px', background: '#EEF3EC', fontSize: '13.5px', color: '#474C52', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {p.razorpay ? (
              <><b style={{ color: '#23262A' }}>Razorpay test mode — no real money.</b><span>Use UPI <code>success@razorpay</code> or test card 4111 1111 1111 1111 (any future date, any CVV).</span></>
            ) : (
              <><b style={{ color: '#23262A' }}>Demo payment mode</b><span>Razorpay keys aren’t set, so this simulates the payment. Use “Simulate failed payment” to see the failure screen.</span></>
            )}
          </div>
        ) : (
          <div style={{ padding: '16px', borderRadius: '18px', background: '#FBEBCF', fontSize: '13.5px', color: '#7A4708', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <b>How pay-at-pickup works</b>
            <span>Your dates are confirmed right away. At pickup, pay {p.ownerFirst} the rent + deposit ({inr(p.amount)}) in cash or UPI before you take the item. At return, {p.ownerFirst} hands the {inr(p.deposit)} deposit back in cash, minus any claim you accept. Kirayo records the booking but doesn’t hold this money.</span>
          </div>
        )}
      </div>
      {error && <p className="k-alert err" role="alert">{error}</p>}
      <div className="k-paybar" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {opt === 'online' ? (
          <>
            <button className="btn btn-p" type="button" disabled={busy} onClick={payOnline} style={{ width: '100%' }}>
              <svg className="ic" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5"></rect><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path></svg>{busy ? 'Processing…' : `Pay ${inr(p.amount)}`}
            </button>
            {!p.razorpay && <button type="button" disabled={busy} onClick={() => demo('fail')} style={{ border: 0, background: 'none', fontSize: '13px', color: '#60666C', textDecoration: 'underline', cursor: 'pointer' }}>Simulate failed payment</button>}
          </>
        ) : (
          <form action={confirmCashAction}>
            <input type="hidden" name="bookingId" value={p.bookingId} />
            <button className="btn btn-g" type="submit" style={{ width: '100%', background: '#1F4D3A', color: '#fff' }}>Confirm — I’ll pay at pickup</button>
          </form>
        )}
      </div>
    </>
  );
}
