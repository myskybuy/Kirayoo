import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import PageCss from '@/components/PageCss';
import Pager from '@/components/Pager';
import AdminSearch from '@/components/AdminSearch';
import { prisma } from '@/lib/db';
import { ADMIN_PAGE_SIZE } from '@/lib/constants';
import { fmtTime } from '@/lib/format';
import { resolveComplaintAction, resolveContactAction } from '@/app/actions/admin';

export const metadata = { title: 'Complaints & contact' };

export default async function ComplaintsPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; page?: string; show?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const tab = sp.tab === 'contact' ? 'contact' : 'complaints';
  const showResolved = sp.show === 'resolved';
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const qs = (p: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ tab, q: q || undefined, show: showResolved ? 'resolved' : undefined, page: page > 1 ? page : undefined, ...p })) if (v !== undefined && v !== '') u.set(k, String(v));
    return `/admin/complaints?${u}`;
  };
  const cWhere: Prisma.ComplaintWhereInput = { status: showResolved ? 'RESOLVED' : 'OPEN', ...(q ? { OR: [{ text: { contains: q, mode: 'insensitive' } }, { booking: { code: { contains: q, mode: 'insensitive' } } }, { byUser: { name: { contains: q, mode: 'insensitive' } } }] } : {}) };
  const mWhere: Prisma.ContactMessageWhereInput = { resolved: showResolved, ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }, { message: { contains: q, mode: 'insensitive' } }] } : {}) };
  const [openC, openM, total, complaints, messages] = await Promise.all([
    prisma.complaint.count({ where: { status: 'OPEN' } }),
    prisma.contactMessage.count({ where: { resolved: false } }),
    tab === 'complaints' ? prisma.complaint.count({ where: cWhere }) : prisma.contactMessage.count({ where: mWhere }),
    tab === 'complaints' ? prisma.complaint.findMany({ where: cWhere, include: { booking: { include: { item: { select: { title: true } } } }, byUser: true }, orderBy: { createdAt: 'asc' }, skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE }) : Promise.resolve([]),
    tab === 'contact' ? prisma.contactMessage.findMany({ where: mWhere, orderBy: { createdAt: 'asc' }, skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE }) : Promise.resolve([]),
  ]);
  const back = qs({});
  const tabBtn = (on: boolean) => (on ? { background: '#23262A', color: '#fff' } : { background: '#FFFDF8', color: '#23262A', boxShadow: 'inset 0 0 0 1px #E3DACA' });
  return (
    <>
      <PageCss id="A05-Bookings" />
      <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,40px)', fontWeight: '700' }}>Complaints &amp; contact</h1>
      {sp.ok && <p className="k-alert ok">{sp.ok}</p>}
      {sp.error && <p className="k-alert err">{sp.error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <Link className="k-btn sm" href="/admin/complaints?tab=complaints" style={tabBtn(tab === 'complaints')}>Problem reports · {openC}</Link>
        <Link className="k-btn sm" href="/admin/complaints?tab=contact" style={tabBtn(tab === 'contact')}>Contact messages · {openM}</Link>
        <Link className="k-btn sm" href={qs({ show: showResolved ? undefined : 'resolved', page: undefined })} style={tabBtn(false)}>{showResolved ? 'Show open' : 'Show resolved'}</Link>
        <AdminSearch action="/admin/complaints" q={q} hidden={{ tab, ...(showResolved ? { show: 'resolved' } : {}) }} placeholder="Search" />
      </div>
      {tab === 'complaints' && complaints.length === 0 && <p className="k-alert info">No {showResolved ? 'resolved' : 'open'} problem reports.</p>}
      {tab === 'contact' && messages.length === 0 && <p className="k-alert info">No {showResolved ? 'resolved' : 'open'} contact messages.</p>}
      {complaints.map((c) => (
        <section key={c.id} style={{ padding: '20px', borderRadius: '22px', background: '#FFFDF8', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px' }}><b>{c.reason} · <Link href={`/admin/bookings?id=${c.bookingId}`}>{c.booking.code}</Link> · {c.booking.item.title}</b><span className="mute" style={{ fontSize: '13px' }}>{c.byUser.name} ({c.byUser.id === c.booking.renterId ? 'renter' : 'owner'}) · {fmtTime(c.createdAt)}</span></div>
          <p style={{ color: '#474C52' }}>{c.text}</p>
          {c.photos.length > 0 && <div className="k-thumbs">{c.photos.map((p) => <a key={p} href={p} target="_blank" rel="noreferrer"><img src={p} alt="" className="k-photo" /></a>)}</div>}
          {c.status === 'OPEN' ? (
            <form action={resolveComplaintAction} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <input type="hidden" name="id" value={c.id} /><input type="hidden" name="back" value={back} />
              <input name="note" className="k-in" placeholder="Note to the user (what you did)" style={{ flex: '1 1 260px', minHeight: '40px' }} maxLength={500} />
              <button className="k-btn g sm" type="submit">Mark resolved</button>
            </form>
          ) : <p className="k-alert ok">Resolved{c.adminNote ? `: ${c.adminNote}` : ''}</p>}
        </section>
      ))}
      {messages.map((m) => (
        <section key={m.id} style={{ padding: '20px', borderRadius: '22px', background: '#FFFDF8', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px' }}><b>{m.name} · <a href={`mailto:${m.email}`}>{m.email}</a></b><span className="mute" style={{ fontSize: '13px' }}>{fmtTime(m.createdAt)}</span></div>
          <p style={{ color: '#474C52', whiteSpace: 'pre-wrap' }}>{m.message}</p>
          {!m.resolved ? (
            <form action={resolveContactAction} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <input type="hidden" name="id" value={m.id} /><input type="hidden" name="back" value={back} />
              <input name="note" className="k-in" placeholder="Internal note (optional)" style={{ flex: '1 1 260px', minHeight: '40px' }} maxLength={500} />
              <button className="k-btn g sm" type="submit">Mark resolved</button>
            </form>
          ) : <p className="k-alert ok">Resolved{m.adminNote ? `: ${m.adminNote}` : ''}</p>}
        </section>
      ))}
      <Pager page={page} total={total} size={ADMIN_PAGE_SIZE} href={(n) => qs({ page: n })} />
    </>
  );
}
