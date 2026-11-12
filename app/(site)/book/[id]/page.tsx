import Link from 'next/link';
import { redirect } from 'next/navigation';
import PageCss from '@/components/PageCss';
import CheckoutSteps from '@/components/CheckoutSteps';
import DealBanner from '@/components/DealBanner';
import CheckoutForm from '@/components/CheckoutForm';
import { requireUser } from '@/lib/auth';
import { loadBooking } from '@/lib/booking-view';
import { DELIVERY_FEE } from '@/lib/constants';
import { fmtDay, fmtTime, hoursLeft } from '@/lib/format';
import { runDueJobs } from '@/lib/jobs';

export const metadata = { title: 'Booking summary' };

export default async function BookingSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/book/${id}`);
  await runDueJobs();
  const b = await loadBooking(id, user, 'RENTER');
  if (b.status !== 'PENDING_PAYMENT') redirect(`/bookings/${b.id}`);
  const ownerFirst = b.owner.name.split(' ')[0];
  return (
    <>
      <PageCss id="R08-BookingSummary" />
      <div className="wrap" style={{ paddingTop: '28px', paddingBottom: '72px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <CheckoutSteps at={1} />
        <DealBanner bookingId={b.id} renterName={b.renter.name} ownerName={b.owner.name} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,44px)', fontWeight: '700' }}>Confirm your booking</h1>
          {b.holdExpiresAt && <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: 'var(--kf-7a4708)', background: 'var(--kb-fbebcf)', padding: '6px 12px', borderRadius: '999px' }}>Dates held until {fmtTime(b.holdExpiresAt)} ({hoursLeft(b.holdExpiresAt)} h left)</span>}
        </div>
        <div className="card" style={{ padding: '18px', display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center' }}>
          <div style={{ width: '150px', height: '112px', borderRadius: '18px', background: 'var(--kb-bfd1bd)', overflow: 'hidden', flex: 'none' }}>{b.item.photos[0] && <img src={b.item.photos[0]} alt={b.item.title} className="k-photo" />}</div>
          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <b style={{ fontSize: '18px' }}>{b.item.title}</b>
            <span className="mute" style={{ fontSize: '14px' }}>Owner {b.owner.name} · ID verified · {b.item.area}</span>
            {b.conversationId && <Link href={`/chat/${b.conversationId}`} style={{ fontSize: '14px', fontWeight: '700' }}>Agreed in chat · view conversation</Link>}
          </div>
        </div>
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="d" style={{ fontSize: '22px', fontWeight: '700' }}>Dates</h2>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
            <div style={{ padding: '14px 16px', borderRadius: '18px', background: 'var(--kb-eef3ec)' }}><span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '.06em', color: 'var(--kf-1f4d3a)' }}>PICKUP</span><p style={{ fontWeight: '800', fontSize: '17px' }}>{fmtDay(b.startDate)}</p><span className="mute" style={{ fontSize: '13px' }}>Time agreed in chat</span></div>
            <div style={{ padding: '14px 16px', borderRadius: '18px', background: 'var(--kb-eef3ec)' }}><span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '.06em', color: 'var(--kf-1f4d3a)' }}>RETURN</span><p style={{ fontWeight: '800', fontSize: '17px' }}>{fmtDay(b.endDate)}</p><span className="mute" style={{ fontSize: '13px' }}>Return day</span></div>
            <div style={{ padding: '14px 16px', borderRadius: '18px', background: 'var(--kb-1f4d3a)', color: 'var(--kf-f6f1e7)' }}><span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '.06em', color: 'var(--kf-bfd1bd)' }}>DURATION</span><p style={{ fontWeight: '800', fontSize: '17px' }}>{b.days} day{b.days > 1 ? 's' : ''}</p><span style={{ fontSize: '13px', color: 'var(--kf-dce6da)' }}>Late fee ₹{b.pricePerDay.toLocaleString('en-IN')}/day after</span></div>
          </div>
        </div>
        <CheckoutForm
          bookingId={b.id}
          canPickup={b.item.canPickup}
          canDeliver={b.item.canDeliver}
          initialMode={b.mode}
          pickupNote={b.item.pickupNote ?? ''}
          ownerFirst={ownerFirst}
          area={b.item.area}
          address={b.address ?? user.address ?? ''}
          phone={user.phone ?? ''}
          rent={b.rentAmount}
          dailyTotal={b.pricePerDay * b.days}
          days={b.days}
          pricePerDay={b.pricePerDay}
          deposit={b.deposit}
          deliveryFee={DELIVERY_FEE}
          verified={user.idStatus === 'VERIFIED'}
          idStatus={user.idStatus}
          cancelLine="Free cancellation until 24 hours before pickup. After that, one day’s rent is kept for the owner."
        />
      </div>
    </>
  );
}
