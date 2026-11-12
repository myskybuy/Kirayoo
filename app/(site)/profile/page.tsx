import Link from 'next/link';
import PageCss from '@/components/PageCss';
import ProfileForm from '@/components/ProfileForm';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { avatarColor, fmtTime, initials, monthYear, shortName } from '@/lib/format';
import { logoutAction } from '@/app/actions/auth';
import { ownerHref } from '@/components/SiteHeader';

export const metadata = { title: 'Profile' };

const ID_CARD = {
  NONE: { bg: 'var(--kb-fbebcf)', fg: 'var(--kf-7a4708)', title: 'Identity: Not verified', link: 'Verify now' },
  PENDING: { bg: 'var(--kb-fbebcf)', fg: 'var(--kf-7a4708)', title: 'Identity: Under review', link: 'View status' },
  VERIFIED: { bg: 'var(--kb-dceedf)', fg: 'var(--kf-1e5a37)', title: 'Identity: Verified', link: 'View status' },
  REJECTED: { bg: 'var(--kb-f7dcd7)', fg: 'var(--kf-8e2a20)', title: 'Identity: Needs another try', link: 'Resubmit' },
} as const;

export default async function ProfilePage() {
  const user = await requireUser('/profile');
  const [reviews, agg, rentals] = await Promise.all([
    prisma.review.findMany({
      where: { toUserId: user.id, booking: { renterId: user.id } },
      include: { fromUser: { select: { name: true } }, booking: { select: { item: { select: { title: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.review.aggregate({ where: { toUserId: user.id, booking: { renterId: user.id } }, _avg: { rating: true }, _count: true }),
    prisma.booking.count({ where: { renterId: user.id, status: { in: ['RETURN_CONFIRMED', 'DEPOSIT_REFUNDED'] } } }),
  ]);
  const id = ID_CARD[user.idStatus];
  const idText =
    user.idStatus === 'VERIFIED'
      ? `${user.idDocType ?? 'ID'} + selfie · approved ${user.idReviewedAt ? fmtTime(user.idReviewedAt) : ''}. Your document is visible only to the Kirayo admin.`
      : user.idStatus === 'PENDING'
        ? `Submitted ${user.idSubmittedAt ? fmtTime(user.idSubmittedAt) : ''}. Usually approved within a few hours.`
        : user.idStatus === 'REJECTED'
          ? `Reason: ${user.idRejectReason ?? 'not given'}. You can upload again.`
          : 'Verify once with a government ID and a selfie before your first payment or listing.';

  return (
    <>
      <PageCss id="R20-Profile" />
      <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '72px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
        <aside style={{ flex: '1 1 300px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
            <span style={{ position: 'relative' }}>
              <span style={{ width: '96px', height: '96px', borderRadius: '50%', background: avatarColor(user.id), color: 'var(--kf-ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "800 32px 'Bricolage Grotesque',serif" }}>{initials(user.name)}</span>
              {user.idStatus === 'VERIFIED' && (
                <span style={{ position: 'absolute', right: '0', bottom: '0', width: '30px', height: '30px', borderRadius: '50%', background: 'var(--kb-1f4d3a)', boxShadow: '0 0 0 4px var(--kl-fffdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg></span>
              )}
            </span>
            <h1 className="d" style={{ fontSize: '28px', fontWeight: '700' }}>{user.name}</h1>
            <span className="mute" style={{ fontSize: '14px' }}>{user.area ? `${user.area}, ${user.city}` : 'No area chosen'} · Member since {monthYear(user.createdAt)}</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ padding: '4px 10px', borderRadius: '999px', background: id.bg, color: id.fg, fontSize: '12px', fontWeight: '700' }}>{user.idStatus === 'VERIFIED' ? 'ID verified' : user.idStatus === 'PENDING' ? 'ID under review' : 'ID not verified'}</span>
              <span style={{ padding: '4px 10px', borderRadius: '999px', background: 'var(--kb-ede5d5)', color: 'var(--kf-474c52)', fontSize: '12px', fontWeight: '700' }}>{agg._count ? `${(agg._avg.rating ?? 0).toFixed(1)} as renter · ` : ''}{rentals} rental{rentals === 1 ? '' : 's'}</span>
            </div>
          </div>
          <Link href={ownerHref(user, '/owner')} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '20px', borderRadius: '24px', background: 'var(--kb-1f4d3a)', color: 'var(--kf-f6f1e7)', textDecoration: 'none' }}>
            <svg className="ic" viewBox="0 0 24 24" style={{ width: '28px', height: '28px', color: 'var(--kf-e8643c)' }}><rect x="4" y="4" width="7" height="7" rx="2"></rect><rect x="13" y="4" width="7" height="7" rx="2"></rect><rect x="4" y="13" width="7" height="7" rx="2"></rect><path d="M16.5 13.5v6M13.5 16.5h6"></path></svg>
            <span style={{ flex: '1' }}><b>Lend your own things</b><br /><span style={{ fontSize: '13px', color: 'var(--kf-dce6da)' }}>Same account. Open the owner panel.</span></span>
            <svg className="ic" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"></path></svg>
          </Link>
          <nav aria-label="Account" style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px', borderRadius: '24px', background: 'var(--kb-fffdf8)' }}>
            {[['/bookings', 'My rentals'], ['/chat', 'Inbox'], ['/location?next=/profile', 'Change city / area'], ['/contact', 'Help & contact']].map(([h, t]) => (
              <Link key={h} href={h} style={{ display: 'flex', alignItems: 'center', minHeight: '46px', padding: '0 14px', borderRadius: '14px', textDecoration: 'none', color: 'var(--kf-23262a)', fontWeight: '600' }}>{t}</Link>
            ))}
            {user.isAdmin && <Link href="/admin" style={{ display: 'flex', alignItems: 'center', minHeight: '46px', padding: '0 14px', borderRadius: '14px', textDecoration: 'none', color: 'var(--kf-23262a)', fontWeight: '600' }}>Admin panel</Link>}
            <form action={logoutAction}>
              <button type="submit" style={{ display: 'flex', alignItems: 'center', width: '100%', minHeight: '46px', padding: '0 14px', borderRadius: '14px', font: 'inherit', border: 0, background: 'none', cursor: 'pointer', color: 'var(--kf-8e2a20)', fontWeight: '700' }}>Log out</button>
            </form>
          </nav>
        </aside>
        <div style={{ flex: '999 1 520px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <ProfileForm name={user.name} email={user.email} phone={user.phone ?? ''} address={user.address ?? ''} location={user.area ? `${user.area}, ${user.city}` : '—'} />
          <section className="card" style={{ padding: '26px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <span style={{ width: '56px', height: '56px', borderRadius: '18px', background: id.bg, color: id.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '28px', height: '28px' }}><rect x="3" y="5" width="18" height="14" rx="3"></rect><circle cx="9" cy="11" r="2.2"></circle><path d="M5.8 16.5a3.4 3.4 0 0 1 6.4 0M14.5 10h4M14.5 13.5h3"></path></svg></span>
            <div style={{ flex: '1 1 260px' }}><b style={{ fontSize: '17px' }}>{id.title}</b><p className="mute" style={{ fontSize: '13.5px' }}>{idText}</p></div>
            <Link href="/verify-id" style={{ fontWeight: '700', fontSize: '14px' }}>{id.link}</Link>
          </section>
          <section className="card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 className="d" style={{ fontSize: '22px', fontWeight: '700' }}>What owners say about you</h2>
            {reviews.length === 0 && <p className="mute" style={{ fontSize: '14px' }}>No reviews yet. Owners rate you after each rental.</p>}
            {reviews.map((r) => (
              <div key={r.id} style={{ padding: '14px 16px', borderRadius: '18px', background: 'var(--kb-f6f1e7)' }}>
                <b style={{ fontSize: '14px' }}>{shortName(r.fromUser.name)} · {r.booking.item.title}</b> <span style={{ color: 'var(--kf-c9491f)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                {r.text && <p style={{ fontSize: '14px', color: 'var(--kf-474c52)' }}>{r.text}</p>}
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
