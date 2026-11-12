import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import PageCss from '@/components/PageCss';
import Pager from '@/components/Pager';
import AdminSearch from '@/components/AdminSearch';
import ConfirmButton from '@/components/ConfirmButton';
import { prisma } from '@/lib/db';
import { ADMIN_PAGE_SIZE } from '@/lib/constants';
import { avatarColor, fmtRange, fmtTime, initials, inr, monthYear } from '@/lib/format';
import { STATUS_LABEL } from '@/lib/bookings';
import { setBlockedAction } from '@/app/actions/admin';

export const metadata = { title: 'Users · admin' };

const ID_BADGE = { NONE: ['var(--kb-ede5d5)', 'var(--kf-474c52)', 'None'], PENDING: ['var(--kb-fbebcf)', 'var(--kf-7a4708)', 'Pending'], VERIFIED: ['var(--kb-dceedf)', 'var(--kf-1e5a37)', 'Verified'], REJECTED: ['var(--kb-f7dcd7)', 'var(--kf-8e2a20)', 'Rejected'] } as const;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; u?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.UserWhereInput = q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }, { phone: { contains: q } }, { area: { contains: q, mode: 'insensitive' } }] } : {};
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE, include: { _count: { select: { rentals: true, items: true } } } }),
  ]);
  const ratings = await prisma.review.groupBy({ by: ['toUserId'], where: { toUserId: { in: users.map((u) => u.id) } }, _avg: { rating: true } });
  const sel = sp.u
    ? await prisma.user.findUnique({
        where: { id: sp.u },
        include: {
          items: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 20 },
          rentals: { include: { item: { select: { title: true } }, claim: true }, orderBy: { createdAt: 'desc' }, take: 20 },
          ownerBookings: { include: { item: { select: { title: true } }, claim: true }, orderBy: { createdAt: 'desc' }, take: 20 },
          complaints: { take: 10, orderBy: { createdAt: 'desc' } },
        },
      })
    : null;
  const qs = (p: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ q: q || undefined, page: page > 1 ? page : undefined, ...p })) if (v !== undefined && v !== '') u.set(k, String(v));
    return `/admin/users?${u}`;
  };
  return (
    <>
      <PageCss id="A04-Users" />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px' }}>
        <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,40px)', fontWeight: '700' }}>Users</h1>
        <AdminSearch action="/admin/users" q={q} placeholder="Name, email, phone, area" />
      </div>
      {sp.ok && <p className="k-alert ok">{sp.ok}</p>}
      {sp.error && <p className="k-alert err">{sp.error}</p>}
      {sel && (
        <>
        <Link href={qs({ u: undefined })} aria-label="Close user details" className="k-drawer-bg"></Link>
        <section role="dialog" aria-modal="true" aria-label={`User details: ${sel.name}`} className="k-drawer">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            <span style={{ width: '52px', height: '52px', borderRadius: '50%', background: avatarColor(sel.id), color: 'var(--kf-ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{initials(sel.name)}</span>
            <div style={{ flex: '1 1 240px' }}><b className="d" style={{ fontSize: '22px' }}>{sel.name}</b><p className="mute" style={{ fontSize: '13.5px' }}>{sel.email}{sel.phone ? ` · ${sel.phone}` : ''} · {sel.area ? `${sel.area}, ${sel.city}` : 'no area'} · member since {monthYear(sel.createdAt)}</p></div>
            <span className="badge" style={{ background: ID_BADGE[sel.idStatus][0], color: ID_BADGE[sel.idStatus][1] }}>ID {ID_BADGE[sel.idStatus][2]}</span>
            {sel.ownerStatus !== 'NONE' && <Link href={`/admin/owners?tab=${sel.ownerStatus.toLowerCase()}&u=${sel.id}`} className="badge" style={{ background: sel.ownerStatus === 'APPROVED' ? 'var(--kb-dceedf)' : sel.ownerStatus === 'PENDING' ? 'var(--kb-fbebcf)' : 'var(--kb-f7dcd7)', color: 'var(--kf-23262a)', textDecoration: 'none' }}>Owner {sel.ownerStatus.toLowerCase()}</Link>}
            {sel.ownerCancellations > 0 && <span className="badge" style={{ background: 'var(--kb-f7dcd7)', color: 'var(--kf-8e2a20)' }}>{sel.ownerCancellations} owner cancellation{sel.ownerCancellations > 1 ? 's' : ''}</span>}
            {sel.idStatus === 'PENDING' && <Link href={`/admin/ids?u=${sel.id}`} style={{ fontWeight: 700, fontSize: '13px' }}>Review ID →</Link>}
            <Link href={qs({ u: undefined })} style={{ fontWeight: 700, fontSize: '13px' }}>Close ✕</Link>
          </div>
          {sel.idRejectReason && sel.idStatus === 'REJECTED' && <p className="mute" style={{ fontSize: '13px' }}>ID rejected: {sel.idRejectReason}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13.5px' }}>
            <div><b>Listings ({sel.items.length})</b>{sel.items.length === 0 ? <p className="mute">None</p> : <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>{sel.items.map((i) => <li key={i.id}><Link href={`/items/${i.id}`}>{i.title}</Link> · {i.status.toLowerCase().replace('_', ' ')}</li>)}</ul>}</div>
            <div><b>Rentals ({sel.rentals.length})</b>{sel.rentals.length === 0 ? <p className="mute">None</p> : <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>{sel.rentals.map((b) => <li key={b.id}><Link href={`/admin/bookings?id=${b.id}`}>{b.code}</Link> · {b.item.title} · {fmtRange(b.startDate, b.endDate)} · {STATUS_LABEL[b.status]}{b.claim ? ` · claim ${inr(b.claim.amount)} ${b.claim.status.toLowerCase()}` : ''}</li>)}</ul>}</div>
            <div><b>As owner ({sel.ownerBookings.length})</b>{sel.ownerBookings.length === 0 ? <p className="mute">None</p> : <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>{sel.ownerBookings.map((b) => <li key={b.id}><Link href={`/admin/bookings?id=${b.id}`}>{b.code}</Link> · {b.item.title} · {STATUS_LABEL[b.status]}{b.claim ? ` · claim ${inr(b.claim.amount)} ${b.claim.status.toLowerCase()}` : ''}</li>)}</ul>}</div>
            <div><b>Complaints ({sel.complaints.length})</b>{sel.complaints.length === 0 ? <p className="mute">None</p> : <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>{sel.complaints.map((c) => <li key={c.id}>{fmtTime(c.createdAt)} · {c.reason} · {c.status.toLowerCase()}</li>)}</ul>}</div>
          </div>
        </section>
        </>
      )}
      <div className="tw"><table>
        <thead><tr><th>User</th><th>Role</th><th>ID</th><th>Rentals</th><th>Listings</th><th>Rating</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {users.length === 0 && <tr><td colSpan={8} className="mute">Nobody matches “{q}”.</td></tr>}
          {users.map((u) => {
            const r = ratings.find((x) => x.toUserId === u.id)?._avg.rating;
            const role = u.isAdmin ? 'Admin' : u._count.items && u._count.rentals ? 'Both' : u._count.items ? 'Owner' : 'Renter';
            return (
              <tr key={u.id} style={{ opacity: u.isBlocked ? 0.6 : 1 }}>
                <td><Link href={qs({ u: u.id })} style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--kf-23262a)', textDecoration: 'none' }}><span style={{ width: '36px', height: '36px', borderRadius: '50%', background: avatarColor(u.id), color: 'var(--kf-ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px', flex: 'none' }}>{initials(u.name)}</span><span><b>{u.name}</b><br /><span className="mute" style={{ fontSize: '12.5px' }}>{u.email}</span></span></Link></td>
                <td>{role}</td>
                <td><span className="badge" style={{ background: ID_BADGE[u.idStatus][0], color: ID_BADGE[u.idStatus][1] }}>{ID_BADGE[u.idStatus][2]}</span></td>
                <td>{u._count.rentals}</td><td>{u._count.items}</td><td>{r ? r.toFixed(1) : '—'}</td>
                <td><span className="badge" style={u.isBlocked ? { background: 'var(--kb-f7dcd7)', color: 'var(--kf-8e2a20)' } : { background: 'var(--kb-eef3ec)', color: 'var(--kf-1f4d3a)' }}>{u.isBlocked ? 'Blocked' : 'Active'}</span></td>
                <td>
                  {!u.isAdmin && (
                    <form action={setBlockedAction}>
                      <input type="hidden" name="id" value={u.id} /><input type="hidden" name="back" value={qs({ u: sp.u })} /><input type="hidden" name="block" value={u.isBlocked ? '0' : '1'} />
                      {u.isBlocked
                        ? <button className="sb" type="submit" style={{ background: 'transparent', color: 'var(--kf-1f4d3a)', boxShadow: 'inset 0 0 0 1.5px var(--kl-1f4d3a)' }}>Unblock</button>
                        : <ConfirmButton message={`Block ${u.name}? They are logged out and their items are hidden.`} className="sb" style={{ background: 'transparent', color: 'var(--kf-8e2a20)', boxShadow: 'inset 0 0 0 1.5px var(--kl-b3372b)' }}>Block</ConfirmButton>}
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
      <Pager page={page} total={total} size={ADMIN_PAGE_SIZE} href={(n) => qs({ page: n })} />
    </>
  );
}
