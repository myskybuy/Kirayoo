import Link from 'next/link';
import type { OwnerStatus, Prisma } from '@prisma/client';
import PageCss from '@/components/PageCss';
import Pager from '@/components/Pager';
import AdminSearch from '@/components/AdminSearch';
import { prisma } from '@/lib/db';
import { ADMIN_PAGE_SIZE, categoryLabel } from '@/lib/constants';
import { avatarColor, fmtTime, initials } from '@/lib/format';
import { approveOwnerAction, rejectOwnerAction } from '@/app/actions/admin';

export const metadata = { title: 'Owner approvals' };

const TABS: { key: string; label: string; status: OwnerStatus }[] = [
  { key: 'pending', label: 'Pending', status: 'PENDING' },
  { key: 'approved', label: 'Approved', status: 'APPROVED' },
  { key: 'rejected', label: 'Rejected', status: 'REJECTED' },
];
const ID_TONE: Record<string, [string, string]> = { VERIFIED: ['var(--kb-dceedf)', 'var(--kf-1e5a37)'], PENDING: ['var(--kb-fbebcf)', 'var(--kf-7a4708)'], REJECTED: ['var(--kb-f7dcd7)', 'var(--kf-8e2a20)'], NONE: ['var(--kb-ede5d5)', 'var(--kf-474c52)'] };

export default async function AdminOwnersPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; page?: string; u?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const search: Prisma.UserWhereInput = q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }, { ownerApplication: { phone: { contains: q } } }] } : {};
  const where: Prisma.UserWhereInput = { ownerStatus: tab.status, isAdmin: false, ...search };
  const [counts, total, users] = await Promise.all([
    Promise.all(TABS.map((t) => prisma.user.count({ where: { ownerStatus: t.status, isAdmin: false, ...search } }))),
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      // Oldest application first in the queue; owners seeded before applications existed sort last.
      orderBy: tab.key === 'pending' ? { ownerApplication: { submittedAt: 'asc' } } : { createdAt: 'desc' },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: { ownerApplication: true, _count: { select: { items: { where: { deletedAt: null } } } } },
    }),
  ]);
  const sel = users.find((u) => u.id === sp.u) ?? users[0];
  const app = sel?.ownerApplication;
  const qs = (p: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ tab: tab.key, q: q || undefined, page: page > 1 ? page : undefined, ...p })) if (v !== undefined && v !== '') u.set(k, String(v));
    return `/admin/owners?${u}`;
  };
  const back = qs({});

  return (
    <>
      <PageCss id="A02-IDVerifications" />
      <div><p className="mute" style={{ fontSize: '14px' }}>Approved owners also need a verified ID before their items can go live</p><h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,40px)', fontWeight: '700' }}>Owner approvals</h1></div>
      {sp.ok && <p className="k-alert ok">{sp.ok}</p>}
      {sp.error && <p className="k-alert err">{sp.error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {TABS.map((t, i) => <Link key={t.key} href={`/admin/owners?tab=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className="k-btn sm" style={t.key === tab.key ? { background: 'var(--kb-23262a)', color: 'var(--kf-ffffff)' } : { background: 'var(--kb-fffdf8)', color: 'var(--kf-23262a)', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)' }}>{t.label} · {counts[i]}</Link>)}
        <AdminSearch action="/admin/owners" q={q} hidden={{ tab: tab.key }} placeholder="Search name, email or phone" />
      </div>
      {users.length === 0 ? (
        <p className="k-alert info">{q ? `Nobody matches “${q}”.` : tab.key === 'pending' ? 'No owner applications waiting — all caught up.' : 'Nothing here.'}</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
          <aside aria-label="Applications" style={{ flex: '1 1 260px', maxWidth: '100%', padding: '10px', borderRadius: '22px', background: 'var(--kb-fffdf8)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="mute" style={{ fontSize: '12px', fontWeight: '700', padding: '6px 8px', letterSpacing: '.06em' }}>{tab.label.toUpperCase()}{tab.key === 'pending' ? ' · OLDEST FIRST' : ''}</span>
            {users.map((u) => {
              const on = u.id === sel?.id;
              return (
                <Link key={u.id} className="qi" href={qs({ u: u.id })} aria-current={on} style={{ background: on ? 'var(--kb-eef3ec)' : 'transparent', boxShadow: on ? 'inset 0 0 0 1.5px #1F4D3A' : 'none', color: 'var(--kf-23262a)', textDecoration: 'none' }}>
                  <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: avatarColor(u.id), color: 'var(--kf-ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flex: 'none' }}>{initials(u.name)}</span>
                  <span style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: '0' }}><b style={{ fontSize: '14px' }}>{u.name}</b><span className="mute" style={{ fontSize: '12px' }}>{u.area ? `${u.area}, ${u.city}` : u.email}</span></span>
                  <span className="badge" style={{ background: ID_TONE[u.idStatus][0], color: ID_TONE[u.idStatus][1] }}>ID {u.idStatus.toLowerCase()}</span>
                </Link>
              );
            })}
            <Pager page={page} total={total} size={ADMIN_PAGE_SIZE} href={(p) => qs({ page: p })} />
          </aside>
          {sel && (
            <section aria-label={`Application from ${sel.name}`} style={{ flex: '999 1 520px', minWidth: '0', padding: '24px', borderRadius: '24px', background: 'var(--kb-fffdf8)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h2 className="d" style={{ fontSize: '26px', fontWeight: '700' }}>{sel.name}</h2><span className="mute" style={{ fontSize: '13.5px' }}>{sel.email} · {sel.area ? `${sel.area}, ${sel.city}` : 'no area'} · joined {fmtTime(sel.createdAt)}</span></div>
                <Link href={`/admin/users?u=${sel.id}&q=${encodeURIComponent(sel.email)}`} style={{ fontWeight: 700, fontSize: '13px' }}>User details →</Link>
              </div>
              {app ? (
                <div>
                  <div className="ck"><span className="mute">Name on application</span><b>{app.name}</b></div>
                  <div className="ck"><span className="mute">Phone</span><b>{app.phone}</b></div>
                  <div className="ck"><span className="mute">Will rent</span><b>{app.categories.map(categoryLabel).join(', ')}</b></div>
                  <div className="ck" style={{ alignItems: 'flex-start' }}><span className="mute">About the items</span><b style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{app.plans}</b></div>
                  <div className="ck"><span className="mute">Accepted owner terms</span><b>{fmtTime(app.termsAt)}</b></div>
                  <div className="ck"><span className="mute">Submitted</span><b>{fmtTime(app.submittedAt)}</b></div>
                  {app.reviewedAt && <div className="ck"><span className="mute">Reviewed</span><b>{fmtTime(app.reviewedAt)}</b></div>}
                </div>
              ) : (
                <p className="mute">Owner from before applications existed — no form on file.</p>
              )}
              <div className="ck"><span className="mute">ID check</span><b style={{ color: ID_TONE[sel.idStatus][1] }}>{sel.idStatus === 'VERIFIED' ? 'Verified' : sel.idStatus === 'PENDING' ? <Link href={`/admin/ids?u=${sel.id}`}>Pending — review ID →</Link> : sel.idStatus === 'REJECTED' ? 'Rejected' : 'Not submitted yet'}</b></div>
              <div className="ck" style={{ border: 0 }}><span className="mute">Listings</span><b>{sel._count.items}</b></div>
              {sel.ownerRejectReason && sel.ownerStatus === 'REJECTED' && <p className="k-alert warn">Rejected: {sel.ownerRejectReason}</p>}
              {sel.ownerStatus === 'PENDING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '18px', borderRadius: '20px', background: 'var(--kb-f6f1e7)' }}>
                  <form action={rejectOwnerAction} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="hidden" name="id" value={sel.id} /><input type="hidden" name="back" value={back} />
                    <label htmlFor="or" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--kf-474c52)' }}>Reject reason (shown to the applicant)</label>
                    <textarea className="in" id="or" name="reason" required minLength={3} maxLength={300} placeholder="e.g. Please describe the items you'll rent in more detail."></textarea>
                    <button className="btn" type="submit" style={{ alignSelf: 'flex-start', background: 'transparent', color: 'var(--kf-8e2a20)', boxShadow: 'inset 0 0 0 1.5px var(--kl-b3372b)' }}>Reject</button>
                  </form>
                  <form action={approveOwnerAction} style={{ alignSelf: 'flex-end' }}><input type="hidden" name="id" value={sel.id} /><input type="hidden" name="back" value={back} /><button className="btn" type="submit" style={{ background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)' }}>Approve owner</button></form>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </>
  );
}
