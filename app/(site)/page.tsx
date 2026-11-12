import Link from 'next/link';
import { redirect } from 'next/navigation';
import PageCss from '@/components/PageCss';
import ItemCard from '@/components/ItemCard';
import EmptyState from '@/components/EmptyState';
import HeroCarousel, { type Banner } from '@/components/home/HeroCarousel';
import Reveal from '@/components/home/Reveal';
import CountUp from '@/components/home/CountUp';
import SplitWords from '@/components/home/SplitWords';
import EarningsCalc from '@/components/home/EarningsCalc';
import { CameraArt, EarnArt, FestiveArt, ToolsArt } from '@/components/home/BannerArt';
import { ownerHref } from '@/components/SiteHeader';
import { getUser } from '@/lib/auth';
import { getLocation } from '@/lib/location';
import { prisma } from '@/lib/db';
import { homeData } from '@/lib/home';
import { addDays, inr, todayIST } from '@/lib/format';

const ic = (d: string) => <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />;

const STEPS = [
  ['Find it & chat', 'Pick your dates and send a booking request in chat. The owner accepts or suggests other dates.', '<circle cx="11" cy="11" r="6.5"></circle><path d="m20 20-4.3-4.3"></path>'],
  ['Verify once, pay safely', 'One-time ID check, then pay rent plus a refundable deposit — online, or cash at pickup where the owner allows it.', '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"></path><path d="m9 12 2 2 4-4"></path>'],
  ['Pick up, use, return', 'Share your 4-digit code at pickup and at return. Both of you photograph the item; then your deposit comes back.', '<rect x="5" y="10.5" width="14" height="10" rx="2.5"></rect><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path>'],
];

// Real occasions mapped to real categories; prices come from live listings.
const OCCASIONS = [
  { key: 'trip', title: 'Weekend trip', text: 'Tent, camping chairs and a cycle for the hills.', cats: ['CAMPING', 'SPORTS'], href: '/browse?category=camping', tone: 'forest' },
  { key: 'party', title: 'House party', text: 'A big speaker, fairy lights and a karaoke set.', cats: ['PARTY', 'MUSIC'], href: '/browse?category=party', tone: 'clay' },
  { key: 'fix', title: 'Home repair day', text: 'Drill, ladder and a pressure washer — back by evening.', cats: ['TOOLS'], href: '/browse?category=tools', tone: 'cream' },
  { key: 'movie', title: 'Movie & game night', text: 'Projector, screen and a console with two controllers.', cats: ['PROJECTORS', 'GAMING'], href: '/browse?category=projectors', tone: 'gold' },
] as const;

// Answers follow the real rules in lib/bookings.ts and /deposit-policy.
const FAQ = [
  ['Do I pay before the owner agrees?', 'No. You send your dates in chat, the owner accepts (or suggests other dates and you accept). Only when the deal is agreed by both — “Deal pakki ✓✓” — does the Pay button open. The dates are then held for you for 12 hours.'],
  ['When do I get my deposit back?', 'After you return the item with your return code, the owner has 48 hours to confirm “All OK” or raise a claim. Then the deposit goes back to your original payment method. If the owner does nothing for 48 hours, it is refunded in full automatically.'],
  ['What if something gets damaged?', 'The owner can claim from the deposit (never more than the deposit), with photos. You can accept or dispute within 48 hours; a dispute goes to the Kirayo team, who compare both sides’ pickup and return photos and decide.'],
  ['Can I cancel?', 'Yes. Cancel 24 hours or more before pickup and everything is refunded. Later than that, one day’s rent goes to the owner and the rest is refunded. If the owner cancels, you get a full refund.'],
  ['Why do I need to verify my ID?', 'Every owner, and every renter before their first payment, uploads a government ID and a selfie once. A person on the Kirayo team checks it, usually within a few hours. It keeps both sides accountable.'],
  ['How does the pickup code work?', 'Your booking page shows a 4-digit pickup code. The owner enters it only after handing the item over, with condition photos. Return works the same way with a second code — that stops the rental clock.'],
];

const TRUST = [
  ['ID-verified people', 'Every owner and every renter who pays has a government ID + selfie checked by the Kirayo team.', '<rect x="3" y="5" width="18" height="14" rx="3"></rect><circle cx="9" cy="11" r="2.2"></circle><path d="M5.8 16.5a3.4 3.4 0 0 1 6.4 0M14.5 10h4M14.5 13.5h3"></path>'],
  ['Deposit held securely', 'Your deposit is refunded after the return. Any claim must be backed by photos — and you can dispute it.', '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"></path><path d="M9.5 12h5M12 9.5v5"></path>'],
  ['OTP handover', 'The item changes hands only when the renter’s 4-digit code is entered, with condition photos on both ends.', '<rect x="4" y="9" width="16" height="11" rx="3"></rect><path d="M8 9V7a4 4 0 0 1 8 0v2"></path><path d="M9 14.5h.01M12 14.5h.01M15 14.5h.01"></path>'],
];

export default async function HomePage() {
  const user = await getUser();
  const loc = await getLocation(user);
  // Location is asked once, on the first visit.
  if (!loc) redirect('/location?next=/');
  const [home, areas] = await Promise.all([
    homeData(loc.city, loc.area, user?.id ?? null),
    prisma.area.findMany({ where: { city: { name: loc.city } }, orderBy: { sortOrder: 'asc' } }),
  ]);
  const { rails, categories, stats, testimonials } = home;
  // "This weekend" = next Saturday → Sunday.
  const today = todayIST();
  const dow = new Date(today + 'T00:00:00Z').getUTCDay();
  const sat = addDays(today, (6 - dow + 7) % 7);
  const sun = addDays(sat, 1);
  const lend = ownerHref(user, '/owner');

  const banners: Banner[] = [
    { key: 'camera', theme: 'forest', eyebrow: `This weekend in ${loc.city}`, title: 'Rent a camera for the weekend', accent: 'the weekend', text: `Mirrorless kits, lenses and action cams from verified owners around ${loc.area}. Pick Saturday, return Sunday.`, cta: { href: `/browse?category=cameras&start=${sat}&end=${sun}`, label: 'Find a camera' }, alt: { href: '/how-it-works', label: 'How renting works' }, art: <CameraArt /> },
    { key: 'tools', theme: 'cream', eyebrow: 'Fix it yourself', title: 'Tools when you need them, not forever', accent: 'not forever', text: 'Drills, ladders and pressure washers by the day — for a fraction of buying one that sits in a cupboard.', cta: { href: '/browse?category=tools', label: 'Browse tools' }, art: <ToolsArt /> },
    { key: 'earn', theme: 'clay', eyebrow: 'For owners', title: 'Earn from things you don’t use', accent: 'Earn', text: 'Apply as an owner, list in minutes, set your own price and deposit. Every renter is ID-checked before they pay.', cta: { href: lend, label: user && lend === '/owner' ? 'Owner dashboard' : 'Become an owner' }, alt: { href: '/deposit-policy', label: 'Deposit policy' }, art: <EarnArt /> },
    { key: 'festive', theme: 'festive', eyebrow: 'Festive season', title: 'Light up the celebrations', accent: 'celebrations', text: 'Party speakers, fairy lights, projectors and karaoke sets from neighbours — for Diwali nights and wedding sangeets.', cta: { href: '/browse?category=party', label: 'Shop party gear' }, alt: { href: '/browse?category=projectors', label: 'Projectors' }, art: <FestiveArt /> },
  ];

  return (
    <div className="kh">
      <PageCss id="R01-Home" />
      <h1 className="k-sr">Kirayo — rent from verified neighbours in {loc.area}, {loc.city}</h1>
      <div className="wrap kh-top"><HeroCarousel banners={banners} /></div>

      <div className="kh-marquee" aria-hidden="true">
        <div className="kh-marquee-track">
          {[0, 1].map((k) => (
            <span key={k}>
              {['ID-verified owners', 'Refundable deposit', 'OTP handover', 'Pay only after “Deal pakki”', ...categories.filter((c) => c.count).map((c) => `${c.label}${c.minPrice ? ` from ${inr(c.minPrice)}/day` : ''}`)].map((t) => <i key={t}>{t}</i>)}
            </span>
          ))}
        </div>
      </div>

      <section className="kh-sec" aria-labelledby="kh-how">
        <div className="wrap">
          <div className="kh-head">
            <div><span className="kh-kicker">How it works</span><SplitWords id="kh-how" className="kh-h2" text="Three steps. No surprises." /></div>
            <Link className="kh-link" href="/how-it-works">Full walkthrough →</Link>
          </div>
          <Reveal as="ol" className="kh-steps">
            {STEPS.map(([h, t, icon], i) => (
              <li key={h}>
                <span className="kh-step-n">0{i + 1}</span>
                <span className="kh-step-ic">{ic(icon)}</span>
                <b>{h}</b>
                <p>{t}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="kh-sec" aria-labelledby="kh-occ">
        <div className="wrap">
          <div className="kh-head">
            <div><span className="kh-kicker">Rent for every occasion</span><SplitWords id="kh-occ" className="kh-h2" text="Plans this week? We’ve got the gear." /></div>
          </div>
          <Reveal as="ul" className="kh-occ">
            {OCCASIONS.map((o) => {
              const cats = categories.filter((c) => (o.cats as readonly string[]).includes(c.key));
              const from = Math.min(...cats.map((c) => c.minPrice ?? Infinity));
              const count = cats.reduce((n, c) => n + c.count, 0);
              return (
                <li key={o.key}>
                  <Link href={o.href} className={`kh-occ-c ${o.tone} k-spot`} data-tilt>
                    <span className="kh-occ-ics" aria-hidden="true">{cats.map((c) => <span key={c.key}>{ic(c.icon)}</span>)}</span>
                    <b>{o.title}</b>
                    <p>{o.text}</p>
                    <span className="kh-occ-f"><span>{Number.isFinite(from) ? <>from <strong>{inr(from)}</strong>/day · {count} items</> : 'Coming soon here'}</span><span aria-hidden="true">→</span></span>
                  </Link>
                </li>
              );
            })}
          </Reveal>
        </div>
      </section>

      <section className="kh-sec" aria-labelledby="kh-cats">
        <div className="wrap">
          <div className="kh-head">
            <div><span className="kh-kicker">Popular categories</span><SplitWords id="kh-cats" className="kh-h2" text="What do you need?" /></div>
          </div>
          <Reveal as="ul" className="kh-cats">
            {categories.map((c, i) => (
              <li key={c.key}>
                <Link href={`/browse?category=${c.slug}`} className={`kh-cat t${i % 4} k-spot`} data-tilt>
                  <span className="kh-cat-ic">{ic(c.icon)}</span>
                  <b>{c.label}</b>
                  <small>{c.count ? `${c.count} in ${loc.city}${c.minPrice ? ` · from ${inr(c.minPrice)}` : ''}` : 'Be the first to list'}</small>
                </Link>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="kh-sec" aria-labelledby="kh-near">
        <div className="wrap">
          <div className="kh-head">
            <div><span className="kh-kicker">Near you</span><SplitWords id="kh-near" className="kh-h2" text={`Available around ${loc.area}`} /></div>
            <div className="kh-chips">
              <Link className="chip" href={`/browse?start=${sat}&end=${sun}`}>This weekend</Link>
              <Link className="chip" href="/browse?max=500">Under ₹500/day</Link>
              <Link className="chip" href="/browse?sort=newest">Newest</Link>
            </div>
          </div>
          {rails.near.length ? (
            <>
              <Reveal className="kh-rail" aria-label={`Items near ${loc.area}`}>
                {rails.near.map((c) => <div key={c.href} className="kh-rail-i"><ItemCard {...c} /></div>)}
                <Link href="/browse" className="kh-rail-more"><b>See all {rails.nearTotal}</b><span>items in and around {loc.area} →</span></Link>
              </Reveal>
            </>
          ) : (
            <EmptyState title={`Nothing listed in ${loc.city} yet`} text="Be the first — list something you own." action={{ href: ownerHref(user), label: 'List an item', tone: 'g' }} />
          )}
        </div>
      </section>

      {home.trending.length > 2 && (
        <section className="kh-sec" aria-labelledby="kh-trend">
          <div className="wrap">
            <div className="kh-head">
              <div><span className="kh-kicker">Trending in {loc.city}</span><SplitWords id="kh-trend" className="kh-h2" text="What everyone’s looking at" /></div>
              <Link className="kh-link" href="/browse?sort=newest">Browse all →</Link>
            </div>
            <Reveal className="kh-rail" aria-label={`Most viewed in ${loc.city}`}>
              {home.trending.map((c, i) => <div key={c.href} className="kh-rail-i kh-rank" data-rank={i + 1}><ItemCard {...c} /></div>)}
            </Reveal>
          </div>
        </section>
      )}

      <section className="kh-trust" aria-labelledby="kh-trust">
        <div className="wrap">
          <div className="kh-head">
            <div><span className="kh-kicker">Why it feels safe</span><SplitWords id="kh-trust" className="kh-h2" text="Built for renting from strangers who become neighbours" /></div>
          </div>
          <Reveal className="kh-trust-grid">
            {TRUST.map(([h, t, icon]) => (
              <div key={h} className="kh-trust-c"><span className="kh-trust-ic">{ic(icon)}</span><b>{h}</b><p>{t}</p></div>
            ))}
          </Reveal>
          <Reveal as="ul" className="kh-stats" aria-label="Kirayo in numbers">
            <li><b><CountUp value={stats.liveItems} /></b><span>items ready to rent</span></li>
            <li><b><CountUp value={stats.liveOwners} /></b><span>verified owners</span></li>
            <li><b><CountUp value={stats.cities} /></b><span>cities</span></li>
            <li><b><CountUp value={stats.rentals} /></b><span>rentals completed</span></li>
          </Reveal>
        </div>
      </section>

      <section className="kh-sec" aria-labelledby="kh-owner">
        <div className="wrap">
          <div className="kh-band">
            <div className="kh-band-copy">
              <span className="kh-kicker">For owners</span>
              <h2 id="kh-owner" className="kh-h2">That drill in your cupboard could pay for itself.</h2>
              <p>Apply once, verify your ID, and list as many things as you like. You set the daily rate, the deposit and the days it’s free — we check every renter before they pay.</p>
              <Link className="kh-btn ghost" href="/deposit-policy" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>How deposits work</Link>
            </div>
            <EarningsCalc categories={categories.map((c) => ({ key: c.key, label: c.label, avgPrice: c.avgPrice }))} city={loc.city} feePercent={home.platformFeePercent} href={lend} cta={user && lend === '/owner' ? 'Owner dashboard' : 'Become an owner'} />
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="kh-sec" aria-labelledby="kh-said">
          <div className="wrap">
            <div className="kh-head">
              <div><span className="kh-kicker">From real reviews</span><SplitWords id="kh-said" className="kh-h2" text="What renters say" /></div>
            </div>
            <Reveal as="ul" className="kh-quotes">
              {testimonials.map((t) => (
                <li key={t.id}>
                  <figure>
                    <span className="kh-stars" aria-label={`${t.rating} out of 5 stars`}>{'★'.repeat(t.rating)}<span aria-hidden="true" style={{ opacity: 0.25 }}>{'★'.repeat(5 - t.rating)}</span></span>
                    <blockquote>“{t.text}”</blockquote>
                    <figcaption><b>{t.name}</b>{t.place ? ` · ${t.place}` : ''}<br /><span>Rented: {t.item}</span></figcaption>
                  </figure>
                </li>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      <section className="kh-sec" aria-labelledby="kh-areas">
        <div className="wrap">
          <div className="kh-head">
            <div><span className="kh-kicker">Around {loc.city}</span><SplitWords id="kh-areas" className="kh-h2" text="Popular areas" /></div>
            <Link className="kh-link" href="/location?next=/">Change city →</Link>
          </div>
          <Reveal as="ul" className="kh-areas">
            {areas.map((a) => {
              const n = home.areaCounts.get(a.name) ?? 0;
              const here = a.name === loc.area;
              return (
                <li key={a.id}>
                  <Link href={`/browse?area=${encodeURIComponent(a.name)}`} className={`kh-area k-spot${here ? ' here' : ''}`} data-tilt>
                    <b>{a.name}</b>
                    <small>{n ? `${n} item${n > 1 ? 's' : ''}` : 'No items yet'}{here ? ' · you’re here' : ''}</small>
                  </Link>
                </li>
              );
            })}
          </Reveal>
        </div>
      </section>

      <section className="kh-sec kh-last" aria-labelledby="kh-faq">
        <div className="wrap kh-faq-wrap">
          <div className="kh-head" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div><span className="kh-kicker">Questions</span><SplitWords id="kh-faq" className="kh-h2" text="Good to know before you rent" /></div>
            <Link className="kh-link" href="/deposit-policy">Full rental &amp; deposit policy →</Link>
          </div>
          <Reveal className="kh-faq">
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}<span aria-hidden="true" /></summary>
                <p>{a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
