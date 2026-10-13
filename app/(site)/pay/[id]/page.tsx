import Link from 'next/link';
import { redirect } from 'next/navigation';
import PageCss from '@/components/PageCss';
import CheckoutSteps from '@/components/CheckoutSteps';
import PayPanel from '@/components/PayPanel';
import { requireUser } from '@/lib/auth';
import { loadBooking } from '@/lib/booking-view';
import { fmtDay, fmtRange, fmtTime, inr } from '@/lib/format';
import { razorpayEnabled } from '@/lib/payments';
import { runDueJobs } from '@/lib/jobs';

export const metadata = { title: 'Payment' };

export default async function PayPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ failed?: string; reason?: string; ext?: string; error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/pay/${id}${sp.ext ? `?ext=${sp.ext}` : ''}`);
  await runDueJobs();
  const b = await loadBooking(id, user, 'RENTER');
  const ext = sp.ext ? b.extensions.find((e) => e.id === sp.ext && e.status === 'ACCEPTED') : null;
  if (sp.ext && !ext) redirect(`/bookings/${b.id}`);
  if (!ext && b.status !== 'PENDING_PAYMENT') redirect(`/bookings/${b.id}`);
  if (user.idStatus !== 'VERIFIED') redirect(`/verify-id?next=${encodeURIComponent(`/pay/${b.id}`)}`);
  const amount = ext ? ext.extraAmount : b.total;
  const ownerFirst = b.owner.name.split(' ')[0];

  // S06 — payment failed, with retry.
  if (sp.failed) {
    return (
      <>
        <PageCss id="S06-PaymentFailed" />
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'clamp(20px,5vw,48px) 16px 72px', boxSizing: 'border-box' }}>
          <section style={{ background: '#FFFDF8', borderRadius: '32px', padding: '36px clamp(20px,5vw,40px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 30px 60px -24px rgba(31,77,58,.3)' }}>
            <span style={{ width: '84px', height: '84px', borderRadius: '50%', background: '#F7DCD7', color: '#B3372B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="3"></rect><path d="M3 10h18M9 15h1M14 13l4 4M18 13l-4 4"></path></svg></span>
            <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: '#8E2A20' }}>Payment failed</span>
            <h1 className="d" style={{ fontSize: 'clamp(28px,3.2vw,38px)', fontWeight: '700' }}>The payment didn’t go through</h1>
            <p className="mute">No money was taken. If anything was debited, it’s reversed automatically within 5–7 working days.{!ext && b.holdExpiresAt ? ' Your dates are still held.' : ''}</p>
            <div style={{ width: '100%', textAlign: 'left' }}>
              <div className="kv"><span className="mute">Amount</span><b>{inr(amount)}</b></div>
              <div className="kv"><span className="mute">For</span><b>{b.item.title}{ext ? ' · extension' : ''}</b></div>
              <div className="kv" style={{ border: '0' }}><span className="mute">Reason</span><b>{sp.reason || 'Declined'}</b></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <Link className="btn" href={`/pay/${b.id}${ext ? `?ext=${ext.id}` : ''}`} style={{ background: '#C9491F', color: '#fff' }}>Try again</Link>
              <Link className="btn" href={`/bookings/${b.id}`} style={{ color: '#1F4D3A', boxShadow: 'inset 0 0 0 1.5px #1F4D3A' }}>Back to my booking</Link>
            </div>
            {!ext && b.holdExpiresAt && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#7A4708', background: '#FBEBCF', padding: '6px 12px', borderRadius: '999px' }}>Dates held until {fmtTime(b.holdExpiresAt)}</span>}
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <PageCss id="R11-Payment" />
      <div className="wrap" style={{ paddingTop: '28px', paddingBottom: '72px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {!ext && <CheckoutSteps at={3} />}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'flex-start' }}>
          <main style={{ flex: '999 1 500px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,44px)', fontWeight: '700' }}>{ext ? 'Pay for your extension' : 'Pay securely'}</h1>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: '#FBEBCF', color: '#7A4708', fontSize: '12.5px', fontWeight: '700' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '15px', height: '15px' }}><path d="M12 3.5 2.5 20h19z"></path><path d="M12 10v4.5"></path></svg>{razorpayEnabled() ? 'Razorpay test mode · no real money' : 'Demo mode · no real money'}</span>
            </div>
            {sp.error && <p className="k-alert err">{sp.error}</p>}
            <PayPanel bookingId={b.id} extensionId={ext?.id} amount={amount} cashAllowed={!ext && b.item.acceptsCashAtPickup} ownerFirst={ownerFirst} razorpay={razorpayEnabled()} deposit={b.deposit} />
            {!ext && (
              <div style={{ padding: '16px 18px', borderRadius: '20px', background: '#1F4D3A', color: '#F6F1E7', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <svg className="ic" viewBox="0 0 24 24" style={{ color: '#E8643C', marginTop: '2px' }}><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"></path><path d="m9 12 2.2 2.2L15.5 10"></path></svg>
                <p style={{ fontSize: '14px', color: '#DCE6DA' }}><b style={{ color: '#fff' }}>Paid online, your {inr(b.deposit)} deposit is held by Kirayo, not the owner.</b> It’s refunded to the same method after {ownerFirst} confirms the return.</p>
              </div>
            )}
          </main>
          <aside style={{ flex: '1 1 340px', minWidth: '0' }}>
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '64px', height: '52px', borderRadius: '14px', background: '#BFD1BD', overflow: 'hidden', flex: 'none' }}>{b.item.photos[0] && <img src={b.item.photos[0]} alt="" className="k-photo" />}</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}><b style={{ fontSize: '14.5px' }}>{b.item.title}</b><span className="mute" style={{ fontSize: '12.5px' }}>{ext ? `Extend to ${fmtDay(ext.newEndDate)} · +${ext.extraDays} day${ext.extraDays > 1 ? 's' : ''}` : `${fmtRange(b.startDate, b.endDate)} · ${b.days} day${b.days > 1 ? 's' : ''}`}</span></div>
              </div>
              {ext ? (
                <div className="kv"><span>Extra rent · {ext.extraDays} day{ext.extraDays > 1 ? 's' : ''}</span><span>{inr(ext.extraAmount)}</span></div>
              ) : (
                <>
                  <div className="kv"><span>Rent {inr(b.pricePerDay)} × {b.days}</span><span>{inr(b.pricePerDay * b.days)}</span></div>
                  {b.pricePerDay * b.days > b.rentAmount && <div className="kv" style={{ color: '#1E5A37' }}><span>Weekly price discount</span><span>−{inr(b.pricePerDay * b.days - b.rentAmount)}</span></div>}
                  {b.deliveryFee > 0 && <div className="kv"><span>Delivery fee</span><span>{inr(b.deliveryFee)}</span></div>}
                  <div className="kv" style={{ color: '#1E5A37', fontWeight: '700' }}><span>Refundable deposit</span><span>{inr(b.deposit)}</span></div>
                </>
              )}
              <div style={{ height: '1px', background: '#E3DACA', margin: '10px 0' }}></div>
              <div className="kv" style={{ fontWeight: '800', fontSize: '20px' }}><span>Total</span><span>{inr(amount)}</span></div>
              {!ext && <Link href={`/book/${b.id}`} style={{ fontSize: '13px', fontWeight: 700, marginTop: '8px' }}>← Change pickup / delivery</Link>}
              {!ext && b.holdExpiresAt && <span className="mute" style={{ fontSize: '12.5px' }}>Dates held until {fmtTime(b.holdExpiresAt)}.</span>}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
