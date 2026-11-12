import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import PageCss from '@/components/PageCss';
import Pager from '@/components/Pager';
import AdminSearch from '@/components/AdminSearch';
import ConditionPairs from '@/components/ConditionPairs';
import DecideForm from '@/components/DecideForm';
import { prisma } from '@/lib/db';
import { ADMIN_PAGE_SIZE } from '@/lib/constants';
import { fmtRange, fmtTime, inr, shortName } from '@/lib/format';
import { lateDays } from '@/lib/bookings';

export const metadata = { title: 'Deposit disputes' };

export default async function DisputesPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; page?: string; id?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const tab = sp.tab === 'decided' ? 'decided' : 'open';
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const search: Prisma.DamageClaimWhereInput = q ? { booking: { OR: [{ code: { contains: q, mode: 'insensitive' } }, { renter: { name: { contains: q, mode: 'insensitive' } } }, { owner: { name: { contains: q, mode: 'insensitive' } } }] } } : {};
  const where: Prisma.DamageClaimWhereInput = { status: tab === 'open' ? 'DISPUTED' : 'RESOLVED', ...search };
  const [openN, decidedN, total, claims] = await Promise.all([
    prisma.damageClaim.count({ where: { status: 'DISPUTED', ...search } }),
    prisma.damageClaim.count({ where: { status: 'RESOLVED', ...search } }),
    prisma.damageClaim.count({ where }),
    prisma.damageClaim.findMany({ where, include: { booking: { include: { item: true, renter: true, owner: true, conditionReports: true } } }, orderBy: { createdAt: tab === 'open' ? 'asc' : 'desc' }, skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE }),
  ]);
  const sel = claims.find((c) => c.bookingId === sp.id) ?? claims[0];
  const qs = (p: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ tab, q: q || undefined, page: page > 1 ? page : undefined, ...p })) if (v !== undefined && v !== '') u.set(k, String(v));
    return `/admin/disputes?${u}`;
  };
  const b = sel?.booking;
  return (
    <>
      <PageCss id="A06-Disputes" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,40px)', fontWeight: '700' }}>Deposit disputes</h1>
      </div>
      {sp.ok && <p className="k-alert ok">{sp.ok}</p>}
      {sp.error && <p className="k-alert err">{sp.error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <Link className="badge" href={`/admin/disputes?tab=open`} style={tab === 'open' ? { background: 'var(--kb-23262a)', color: 'var(--kf-ffffff)', padding: '8px 14px', textDecoration: 'none' } : { background: 'var(--kb-fffdf8)', color: 'var(--kf-474c52)', padding: '8px 14px', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)', textDecoration: 'none' }}>Open · {openN}</Link>
        <Link className="badge" href={`/admin/disputes?tab=decided`} style={tab === 'decided' ? { background: 'var(--kb-23262a)', color: 'var(--kf-ffffff)', padding: '8px 14px', textDecoration: 'none' } : { background: 'var(--kb-fffdf8)', color: 'var(--kf-474c52)', padding: '8px 14px', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)', textDecoration: 'none' }}>Decided · {decidedN}</Link>
        <AdminSearch action="/admin/disputes" q={q} hidden={{ tab }} placeholder="Booking code or name" />
      </div>
      {claims.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {claims.map((c) => <Link key={c.id} className="badge" href={qs({ id: c.bookingId })} style={c.id === sel?.id ? { background: 'var(--kb-23262a)', color: 'var(--kf-ffffff)', padding: '8px 14px', textDecoration: 'none' } : { background: 'var(--kb-fffdf8)', color: 'var(--kf-474c52)', padding: '8px 14px', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)', textDecoration: 'none' }}>{c.booking.code} · {c.booking.item.title.slice(0, 24)}</Link>)}
        </div>
      )}
      {!sel || !b ? (
        <p className="k-alert info">{tab === 'open' ? 'No open disputes.' : 'No decided disputes yet.'}</p>
      ) : (
        <>
          <section className="card" style={{ padding: '22px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '72px', height: '56px', borderRadius: '14px', background: 'var(--kb-f1e3d3)', overflow: 'hidden' }}>{b.item.photos[0] && <img src={b.item.photos[0]} alt="" className="k-photo" />}</div>
            <div style={{ flex: '1 1 300px' }}><b style={{ fontSize: '17px' }}>{b.item.title} · {b.code}</b><p className="mute" style={{ fontSize: '13.5px' }}>{shortName(b.renter.name)} (renter) ↔ {shortName(b.owner.name)} (owner) · {fmtRange(b.startDate, b.endDate)} · {lateDays(b, b.returnedAt ?? new Date()) ? `${lateDays(b, b.returnedAt ?? new Date())} day(s) late` : 'returned on time'} · deposit {inr(b.deposit)} · {b.paymentMode === 'CASH_AT_PICKUP' ? 'cash booking' : 'paid online'}</p></div>
            <span className="badge" style={{ background: 'var(--kb-fbebcf)', color: 'var(--kf-7a4708)' }}>{inr(sel.amount)} claimed{sel.status === 'RESOLVED' ? ` · decided ${inr(sel.adminDecisionAmount ?? 0)}` : ''}</span>
            <Link href={`/admin/bookings?q=${b.code}`} style={{ fontSize: '13px', fontWeight: 700 }}>Booking timeline</Link>
          </section>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))' }}>
            <section className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--kb-fbf0ec)' }}>
              <span className="badge" style={{ alignSelf: 'flex-start', background: 'var(--kb-f7dcd7)', color: 'var(--kf-8e2a20)' }}>Owner claim · {inr(sel.amount)}{sel.lateFee ? ` (incl. late fee ${inr(sel.lateFee)})` : ''}</span>
              <p style={{ fontSize: '14.5px' }}>“{sel.reason}”</p>
              {sel.photos.length > 0 && <div className="k-thumbs">{sel.photos.map((p) => <a key={p} href={p} target="_blank" rel="noreferrer"><img src={p} alt="Owner evidence" className="k-photo" /></a>)}</div>}
              <span className="mute" style={{ fontSize: '12.5px' }}>{b.owner.name} · {fmtTime(sel.createdAt)} · {sel.photos.length} photo{sel.photos.length === 1 ? '' : 's'}</span>
            </section>
            <section className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--kb-eef3ec)' }}>
              <span className="badge" style={{ alignSelf: 'flex-start', background: 'var(--kb-dce6da)', color: 'var(--kf-1f4d3a)' }}>Renter response · disputes</span>
              <p style={{ fontSize: '14.5px' }}>“{sel.renterNote ?? '—'}”</p>
              <span className="mute" style={{ fontSize: '12.5px' }}>{b.renter.name}</span>
            </section>
          </div>
          <section className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <b>Evidence · pickup ↔ return (both condition reports)</b>
            <ConditionPairs reports={b.conditionReports} ownerId={b.ownerId} renterId={b.renterId} />
          </section>
          {sel.status === 'DISPUTED' ? (
            <DecideForm bookingId={b.id} claim={sel.amount} deposit={b.deposit} renterFirst={b.renter.name.split(' ')[0]} ownerFirst={b.owner.name.split(' ')[0]} back={qs({})} cash={b.paymentMode === 'CASH_AT_PICKUP'} />
          ) : (
            <p className="k-alert ok">Decided {sel.decidedAt ? fmtTime(sel.decidedAt) : ''}: {inr(sel.adminDecisionAmount ?? 0)} to the owner, {inr(b.deposit - (sel.adminDecisionAmount ?? 0))} back to the renter.{sel.adminNote ? ` Note: ${sel.adminNote}` : ''}</p>
          )}
        </>
      )}
      <Pager page={page} total={total} size={ADMIN_PAGE_SIZE} href={(p) => qs({ page: p })} />
    </>
  );
}
