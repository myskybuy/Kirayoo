import Link from 'next/link';
import type { IdStatus, Prisma } from '@prisma/client';
import PageCss from '@/components/PageCss';
import Pager from '@/components/Pager';
import AdminSearch from '@/components/AdminSearch';
import { prisma } from '@/lib/db';
import { ADMIN_PAGE_SIZE } from '@/lib/constants';
import { avatarColor, fmtTime, initials } from '@/lib/format';
import { approveIdAction, rejectIdAction } from '@/app/actions/admin';

export const metadata = { title: 'ID verifications' };

const TABS: { key: string; label: string; status: IdStatus }[] = [
  { key: 'pending', label: 'Pending', status: 'PENDING' },
  { key: 'verified', label: 'Verified', status: 'VERIFIED' },
  { key: 'rejected', label: 'Rejected', status: 'REJECTED' },
];
const REASONS = ['Photo is blurry or cut off', 'Name doesn’t match profile', 'Selfie doesn’t match ID photo', 'ID expired', 'Aadhaar number not masked', 'Not an accepted government ID'];

function ago(d: Date | null) {
  if (!d) return '';
  const m = Math.round((Date.now() - d.getTime()) / 60000);
  return m < 60 ? `${m} min` : m < 48 * 60 ? `${Math.round(m / 60)} h` : `${Math.round(m / 1440)} d`;
}

export default async function AdminIdsPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; page?: string; u?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const search: Prisma.UserWhereInput = q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] } : {};
  const where: Prisma.UserWhereInput = { idStatus: tab.status, isAdmin: false, ...search };
  const [counts, total, users] = await Promise.all([
    Promise.all(TABS.map((t) => prisma.user.count({ where: { idStatus: t.status, isAdmin: false, ...search } }))),
    prisma.user.count({ where }),
    prisma.user.findMany({ where, orderBy: tab.key === 'pending' ? { idSubmittedAt: 'asc' } : { idReviewedAt: 'desc' }, skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE, include: { _count: { select: { items: true, rentals: true } } } }),
  ]);
  const sel = users.find((u) => u.id === sp.u) ?? users[0];
  const qs = (p: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ tab: tab.key, q: q || undefined, page: page > 1 ? page : undefined, ...p })) if (v !== undefined && v !== '') u.set(k, String(v));
    return `/admin/ids?${u}`;
  };
  // After approving/rejecting, come back to the same tab/page (the next person in the queue).
  const back = qs({});

  return (
    <>
      <PageCss id="A02-IDVerifications" />
      <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,40px)', fontWeight: '700' }}>ID verifications</h1>
      {sp.ok && <p className="k-alert ok">{sp.ok}</p>}
      {sp.error && <p className="k-alert err">{sp.error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {TABS.map((t, i) => <Link key={t.key} href={`/admin/ids?tab=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className="k-btn sm" style={t.key === tab.key ? { background: '#23262A', color: '#fff' } : { background: '#FFFDF8', color: '#23262A', boxShadow: 'inset 0 0 0 1px #E3DACA' }}>{t.label} · {counts[i]}</Link>)}
        <AdminSearch action="/admin/ids" q={q} hidden={{ tab: tab.key }} placeholder="Search name or email" />
      </div>
      {users.length === 0 ? (
        <p className="k-alert info">{q ? `Nobody matches “${q}”.` : tab.key === 'pending' ? 'No IDs waiting — all caught up.' : 'Nothing here.'}</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
          <aside aria-label="Queue" style={{ flex: '1 1 260px', maxWidth: '100%', padding: '10px', borderRadius: '22px', background: '#FFFDF8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="mute" style={{ fontSize: '12px', fontWeight: '700', padding: '6px 8px', letterSpacing: '.06em' }}>{tab.label.toUpperCase()}{tab.key === 'pending' ? ' · OLDEST FIRST' : ''}</span>
            {users.map((u) => {
              const on = u.id === sel?.id;
              return (
                <Link key={u.id} className="qi" href={qs({ u: u.id })} aria-current={on} style={{ background: on ? '#EEF3EC' : 'transparent', boxShadow: on ? 'inset 0 0 0 1.5px #1F4D3A' : 'none', color: '#23262A', textDecoration: 'none' }}>
                  <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: avatarColor(u.id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flex: 'none' }}>{initials(u.name)}</span>
                  <span style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: '0' }}><b style={{ fontSize: '14px' }}>{u.name}</b><span className="mute" style={{ fontSize: '12px' }}>{u._count.items ? 'Owner' : 'Renter'} · {ago(tab.key === 'pending' ? u.idSubmittedAt : u.idReviewedAt)}</span></span>
                  <span className="badge" style={tab.key === 'pending' ? { background: '#FBEBCF', color: '#7A4708' } : tab.key === 'verified' ? { background: '#DCEEDF', color: '#1E5A37' } : { background: '#F7DCD7', color: '#8E2A20' }}>{tab.label}</span>
                </Link>
              );
            })}
            <Pager page={page} total={total} size={ADMIN_PAGE_SIZE} href={(p) => qs({ page: p })} />
          </aside>
          {sel && (
            <section style={{ flex: '999 1 520px', minWidth: '0', padding: '24px', borderRadius: '24px', background: '#FFFDF8', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h2 className="d" style={{ fontSize: '26px', fontWeight: '700' }}>{sel.name}</h2><span className="mute" style={{ fontSize: '13.5px' }}>{sel.email} · {sel.area ? `${sel.area}, ${sel.city}` : 'no area'} · {sel._count.items ? `Owner (${sel._count.items} items)` : 'Renter'}</span></div>
                <span className="badge" style={{ background: '#EDE5D5', color: '#474C52' }}>{sel.idDocType ?? 'ID'}</span>
              </div>
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
                {[['ID document', sel.idDocPath], ['Selfie', sel.selfiePath]].map(([label, path]) => (
                  <a key={label} className="doc" href={path ?? undefined} target="_blank" rel="noreferrer" style={{ height: '220px', background: label === 'Selfie' ? '#23262A' : '#E4E9DF', color: label === 'Selfie' ? '#F6F1E7' : '#2F4E40', overflow: 'hidden', position: 'relative', textDecoration: 'none' }}>
                    {path ? <img src={path} alt={label!} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : 'Not uploaded'}
                    <span style={{ position: 'absolute', left: '8px', bottom: '8px', background: 'rgba(255,253,248,.9)', color: '#23262A', padding: '2px 8px', borderRadius: '999px' }}>{label} · open full size</span>
                  </a>
                ))}
              </div>
              <div>
                <div className="ck"><span className="mute">Name on profile</span><b>{sel.name}</b></div>
                <div className="ck"><span className="mute">Name on ID (you check)</span><b>Compare with the document</b></div>
                <div className="ck"><span className="mute">Submitted</span><b>{sel.idSubmittedAt ? fmtTime(sel.idSubmittedAt) : '—'}</b></div>
                {sel.idReviewedAt && <div className="ck"><span className="mute">Reviewed</span><b>{fmtTime(sel.idReviewedAt)}</b></div>}
                {sel.idRejectReason && <div className="ck" style={{ border: '0' }}><span className="mute">Reject reason</span><b>{sel.idRejectReason}</b></div>}
              </div>
              {sel.idStatus === 'PENDING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '18px', borderRadius: '20px', background: '#F6F1E7' }}>
                  <form action={rejectIdAction} style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', alignItems: 'end' }}>
                    <input type="hidden" name="id" value={sel.id} /><input type="hidden" name="back" value={back} />
                    <div><label htmlFor="rr" style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#474C52', marginBottom: '6px' }}>Reject reason (shown to user)</label><select className="in" id="rr" name="reason">{REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
                    <div><label htmlFor="rn" style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#474C52', marginBottom: '6px' }}>Extra note (optional)</label><input className="in" id="rn" name="note" type="text" maxLength={200} placeholder="Retake in daylight, all 4 corners visible" /></div>
                    <button className="btn" type="submit" style={{ background: 'transparent', color: '#8E2A20', boxShadow: 'inset 0 0 0 1.5px #B3372B' }}>Reject</button>
                  </form>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end' }}>
                    <form action={approveIdAction}><input type="hidden" name="id" value={sel.id} /><input type="hidden" name="back" value={back} /><button className="btn" type="submit" style={{ background: '#1F4D3A', color: '#fff' }}>Approve ID</button></form>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </>
  );
}
