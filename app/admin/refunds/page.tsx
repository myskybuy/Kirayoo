import Link from 'next/link';
import type { Prisma, RefundStatus } from '@prisma/client';
import PageCss from '@/components/PageCss';
import Pager from '@/components/Pager';
import AdminSearch from '@/components/AdminSearch';
import { prisma } from '@/lib/db';
import { ADMIN_PAGE_SIZE } from '@/lib/constants';
import { fmtTime, inr } from '@/lib/format';
import { retryRefundAction } from '@/app/actions/admin';

export const metadata = { title: 'Deposit refunds' };

const TABS: { key: string; label: string; status: RefundStatus[] }[] = [
  { key: 'attention', label: 'Pending / failed', status: ['PENDING', 'FAILED'] },
  { key: 'refunded', label: 'Refunded', status: ['REFUNDED'] },
];
const KIND = { DEPOSIT: 'Deposit', CANCELLATION: 'Cancellation', CONFLICT: 'Dates taken — full refund' };

export default async function RefundsPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; page?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const search: Prisma.DepositRefundWhereInput = q ? { OR: [{ booking: { code: { contains: q, mode: 'insensitive' } } }, { booking: { renter: { name: { contains: q, mode: 'insensitive' } } } }, { refundId: { contains: q, mode: 'insensitive' } }] } : {};
  const where: Prisma.DepositRefundWhereInput = { status: { in: tab.status }, ...search };
  const [counts, total, rows] = await Promise.all([
    Promise.all(TABS.map((t) => prisma.depositRefund.count({ where: { status: { in: t.status }, ...search } }))),
    prisma.depositRefund.count({ where }),
    prisma.depositRefund.findMany({ where, include: { booking: { include: { renter: true, item: { select: { title: true } } } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE }),
  ]);
  const qs = (p: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ tab: tab.key, q: q || undefined, page: page > 1 ? page : undefined, ...p })) if (v !== undefined && v !== '') u.set(k, String(v));
    return `/admin/refunds?${u}`;
  };
  return (
    <>
      <PageCss id="A07-Payouts" />
      <div><p className="mute" style={{ fontSize: '14px' }}>Razorpay Refunds API (test mode) or demo · cash bookings never appear here</p><h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,40px)', fontWeight: '700' }}>Deposit refunds</h1></div>
      {sp.ok && <p className="k-alert ok">{sp.ok}</p>}
      {sp.error && <p className="k-alert err">{sp.error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {TABS.map((t, i) => <Link key={t.key} href={`/admin/refunds?tab=${t.key}`} className="k-btn sm" style={t.key === tab.key ? { background: '#23262A', color: '#fff' } : { background: '#FFFDF8', color: '#23262A', boxShadow: 'inset 0 0 0 1px #E3DACA' }}>{t.label} · {counts[i]}</Link>)}
        <AdminSearch action="/admin/refunds" q={q} hidden={{ tab: tab.key }} placeholder="Booking code, renter, refund id" />
      </div>
      <div className="tw"><table>
        <thead><tr><th>Booking</th><th>Renter</th><th>Type</th><th className="r">Amount</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={6} className="mute">{tab.key === 'attention' ? 'No refunds waiting — all clear.' : 'No refunds yet.'}</td></tr>}
          {rows.map((r) => (
            <tr key={r.id}>
              <td><Link href={`/admin/bookings?q=${r.booking.code}`}>{r.booking.code}</Link><br /><span className="mute" style={{ fontSize: '12.5px' }}>{r.booking.item.title}</span></td>
              <td>{r.booking.renter.name}<br /><span className="mute" style={{ fontSize: '12.5px' }}>payment {r.booking.paymentId ?? '—'}</span></td>
              <td>{KIND[r.kind]}</td>
              <td className="r"><b>{inr(r.amount)}</b></td>
              <td>
                {r.status === 'REFUNDED' ? <span className="badge" style={{ background: '#DCEEDF', color: '#1E5A37' }}>Refunded {r.refundedAt ? fmtTime(r.refundedAt) : ''} · {r.refundId}</span>
                  : r.status === 'FAILED' ? <span className="badge" style={{ background: '#F7DCD7', color: '#8E2A20' }} title={r.error ?? ''}>Failed: {(r.error ?? '').slice(0, 60)}</span>
                  : <span className="badge" style={{ background: '#FBEBCF', color: '#7A4708' }}>Pending</span>}
              </td>
              <td>{r.status !== 'REFUNDED' && <form action={retryRefundAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="back" value={qs({})} /><button className="k-btn g sm" type="submit">Retry refund</button></form>}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <Pager page={page} total={total} size={ADMIN_PAGE_SIZE} href={(n) => qs({ page: n })} />
    </>
  );
}
