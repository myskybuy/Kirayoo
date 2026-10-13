import { redirect } from 'next/navigation';
import PageCss from '@/components/PageCss';
import ReviewForm from '@/components/ReviewForm';
import { requireUser } from '@/lib/auth';
import { loadBooking } from '@/lib/booking-view';
import { avatarColor, fmtRange, initials } from '@/lib/format';
import { OWNER_REVIEW_TAGS } from '@/lib/constants';

export const metadata = { title: 'Rate the renter' };

export default async function OwnerReviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/owner/bookings/${id}/review`);
  const b = await loadBooking(id, user, 'OWNER');
  if (b.reviews.some((r) => r.fromUserId === user.id)) redirect(`/owner/reviews?ok=${encodeURIComponent('You already rated this renter — thanks!')}`);
  if (b.status !== 'RETURN_CONFIRMED' && b.status !== 'DEPOSIT_REFUNDED') redirect(`/owner/bookings/${b.id}`);
  const r = b.renter.name.split(' ')[0];
  return (
    <>
      <PageCss id="O09-Reviews" />
      <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,42px)', fontWeight: '700' }}>Rate {r}</h1>
      {sp.error && <p className="k-alert err">{sp.error}</p>}
      <section className="card" style={{ maxWidth: '640px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'inset 0 0 0 2px #C9491F' }}>
        <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: '#C9491F' }}>Waiting for your rating</span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span style={{ width: '48px', height: '48px', borderRadius: '50%', background: avatarColor(b.renter.id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{initials(b.renter.name)}</span><span><b style={{ fontSize: '16px' }}>{b.renter.name}</b><br /><span className="mute" style={{ fontSize: '13px' }}>{b.item.title} · {fmtRange(b.startDate, b.endDate)}</span></span></div>
        <ReviewForm compact bookingId={b.id} legend={`How was ${r} as a renter?`} tags={OWNER_REVIEW_TAGS} textLabel="A line for other owners" back="/owner/reviews" />
      </section>
    </>
  );
}
