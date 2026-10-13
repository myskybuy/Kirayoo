import Link from 'next/link';
import PageCss from '@/components/PageCss';
import ReviewForm from '@/components/ReviewForm';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { avatarColor, fmtRange, initials, monthYear, shortName } from '@/lib/format';
import { OWNER_REVIEW_TAGS, RENTER_REVIEW_TAGS } from '@/lib/constants';

export const metadata = { title: 'Reviews' };

export default async function OwnerReviewsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser('/owner/reviews');
  const [received, toRate] = await Promise.all([
    prisma.review.findMany({ where: { toUserId: user.id, booking: { ownerId: user.id } }, include: { fromUser: { select: { name: true } }, booking: { select: { item: { select: { title: true } } } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.booking.findMany({ where: { ownerId: user.id, status: { in: ['RETURN_CONFIRMED', 'DEPOSIT_REFUNDED'] }, reviews: { none: { fromUserId: user.id } } }, include: { renter: true, item: { select: { title: true } } }, orderBy: { returnConfirmedAt: 'desc' } }),
  ]);
  const avg = received.length ? received.reduce((a, r) => a + r.rating, 0) / received.length : 0;
  const tagShare = RENTER_REVIEW_TAGS.map((t) => ({ t, n: received.filter((r) => r.tags.includes(t)).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 4);
  const first = toRate[0];
  return (
    <>
      <PageCss id="O09-Reviews" />
      <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,42px)', fontWeight: '700' }}>Reviews</h1>
      {sp.ok && <p className="k-alert ok">{sp.ok}</p>}
      {sp.error && <p className="k-alert err">{sp.error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
        <section className="card" style={{ flex: '1 1 380px', minWidth: '0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: first ? 'inset 0 0 0 2px #C9491F' : undefined }}>
          {first ? (
            <>
              <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: '#C9491F' }}>Waiting for your rating{toRate.length > 1 ? ` · ${toRate.length} renters` : ''}</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span style={{ width: '48px', height: '48px', borderRadius: '50%', background: avatarColor(first.renter.id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{initials(first.renter.name)}</span><span><b style={{ fontSize: '16px' }}>{first.renter.name}</b><br /><span className="mute" style={{ fontSize: '13px' }}>{first.item.title} · {fmtRange(first.startDate, first.endDate)}</span></span></div>
              <ReviewForm compact bookingId={first.id} legend={`How was ${first.renter.name.split(' ')[0]} as a renter?`} tags={OWNER_REVIEW_TAGS} textLabel="A line for other owners" back="/owner/reviews" />
              {toRate.slice(1).map((b) => <Link key={b.id} href={`/owner/bookings/${b.id}/review`} style={{ fontSize: '14px', fontWeight: 700 }}>Rate {shortName(b.renter.name)} · {b.item.title}</Link>)}
            </>
          ) : (
            <><b className="d" style={{ fontSize: '20px' }}>All renters rated</b><p className="mute">After each completed rental you can rate the renter here.</p></>
          )}
        </section>
        <section style={{ flex: '1.2 1 420px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card" style={{ padding: '22px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
            <div><b className="d" style={{ fontSize: '52px', lineHeight: '1', color: '#1F4D3A' }}>{received.length ? avg.toFixed(1) : '—'}</b><p className="mute" style={{ fontSize: '13px' }}>{received.length} review{received.length === 1 ? '' : 's'} as owner</p></div>
            <div style={{ flex: '1 1 220px', display: 'grid', gap: '6px', fontSize: '13px' }}>
              {tagShare.length === 0 && <span className="mute">Tags renters pick show up here.</span>}
              {tagShare.map(({ t, n }) => (
                <div key={t} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><span style={{ width: '120px' }}>{t}</span><span style={{ flex: '1', height: '8px', borderRadius: '4px', background: '#EDE5D5' }}><span style={{ display: 'block', width: `${Math.round((n / received.length) * 100)}%`, height: '100%', borderRadius: '4px', background: '#1F4D3A' }}></span></span><span className="mute">{n}</span></div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 className="d" style={{ fontSize: '20px', fontWeight: '700' }}>What renters said</h2>
            {received.length === 0 && <p className="mute">No reviews yet.</p>}
            {received.map((r) => (
              <div key={r.id} className="rv">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}><b style={{ fontSize: '14px' }}>{shortName(r.fromUser.name)} · {r.booking.item.title}</b><span style={{ color: '#C9491F' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span></div>
                {r.text && <p style={{ fontSize: '14px', color: '#474C52' }}>{r.text}</p>}
                <span className="mute" style={{ fontSize: '12.5px' }}>{monthYear(r.createdAt)}{r.tags.length ? ` · ${r.tags.join(' · ')}` : ''}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
