import Link from 'next/link';
import type { ItemStatus, Prisma } from '@prisma/client';
import PageCss from '@/components/PageCss';
import Pager from '@/components/Pager';
import AdminSearch from '@/components/AdminSearch';
import { prisma } from '@/lib/db';
import { ADMIN_PAGE_SIZE, categoryLabel } from '@/lib/constants';
import { inr } from '@/lib/format';
import { approveListingAction, rejectListingAction } from '@/app/actions/admin';

export const metadata = { title: 'Listing approvals' };

const TABS: { key: string; label: string; status: ItemStatus[] }[] = [
  { key: 'pending', label: 'Pending', status: ['PENDING_REVIEW'] },
  { key: 'live', label: 'Live', status: ['ACTIVE', 'PAUSED'] },
  { key: 'rejected', label: 'Changes requested', status: ['REJECTED'] },
];

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; page?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const search: Prisma.ItemWhereInput = q
    ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { owner: { name: { contains: q, mode: 'insensitive' } } }, { owner: { email: { contains: q, mode: 'insensitive' } } }, { area: { contains: q, mode: 'insensitive' } }] }
    : {};
  const where: Prisma.ItemWhereInput = { deletedAt: null, status: { in: tab.status }, ...search };
  const [counts, total, items] = await Promise.all([
    Promise.all(TABS.map((t) => prisma.item.count({ where: { deletedAt: null, status: { in: t.status }, ...search } }))),
    prisma.item.count({ where }),
    prisma.item.findMany({ where, include: { owner: true }, orderBy: { updatedAt: tab.key === 'pending' ? 'asc' : 'desc' }, skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE }),
  ]);
  const qs = (p: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ tab: tab.key, q: q || undefined, ...p })) if (v !== undefined && v !== '') u.set(k, String(v));
    return `/admin/listings?${u}`;
  };
  const back = qs({ page });

  return (
    <>
      <PageCss id="A03-ListingApprovals" />
      <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,40px)', fontWeight: '700' }}>Listing approvals</h1>
      {sp.ok && <p className="k-alert ok">{sp.ok}</p>}
      {sp.error && <p className="k-alert err">{sp.error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {TABS.map((t, i) => (
          <Link key={t.key} href={`/admin/listings?tab=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className={`chip${t.key === tab.key ? ' on' : ''}`} style={{ textDecoration: 'none', color: t.key === tab.key ? '#fff' : '#23262A' }}>{t.label} · {counts[i]}</Link>
        ))}
        <AdminSearch action="/admin/listings" q={q} hidden={{ tab: tab.key }} placeholder="Search title, owner, area" />
      </div>
      {items.length === 0 && <p className="k-alert info">{q ? `Nothing matches “${q}”.` : tab.key === 'pending' ? 'All caught up — no listings waiting.' : 'Nothing here.'}</p>}
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill,minmax(min(320px,100%),1fr))' }}>
        {items.map((it) => {
          const ownerOk = it.owner.idStatus === 'VERIFIED' && !it.owner.isBlocked;
          const hint = it.photos.length < 2 ? `Only ${it.photos.length} photo. Ask for photos of everything included.` : it.deposit < it.pricePerDay * 3 ? 'Deposit looks low compared with the daily price.' : null;
          return (
            <article key={it.id} style={{ background: '#FFFDF8', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(35,38,42,.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '80px 80px', gap: '4px', padding: '4px' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ ...(i === 0 ? { gridRow: 'span 2', borderRadius: '18px 6px 6px 18px' } : { borderRadius: i === 1 ? '6px 18px 6px 6px' : '6px 6px 18px 6px' }), background: ['#EDE5D5', '#E4E9DF', '#EDE5D5'][i], position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: i === 0 ? '8px' : 0, fontSize: '11.5px', fontWeight: '700', color: '#2F4E40' }}>
                    {it.photos[i] && <a href={it.photos[i]} target="_blank" rel="noreferrer" style={{ position: 'absolute', inset: 0 }}><img src={it.photos[i]} alt="" className="k-photo" /></a>}
                    {i === 0 && <span style={{ position: 'relative', background: 'rgba(255,253,248,.9)', padding: '2px 8px', borderRadius: '999px' }}>{it.photos.length} photos</span>}
                  </div>
                ))}
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px', flex: '1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'flex-start' }}>
                  <b style={{ fontSize: '16px' }}>{it.title}</b>
                  <span className="badge" style={{ background: it.status === 'ACTIVE' ? '#DCEEDF' : it.status === 'REJECTED' ? '#F7DCD7' : '#EDE5D5', color: it.status === 'ACTIVE' ? '#1E5A37' : it.status === 'REJECTED' ? '#8E2A20' : '#474C52' }}>{it.status === 'PENDING_REVIEW' ? 'Pending' : it.status === 'ACTIVE' ? 'Live' : it.status === 'PAUSED' ? 'Paused' : 'Changes'}</span>
                </div>
                <span className="mute" style={{ fontSize: '13px' }}>{it.owner.name} · {it.area}, {it.city} · {categoryLabel(it.category)}</span>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', flexWrap: 'wrap' }}><span>{inr(it.pricePerDay)}/day</span>{it.pricePerWeek && <span>{inr(it.pricePerWeek)}/week</span>}<span>Deposit <b>{inr(it.deposit)}</b></span></div>
                <details style={{ fontSize: '13.5px' }}><summary style={{ cursor: 'pointer', fontWeight: 700 }}>Description</summary><p style={{ whiteSpace: 'pre-wrap', color: '#474C52' }}>{it.description}</p></details>
                {!ownerOk && <span style={{ fontSize: '13px', fontWeight: '600', color: '#8E2A20', background: '#F7DCD7', padding: '8px 12px', borderRadius: '12px' }}>Owner ID is {it.owner.isBlocked ? 'blocked' : it.owner.idStatus.toLowerCase()} — can’t go live until verified.</span>}
                {hint && tab.key === 'pending' && <span style={{ fontSize: '13px', fontWeight: '600', color: '#7A4708', background: '#FBEBCF', padding: '8px 12px', borderRadius: '12px' }}>{hint}</span>}
                {it.rejectReason && tab.key === 'rejected' && <span style={{ fontSize: '13px', fontWeight: '600', color: '#8E2A20', background: '#F7DCD7', padding: '8px 12px', borderRadius: '12px' }}>{it.rejectReason}</span>}
              </div>
              {tab.key !== 'rejected' && (
                <div style={{ padding: '12px 18px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <details>
                    <summary className="btn" style={{ width: '100%', listStyle: 'none', background: 'transparent', color: tab.key === 'live' ? '#8E2A20' : '#7A4708', boxShadow: `inset 0 0 0 1.5px ${tab.key === 'live' ? '#B3372B' : '#B26B12'}` }}>{tab.key === 'live' ? 'Take down' : 'Request changes'}</summary>
                    <form action={rejectListingAction} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      <input type="hidden" name="id" value={it.id} />
                      <input type="hidden" name="back" value={back} />
                      <textarea name="reason" className="k-in" required minLength={3} placeholder={tab.key === 'live' ? 'Why is it being taken down?' : 'What should the owner change?'}></textarea>
                      <button className="btn" type="submit" style={{ background: '#B3372B', color: '#fff' }}>{tab.key === 'live' ? 'Take down item' : 'Send back to owner'}</button>
                    </form>
                  </details>
                  {tab.key === 'pending' && (
                    <form action={approveListingAction}>
                      <input type="hidden" name="id" value={it.id} />
                      <input type="hidden" name="back" value={back} />
                      <button className="btn" type="submit" disabled={!ownerOk} style={{ width: '100%', background: '#1F4D3A', color: '#fff' }}>Approve</button>
                    </form>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
      <Pager page={page} total={total} size={ADMIN_PAGE_SIZE} href={(p) => qs({ page: p })} />
    </>
  );
}
