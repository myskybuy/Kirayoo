import { redirect } from 'next/navigation';
import PageCss from '@/components/PageCss';
import ReviewForm from '@/components/ReviewForm';
import { requireUser } from '@/lib/auth';
import { loadBooking } from '@/lib/booking-view';
import { fmtRange } from '@/lib/format';
import { RENTER_REVIEW_TAGS } from '@/lib/constants';

export const metadata = { title: 'Leave a review' };

export default async function RenterReviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/bookings/${id}/review`);
  const b = await loadBooking(id, user, 'RENTER');
  if (b.reviews.some((r) => r.fromUserId === user.id)) redirect(`/bookings/${b.id}?ok=${encodeURIComponent('You already reviewed this rental — thanks!')}`);
  if (b.status !== 'RETURN_CONFIRMED' && b.status !== 'DEPOSIT_REFUNDED') redirect(`/bookings/${b.id}`);
  const o = b.owner.name.split(' ')[0];
  return (
    <>
      <PageCss id="R19-Review" />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(20px,5vw,36px) 16px 72px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '84px', height: '64px', borderRadius: '16px', background: '#BFD1BD', flex: 'none', overflow: 'hidden' }}>{b.item.photos[0] && <img src={b.item.photos[0]} alt="" className="k-photo" />}</div>
          <div><span className="mute" style={{ fontSize: '13px' }}>{b.code} · {fmtRange(b.startDate, b.endDate)}</span><h1 className="d" style={{ fontSize: 'clamp(28px,3.2vw,40px)', fontWeight: '700', lineHeight: '1.08' }}>How did it go?</h1></div>
        </div>
        {sp.error && <p className="k-alert err">{sp.error}</p>}
        <div style={{ background: '#FFFDF8', borderRadius: '28px', padding: 'clamp(20px,4vw,34px)', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 30px 60px -24px rgba(31,77,58,.3)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ReviewForm bookingId={b.id} legend={`Rate ${o} (owner) and the ${b.item.title}`} tags={RENTER_REVIEW_TAGS} textLabel={`Write a few words (shown on ${o}’s profile and the item page)`} back={`/bookings/${b.id}`} />
          <div style={{ padding: '14px 16px', borderRadius: '16px', background: '#EEF3EC', fontSize: '13.5px', color: '#474C52' }}>Reviews are public and can’t be edited. Keep them about the rental — no phone numbers or personal details.</div>
        </div>
      </div>
    </>
  );
}
