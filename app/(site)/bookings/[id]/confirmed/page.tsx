import Link from 'next/link';
import { redirect } from 'next/navigation';
import PageCss from '@/components/PageCss';
import CheckoutSteps from '@/components/CheckoutSteps';
import { requireUser } from '@/lib/auth';
import { loadBooking } from '@/lib/booking-view';
import { fmtDay, fmtRange, inr, todayIST, addDays, dayOf } from '@/lib/format';

export const metadata = { title: 'Booking confirmed' };

export default async function ConfirmedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/bookings/${id}/confirmed`);
  const b = await loadBooking(id, user, 'RENTER');
  if (b.status === 'PENDING_PAYMENT') redirect(`/pay/${b.id}`);
  if (b.status !== 'CONFIRMED') redirect(`/bookings/${b.id}`);
  const o = b.owner;
  const first = o.name.split(' ')[0];
  const start = dayOf(b.startDate);
  const when = start === todayIST() ? 'today' : start === addDays(todayIST(), 1) ? 'tomorrow' : fmtDay(start);
  const cash = b.paymentMode === 'CASH_AT_PICKUP';
  return (
    <>
      <PageCss id="R12-Confirmed" />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(20px,5vw,40px) 16px 72px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <CheckoutSteps at={4} />
        <section style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '12px 0' }}>
          <span style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#1F4D3A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 12px #DCE6DA,0 0 0 24px #EEF3EC' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '44px', height: '44px', strokeWidth: '2.4' }}><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg></span>
          <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: '#C9491F', marginTop: '18px' }}>Booking {b.code}</span>
          <h1 className="d" style={{ fontSize: 'clamp(34px,4.4vw,56px)', fontWeight: '700', lineHeight: '1.02', color: '#1F4D3A' }}>You&apos;re all set for {when}!</h1>
          <p className="mute" style={{ maxWidth: '520px' }}>{cash ? `Confirmed — you pay ${inr(b.total)} to ${first} in cash or UPI at pickup.` : `${inr(b.amountPaid)} paid.`} {first} has been notified{b.mode === 'DELIVERY' ? ` and will deliver on ${fmtDay(b.startDate)}` : ` — pick it up on ${fmtDay(b.startDate)}`}.</p>
        </section>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'stretch' }}>
          <div style={{ flex: '1 1 340px', borderRadius: '28px', background: '#1F4D3A', color: '#F6F1E7', padding: '26px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden="true" style={{ position: 'absolute', right: '-60px', top: '-60px', width: '200px', height: '200px', borderRadius: '50%', border: '34px solid rgba(246,241,231,.06)' }}></div>
            <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: '#E8643C' }}>Your pickup code</span>
            <div style={{ display: 'flex', gap: '10px' }} aria-label={`Pickup code ${b.pickupOtp.split('').join(' ')}`}>{b.pickupOtp.split('').map((d, i) => <span key={i} className="dg">{d}</span>)}</div>
            <p style={{ fontSize: '14px', color: '#DCE6DA' }}>Share it with {first} only when you have the item in your hands and have checked it. The code is also on your rental page.</p>
          </div>
          <div className="card" style={{ flex: '1 1 340px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <b className="d" style={{ fontSize: '20px', marginBottom: '8px' }}>Booking details</b>
            <div className="kv"><span className="mute">Item</span><b>{b.item.title}</b></div>
            <div className="kv"><span className="mute">Dates</span><b>{fmtRange(b.startDate, b.endDate)} · {b.days} day{b.days > 1 ? 's' : ''}</b></div>
            <div className="kv"><span className="mute">Handover</span><b>{b.mode === 'DELIVERY' ? `Delivery to ${b.address}` : `Pickup at ${o.address ?? b.item.area}`}</b></div>
            <div className="kv"><span className="mute">Owner phone</span><b>{o.phone ?? 'Ask in chat'}</b></div>
            <div className="kv"><span className="mute">{cash ? 'Rent due at pickup' : 'Rent paid'}</span><b>{inr(b.rentAmount + b.deliveryFee)}</b></div>
            <div className="kv" style={{ border: '0' }}><span className="mute">{cash ? 'Deposit due at pickup' : 'Deposit held'}</span><b style={{ color: '#1E5A37' }}>{inr(b.deposit)}</b></div>
          </div>
        </div>
        <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <b className="d" style={{ fontSize: '20px' }}>What happens next</b>
          <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14.5px', color: '#474C52' }}>
            <li><b>Before {fmtDay(b.startDate)}:</b> agree the time in chat. We’ll remind you the day before.</li>
            <li><b>At pickup:</b> check the item, {cash ? `pay ${inr(b.total)}, ` : ''}then read your 4-digit code to {first}. You can add your own condition photos too.</li>
            <li><b>Return by {fmtDay(b.endDate)}:</b> show your return code (it appears on your rental page after pickup).</li>
            <li><b>Deposit:</b> {cash ? `${first} hands it back in cash at return, minus any claim you accept.` : `refunded to your payment method after ${first} confirms the return (automatically after 48 h).`}</li>
          </ol>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          <Link className="btn btn-p" href={`/bookings/${b.id}`}>View rental</Link>
          {b.conversationId && <Link className="btn btn-o" href={`/chat/${b.conversationId}`}>Message {first}</Link>}
        </div>
      </div>
    </>
  );
}
