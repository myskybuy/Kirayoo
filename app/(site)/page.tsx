import Link from 'next/link';
import { redirect } from 'next/navigation';
import PageCss from '@/components/PageCss';
import HomeHero from '@/components/HomeHero';
import ItemCard from '@/components/ItemCard';
import EmptyState from '@/components/EmptyState';
import { ownerHref } from '@/components/SiteHeader';
import { getUser } from '@/lib/auth';
import { getLocation } from '@/lib/location';
import { prisma } from '@/lib/db';
import { homeRails } from '@/lib/search';
import { CATEGORIES } from '@/lib/constants';
import { addDays, todayIST } from '@/lib/format';

export default async function HomePage() {
  const user = await getUser();
  const loc = await getLocation(user);
  // Location is asked once, on the first visit.
  if (!loc) redirect('/location?next=/');
  const [rails, areas] = await Promise.all([
    homeRails(loc.city, loc.area, user?.id ?? null),
    prisma.area.findMany({ where: { city: { name: loc.city } }, orderBy: { sortOrder: 'asc' } }),
  ]);
  // "This weekend" = next Saturday → Sunday.
  const today = todayIST();
  const dow = new Date(today + 'T00:00:00Z').getUTCDay();
  const sat = addDays(today, (6 - dow + 7) % 7);
  const sun = addDays(sat, 1);

  return (
    <>
      <PageCss id="R01-Home" />
      <HomeHero area={loc.area} />

      <section style={{ padding: '24px 0 48px' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 className="d" style={{ fontSize: '30px', fontWeight: '700' }}>What do you need?</h2>
          <nav aria-label="Categories" style={{ display: 'grid', gap: '20px 12px', gridTemplateColumns: 'repeat(auto-fill,minmax(108px,1fr))' }}>
            {CATEGORIES.map((c) => (
              <Link key={c.key} className="cat" href={`/browse?category=${c.slug}`}>
                <span className="o"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: c.icon }} /></span>
                {c.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section style={{ padding: '24px 0 56px' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span className="eyebrow">Near you</span>
              <h2 className="d" style={{ fontSize: '34px', fontWeight: '700' }}>Available around {loc.area}</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <Link className="chip" href={`/browse?start=${sat}&end=${sun}`}>This weekend</Link>
              <Link className="chip" href="/browse?max=500">Under ₹500/day</Link>
              <Link className="chip" href="/browse?deposit=2000">Deposit under ₹2,000</Link>
              <Link className="chip" href="/browse" style={{ color: '#1F4D3A' }}>See all {rails.nearTotal} →</Link>
            </div>
          </div>
          {rails.near.length ? (
            <div style={{ display: 'grid', gap: '40px 24px', gridTemplateColumns: 'repeat(auto-fill,minmax(min(260px,100%),1fr))' }}>
              {rails.near.map((c) => <ItemCard key={c.href} {...c} />)}
            </div>
          ) : (
            <EmptyState title={`Nothing listed in ${loc.city} yet`} text="Be the first — list something you own." action={{ href: ownerHref(user), label: 'List an item', tone: 'g' }} />
          )}
        </div>
      </section>

      {rails.recent.length > 0 && (
        <section style={{ padding: '0 0 56px' }}>
          <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span className="eyebrow">Recently added</span>
              <h2 className="d" style={{ fontSize: '34px', fontWeight: '700' }}>New in {loc.city}</h2>
            </div>
            <div style={{ display: 'grid', gap: '40px 24px', gridTemplateColumns: 'repeat(auto-fill,minmax(min(260px,100%),1fr))' }}>
              {rails.recent.map((c) => <ItemCard key={c.href} {...c} />)}
            </div>
            <Link className="btn btn-o" href="/browse?sort=newest" style={{ alignSelf: 'center' }}>See everything new</Link>
          </div>
        </section>
      )}

      <section style={{ padding: '56px 0', background: '#FFFDF8' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-end' }}>
            <h2 className="d" style={{ fontSize: '40px', fontWeight: '700', lineHeight: '1.05', maxWidth: '560px' }}>Borrow in four easy moves</h2>
            <Link className="btn btn-o" href="/how-it-works">Full walkthrough</Link>
          </div>
          <ol style={{ listStyle: 'none', margin: '0', padding: '0', display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))' }}>
            {[
              ['01', 'Find & chat', 'Pick dates on the calendar and send a booking request inside chat. The owner accepts or suggests new dates.'],
              ['02', 'Verify once, then pay', 'Upload a government ID and selfie one time. Pay rent plus a refundable deposit.'],
              ['03', 'Collect with an OTP', "Share your 4-digit code at pickup and both of you photograph the item's condition."],
            ].map(([n, h, t]) => (
              <li key={n} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px', borderRadius: '24px', background: '#EEF3EC' }}>
                <span className="d" style={{ fontSize: '44px', fontWeight: '800', color: '#1F4D3A', lineHeight: '1' }}>{n}</span>
                <b style={{ fontSize: '17px' }}>{h}</b>
                <p className="mute" style={{ fontSize: '14px' }}>{t}</p>
              </li>
            ))}
            <li style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px', borderRadius: '24px', background: '#1F4D3A', color: '#F6F1E7' }}>
              <span className="d" style={{ fontSize: '44px', fontWeight: '800', color: '#E8643C', lineHeight: '1' }}>04</span>
              <b style={{ fontSize: '17px' }}>Return, get your deposit</b>
              <p style={{ fontSize: '14px', color: '#DCE6DA' }}>Hand it back with a return OTP. Once the owner confirms, your deposit is refunded.</p>
            </li>
          </ol>
        </div>
      </section>

      <section style={{ padding: '56px 0' }}>
        <div className="wrap">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '32px', padding: 'clamp(24px,4vw,44px)', borderRadius: '32px', background: '#C9491F', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden="true" style={{ position: 'absolute', right: '-60px', bottom: '-140px', width: '360px', height: '360px', borderRadius: '50%', border: '56px solid rgba(255,255,255,.1)' }}></div>
            <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              <h2 className="d" style={{ fontSize: 'clamp(32px,3.6vw,46px)', fontWeight: '700', lineHeight: '1.02' }}>That drill in your cupboard could pay for itself.</h2>
              <p style={{ fontSize: '16px', maxWidth: '520px', color: '#FFE9DF' }}>List it in a few minutes. You set the daily rate, deposit and which days it&apos;s free. Kirayo checks every renter&apos;s ID before they pay.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', position: 'relative' }}>
              <Link className="btn" href={ownerHref(user)} style={{ background: '#FFFDF8', color: '#A93C18' }}>List an item</Link>
              <Link className="btn" href={ownerHref(user, '/owner')} style={{ color: '#fff', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.7)' }}>Owner dashboard</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 56px' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 className="d" style={{ fontSize: '24px', fontWeight: '700' }}>Popular areas in {loc.city}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {areas.map((a) => <Link key={a.id} className="chip" href={`/browse?area=${encodeURIComponent(a.name)}`}>{a.name}</Link>)}
            <Link className="chip" href="/location?next=/" style={{ color: '#1F4D3A' }}>Change city</Link>
          </div>
        </div>
      </section>
    </>
  );
}
