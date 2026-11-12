import Link from 'next/link';
import { redirect } from 'next/navigation';
import PageCss from '@/components/PageCss';
import ItemCard from '@/components/ItemCard';
import Pager from '@/components/Pager';
import EmptyState from '@/components/EmptyState';
import AutoSubmit from '@/components/AutoSubmit';
import { getUser } from '@/lib/auth';
import { getLocation } from '@/lib/location';
import { prisma } from '@/lib/db';
import { browse, parseFilters } from '@/lib/search';
import { CATEGORIES, PAGE_SIZE } from '@/lib/constants';
import { fmtRange, todayIST } from '@/lib/format';

export const metadata = { title: 'Browse items' };

type SP = Record<string, string | string[] | undefined>;

export default async function BrowsePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const user = await getUser();
  const loc = await getLocation(user);
  if (!loc) redirect('/location?next=/browse');
  const f = parseFilters(sp);
  const [res, areas] = await Promise.all([
    browse(loc.city, loc.area, user?.id ?? null, f),
    prisma.area.findMany({ where: { city: { name: loc.city } }, orderBy: { sortOrder: 'asc' } }),
  ]);
  const cat = CATEGORIES.find((c) => c.key === f.category);
  const today = todayIST();

  // Build links that keep the other filters.
  const params = (over: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === 'page') continue;
      for (const x of Array.isArray(v) ? v : v ? [v] : []) u.append(k, x);
    }
    for (const [k, v] of Object.entries(over)) {
      u.delete(k);
      if (v) u.set(k, v);
    }
    const s = u.toString();
    return `/browse${s ? `?${s}` : ''}`;
  };
  const noun = cat ? cat.label.toLowerCase() : 'items';
  const heading = `${res.total} ${res.total === 1 && !cat ? 'item' : noun}${f.q ? ` for “${f.q}”` : ''}${f.start ? ` free ${fmtRange(f.start, f.end!)}` : ''}`;
  const selAreas = new Set(f.areas);
  // Neighbouring areas (by seeded order) first, like the design.
  const myIdx = areas.find((a) => a.name === loc.area)?.sortOrder ?? 0;
  const areaList = [...areas].sort((a, b) => Math.abs(a.sortOrder - myIdx) - Math.abs(b.sortOrder - myIdx));

  return (
    <>
      <PageCss id="R03-Search" />
      <div className="wrap" style={{ paddingTop: '24px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px' }} className="mute"><Link href="/" style={{ color: 'var(--kf-60666c)' }}>Home</Link> / {loc.city} / {loc.area}{cat ? ` / ${cat.label}` : ''}</nav>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
          <div>
            <h1 className="d" style={{ fontSize: 'clamp(28px,3vw,40px)', fontWeight: '700', lineHeight: '1.1' }}>{heading}</h1>
            <p className="mute" style={{ fontSize: '14px' }}>In {loc.area} and nearby areas of {loc.city} · prices in ₹ per day · <Link href="/location?next=/browse">change area</Link></p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <label htmlFor="sort" className="mute" style={{ fontSize: '13px', fontWeight: '600' }}>Sort</label>
            <AutoSubmit>
              <select id="sort" name="sort" form="filters" className="in" defaultValue={f.sort} style={{ width: 'auto', minHeight: '44px', borderRadius: '999px', padding: '0 16px' }}>
                <option value="nearest">Nearest area first</option>
                <option value="price">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="newest">Newest</option>
              </select>
            </AutoSubmit>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <Link className={`chip${!cat ? ' on' : ''}`} href={params({ category: undefined })}>All</Link>
          {CATEGORIES.map((c) => <Link key={c.key} className={`chip${cat?.key === c.key ? ' on' : ''}`} href={params({ category: c.slug })}>{c.label}</Link>)}
        </div>
      </div>
      <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start', paddingBottom: '72px' }}>
        <aside aria-label="Filters" style={{ flex: '1 1 260px', minWidth: '0', maxWidth: '100%', background: 'var(--kb-fffdf8)', borderRadius: '24px', padding: '4px 22px 20px', boxShadow: '0 1px 2px rgba(35,38,42,.06)' }}>
          <form id="filters" action="/browse" method="get">
            {cat && <input type="hidden" name="category" value={cat.slug} />}
            {f.q && <input type="hidden" name="q" value={f.q} />}
            <div className="fs" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><b style={{ fontSize: '16px' }}>Filters</b><Link href="/browse" style={{ fontSize: '13px', fontWeight: '700' }}>Clear all</Link></div>
            <div className="fs" id="dates">
              <span className="lbl">Dates available</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '8px' }}>
                <div><label htmlFor="f-from" className="mute" style={{ fontSize: '12px' }}>From (pickup)</label><input className="in" id="f-from" name="start" type="date" min={today} defaultValue={f.start} /></div>
                <div><label htmlFor="f-to" className="mute" style={{ fontSize: '12px' }}>To (return)</label><input className="in" id="f-to" name="end" type="date" min={today} defaultValue={f.end} /></div>
              </div>
              <span className="mute" style={{ fontSize: '12px' }}>Only items free for all these dates are shown.</span>
            </div>
            <div className="fs">
              <span className="lbl">Price per day</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '8px' }}>
                <div><label htmlFor="p-min" className="mute" style={{ fontSize: '12px' }}>Min ₹</label><input className="in" id="p-min" name="min" inputMode="numeric" defaultValue={f.minPrice ?? ''} /></div>
                <div><label htmlFor="p-max" className="mute" style={{ fontSize: '12px' }}>Max ₹</label><input className="in" id="p-max" name="max" inputMode="numeric" defaultValue={f.maxPrice ?? ''} /></div>
              </div>
            </div>
            <div className="fs">
              <span className="lbl">Security deposit</span>
              {[2000, 5000, 15000].map((d) => <label key={d} className="ck"><input type="radio" name="deposit" value={d} defaultChecked={f.maxDeposit === d} />Up to ₹{d.toLocaleString('en-IN')}</label>)}
              <label className="ck"><input type="radio" name="deposit" value="" defaultChecked={!f.maxDeposit} />Any</label>
            </div>
            <div className="fs">
              <span className="lbl">Handover</span>
              <label className="ck"><input type="checkbox" name="pickup" value="1" defaultChecked={f.pickup} />Self pickup</label>
              <label className="ck"><input type="checkbox" name="delivery" value="1" defaultChecked={f.delivery} />Owner delivers</label>
            </div>
            <div className="fs" style={{ borderBottom: '0' }}>
              <span className="lbl">Areas</span>
              {areaList.map((a) => <label key={a.id} className="ck"><input type="checkbox" name="area" value={a.name} defaultChecked={selAreas.has(a.name)} />{a.name}{a.name === loc.area ? ' (you)' : ''}</label>)}
              <span className="mute" style={{ fontSize: '12px' }}>None ticked = all of {loc.city}.</span>
            </div>
            <button className="btn btn-o" type="submit" style={{ width: '100%' }}>Apply filters</button>
          </form>
        </aside>
        <main style={{ flex: '999 1 600px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {res.cards.length === 0 ? (
            <EmptyState
              title={`No ${noun}${f.q ? ` matching “${f.q}”` : ''} near ${loc.area}${f.start ? ` for ${fmtRange(f.start, f.end!)}` : ''}`}
              text="Nobody nearby has one free yet. Try other dates, a wider price range or another area."
              chips={[{ href: params({ area: undefined }), label: `Include all ${loc.city}` }, { href: params({ start: undefined, end: undefined }), label: 'Any date' }, { href: '/browse', label: 'Clear filters' }]}
            />
          ) : (
            <div style={{ display: 'grid', gap: '40px 24px', gridTemplateColumns: 'repeat(auto-fill,minmax(min(260px,100%),1fr))' }}>
              {res.cards.map((c) => <ItemCard key={c.href} {...c} />)}
            </div>
          )}
          {res.total > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', paddingTop: '16px' }}>
              <span className="mute" style={{ fontSize: '13px' }}>Showing {(res.page - 1) * PAGE_SIZE + 1}–{Math.min(res.page * PAGE_SIZE, res.total)} of {res.total}</span>
              <Pager page={res.page} total={res.total} size={PAGE_SIZE} href={(p) => `${params({})}${params({}).includes('?') ? '&' : '?'}page=${p}`} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
