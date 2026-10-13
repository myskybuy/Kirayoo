import Link from 'next/link';
import type { BookingStatus, Prisma } from '@prisma/client';
import PageCss from '@/components/PageCss';
import Pager from '@/components/Pager';
import AdminSearch from '@/components/AdminSearch';
import ConfirmButton from '@/components/ConfirmButton';
import { prisma } from '@/lib/db';
import { ADMIN_PAGE_SIZE } from '@/lib/constants';
import { fmtRange, fmtTime, inr, shortName, todayIST, toDbDate } from '@/lib/format';
import { cancellationTerms, claimAmountFor, isOverdue, STATUS_LABEL } from '@/lib/bookings';
import { adminCancelBookingAction } from '@/app/actions/admin';

export const metadata = { title: 'Bookings · admin' };

const TABS: { key: string; label: string; where: Prisma.BookingWhereInput }[] = [
  { key: 'all', label: 'All', where: {} },
  { key: 'pending', label: 'Awaiting payment', where: { status: 'PENDING_PAYMENT' } },
  { key: 'booked', label: 'Booked', where: { status: 'CONFIRMED' } },
  { key: 'inuse', label: 'In use', where: { status: 'PICKED_UP' } },
  { key: 'late', label: 'Late', where: { status: 'PICKED_UP', endDate: { lt: toDbDate(todayIST()) } } },
  { key: 'returned', label: 'Returned', where: { status: { in: ['RETURNED', 'DISPUTED', 'RETURN_CONFIRMED'] } } },
  { key: 'done', label: 'Refunded', where: { status: 'DEPOSIT_REFUNDED' } },
  { key: 'cancelled', label: 'Cancelled', where: { status: 'CANCELLED' } },
];
const BADGE: Record<BookingStatus | 'LATE', [string, string]> = {
  PENDING_PAYMENT: ['#EDE5D5', '#474C52'], CONFIRMED: ['#1F4D3A', '#fff'], PICKED_UP: ['#DCE6DA', '#1F4D3A'], LATE: ['#FBE3D8', '#9A3412'], RETURNED: ['#FBEBCF', '#7A4708'],
  DISPUTED: ['#F7DCD7', '#8E2A20'], RETURN_CONFIRMED: ['#DCEEDF', '#1E5A37'], DEPOSIT_REFUNDED: ['#DCEEDF', '#1E5A37'], CANCELLED: ['#EDE5D5', '#474C52'],
};

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; page?: string; id?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const search: Prisma.BookingWhereInput = q ? { OR: [{ code: { contains: q, mode: 'insensitive' } }, { renter: { name: { contains: q, mode: 'insensitive' } } }, { owner: { name: { contains: q, mode: 'insensitive' } } }, { item: { title: { contains: q, mode: 'insensitive' } } }] } : {};
  const where: Prisma.BookingWhereInput = { AND: [tab.where, search] };
  const [counts, total, rows] = await Promise.all([
    Promise.all(TABS.map((t) => prisma.booking.count({ where: { AND: [t.where, search] } }))),
    prisma.booking.count({ where }),
    prisma.booking.findMany({ where, include: { item: { select: { title: true } }, renter: { select: { name: true } }, owner: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE }),
  ]);
  const selId = sp.id ?? (q && rows.length === 1 ? rows[0].id : undefined);
  const sel = selId
    ? await prisma.booking.findUnique({ where: { id: selId }, include: { item: true, renter: true, owner: true, claim: true, refunds: true, payout: true, extensions: true, complaints: true, conversation: { include: { messages: { where: { type: 'SYSTEM' }, orderBy: { createdAt: 'asc' } } } } } })
    : null;
  const qs = (p: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ tab: tab.key, q: q || undefined, page: page > 1 ? page : undefined, ...p })) if (v !== undefined && v !== '') u.set(k, String(v));
    return `/admin/bookings?${u}`;
  };

  return (
    <>
      <PageCss id="A05-Bookings" />
      <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,40px)', fontWeight: '700' }}>Bookings</h1>
      {sp.ok && <p className="k-alert ok">{sp.ok}</p>}
      {sp.error && <p className="k-alert err">{sp.error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <div role="tablist" aria-label="Status" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          {TABS.map((t, i) => <Link key={t.key} className="chip" role="tab" aria-selected={t.key === tab.key} href={`/admin/bookings?tab=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`} style={t.key === tab.key ? { background: '#23262A', color: '#fff', boxShadow: 'none', textDecoration: 'none' } : { background: '#FFFDF8', color: '#23262A', boxShadow: 'inset 0 0 0 1px #E3DACA', textDecoration: 'none' }}>{t.label} · {counts[i]}</Link>)}
        </div>
        <AdminSearch action="/admin/bookings" q={q} hidden={{ tab: tab.key }} placeholder="Code (KR-…), name or item" />
      </div>
      {sel && (
        <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#FFFDF8', borderRadius: '24px' }} aria-label="Booking details">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '10px', alignItems: 'baseline' }}>
            <div><b className="d" style={{ fontSize: '22px' }}>{sel.code} · {sel.item.title}</b><p className="mute" style={{ fontSize: '13.5px' }}>{sel.renter.name} ({sel.renter.email}) → {sel.owner.name} ({sel.owner.email}) · {fmtRange(sel.startDate, sel.endDate)} · {sel.days} days · {sel.mode === 'DELIVERY' ? `delivery to ${sel.address}` : 'pickup'}</p></div>
            <Link href={qs({ id: undefined })} style={{ fontWeight: 700, fontSize: '13px' }}>Close ✕</Link>
          </div>
          <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', fontSize: '14px' }}>
            <div><span className="mute">Status</span><br /><b>{isOverdue(sel) ? 'Late (picked up, overdue)' : STATUS_LABEL[sel.status]}</b></div>
            <div><span className="mute">Payment</span><br /><b>{sel.paymentMode ?? 'not paid'}{sel.paymentId ? ` · ${sel.paymentId}` : ''}</b></div>
            <div><span className="mute">Paid / total</span><br /><b>{inr(sel.amountPaid)} / {inr(sel.total)}</b></div>
            <div><span className="mute">Rent · deposit · delivery · fee</span><br /><b>{inr(sel.rentAmount)} · {inr(sel.deposit)} · {inr(sel.deliveryFee)} · {inr(sel.platformFee)}</b></div>
            {sel.claim && <div><span className="mute">Claim</span><br /><b>{inr(sel.claim.amount)} · {sel.claim.status}{sel.claim.status === 'RESOLVED' ? ` → ${inr(claimAmountFor(sel.claim))}` : ''}</b></div>}
            {sel.payout && <div><span className="mute">Payout</span><br /><b>{inr(sel.payout.amount)} · {sel.payout.status}</b></div>}
          </div>
          {sel.refunds.length > 0 && <div style={{ fontSize: '14px' }}><span className="mute">Refunds: </span>{sel.refunds.map((r) => `${r.kind.toLowerCase()} ${inr(r.amount)} ${r.status.toLowerCase()}${r.refundId ? ` (${r.refundId})` : ''}`).join(' · ')}</div>}
          <b style={{ marginTop: '6px' }}>Timeline</b>
          <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: '#474C52', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li><b>{fmtTime(sel.createdAt)}</b> — dates accepted, hold created</li>
            {(sel.conversation?.messages ?? []).filter((m) => m.bookingId === sel.id || !m.bookingId).filter((m) => m.createdAt >= sel.createdAt).map((m) => <li key={m.id}><b>{fmtTime(m.createdAt)}</b> — {m.text}</li>)}
          </ol>
          {(sel.status === 'PENDING_PAYMENT' || sel.status === 'CONFIRMED') && (
            <form action={adminCancelBookingAction} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', padding: '14px', borderRadius: '16px', background: '#F7DCD7' }}>
              <input type="hidden" name="bookingId" value={sel.id} /><input type="hidden" name="back" value={qs({ id: sel.id })} />
              <b style={{ color: '#8E2A20' }}>Cancel as admin:</b>
              <input name="reason" className="k-in" required minLength={3} placeholder="Reason (shown to both)" style={{ flex: '1 1 220px', minHeight: '40px' }} />
              <span className="mute" style={{ fontSize: '12.5px' }}>{cancellationTerms(sel, 'ADMIN').text}</span>
              <ConfirmButton message={`Cancel ${sel.code}? Any online payment is refunded in full.`} className="k-btn r sm">Cancel booking</ConfirmButton>
            </form>
          )}
        </section>
      )}
      <div className="tw"><table>
        <thead><tr><th>ID</th><th>Item</th><th>Renter</th><th>Owner</th><th>Dates</th><th className="r">Paid</th><th className="r">Deposit</th><th>Status</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={8} className="mute">{q ? `Nothing matches “${q}”.` : 'No bookings here.'}</td></tr>}
          {rows.map((b) => {
            const late = isOverdue(b);
            const [bg, fg] = BADGE[late ? 'LATE' : b.status];
            return (
              <tr key={b.id} style={sel?.id === b.id ? { background: '#EEF3EC' } : undefined}>
                <td><Link href={qs({ id: b.id })} className="mute">{b.code}</Link></td>
                <td><b>{b.item.title}</b></td>
                <td>{shortName(b.renter.name)}</td>
                <td>{shortName(b.owner.name)}</td>
                <td>{fmtRange(b.startDate, b.endDate)}</td>
                <td className="r">{b.paymentMode === 'CASH_AT_PICKUP' ? 'cash' : b.amountPaid ? inr(b.amountPaid) : '₹—'}</td>
                <td className="r">{inr(b.deposit)}</td>
                <td><span className="badge" style={{ background: bg, color: fg }}>{late ? 'Late' : STATUS_LABEL[b.status]}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
      <Pager page={page} total={total} size={ADMIN_PAGE_SIZE} href={(n) => qs({ page: n })} />
    </>
  );
}
