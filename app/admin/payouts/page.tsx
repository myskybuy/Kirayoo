import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import PageCss from '@/components/PageCss';
import Pager from '@/components/Pager';
import AdminSearch from '@/components/AdminSearch';
import { prisma } from '@/lib/db';
import { ADMIN_PAGE_SIZE } from '@/lib/constants';
import { fmtTime, inr } from '@/lib/format';
import { claimAmountFor } from '@/lib/bookings';
import { markPayoutPaidAction } from '@/app/actions/admin';

export const metadata = { title: 'Payouts' };

export default async function PayoutsPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; page?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const tab = sp.tab === 'paid' ? 'paid' : 'pending';
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const search: Prisma.PayoutWhereInput = q ? { OR: [{ owner: { name: { contains: q, mode: 'insensitive' } } }, { owner: { email: { contains: q, mode: 'insensitive' } } }, { booking: { code: { contains: q, mode: 'insensitive' } } }, { reference: { contains: q, mode: 'insensitive' } }] } : {};
  const where: Prisma.PayoutWhereInput = { status: tab === 'paid' ? 'PAID' : 'PENDING', ...search };
  const [pendingAgg, paidAgg, total, rows] = await Promise.all([
    prisma.payout.aggregate({ where: { status: 'PENDING', ...search }, _sum: { amount: true }, _count: true }),
    prisma.payout.aggregate({ where: { status: 'PAID', ...search }, _sum: { amount: true }, _count: true }),
    prisma.payout.count({ where }),
    prisma.payout.findMany({ where, include: { owner: true, booking: { include: { claim: true, item: { select: { title: true } } } } }, orderBy: { createdAt: tab === 'paid' ? 'desc' : 'asc' }, skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE }),
  ]);
  const qs = (p: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ tab, q: q || undefined, page: page > 1 ? page : undefined, ...p })) if (v !== undefined && v !== '') u.set(k, String(v));
    return `/admin/payouts?${u}`;
  };
  return (
    <>
      <PageCss id="A07-Payouts" />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px' }}>
        <div><p className="mute" style={{ fontSize: '14px' }}>Online bookings only · created when the deposit is settled</p><h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,40px)', fontWeight: '700' }}>Payouts</h1></div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: 'var(--kb-fbebcf)', color: 'var(--kf-7a4708)', padding: '8px 14px' }}>To pay: {inr(pendingAgg._sum.amount ?? 0)} · {pendingAgg._count}</span>
          <span className="badge" style={{ background: 'var(--kb-dceedf)', color: 'var(--kf-1e5a37)', padding: '8px 14px' }}>Paid: {inr(paidAgg._sum.amount ?? 0)} · {paidAgg._count}</span>
        </div>
      </div>
      {sp.ok && <p className="k-alert ok">{sp.ok}</p>}
      {sp.error && <p className="k-alert err">{sp.error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <Link href="/admin/payouts?tab=pending" className="k-btn sm" style={tab === 'pending' ? { background: 'var(--kb-23262a)', color: 'var(--kf-ffffff)' } : { background: 'var(--kb-fffdf8)', color: 'var(--kf-23262a)', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)' }}>To pay · {pendingAgg._count}</Link>
        <Link href="/admin/payouts?tab=paid" className="k-btn sm" style={tab === 'paid' ? { background: 'var(--kb-23262a)', color: 'var(--kf-ffffff)' } : { background: 'var(--kb-fffdf8)', color: 'var(--kf-23262a)', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)' }}>Paid · {paidAgg._count}</Link>
        <AdminSearch action="/admin/payouts" q={q} hidden={{ tab }} placeholder="Owner, booking code, reference" />
      </div>
      <div className="tw"><table>
        <thead><tr><th>Owner</th><th>Booking</th><th className="r">Rent</th><th className="r">Fee</th><th className="r">Claim / kept</th><th className="r">Payout</th><th>{tab === 'paid' ? 'Paid' : 'Mark paid'}</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={7} className="mute">{tab === 'pending' ? 'Nothing to pay right now.' : 'No payouts paid yet.'}</td></tr>}
          {rows.map((p) => {
            const b = p.booking;
            const cancelled = b.status === 'CANCELLED';
            return (
              <tr key={p.id}>
                <td><b>{p.owner.name}</b><br /><span className="mute" style={{ fontSize: '12.5px' }}>{p.owner.email}{p.owner.phone ? ` · ${p.owner.phone}` : ''}</span></td>
                <td><Link href={`/admin/bookings?q=${b.code}`}>{b.code}</Link><br /><span className="mute" style={{ fontSize: '12.5px' }}>{b.item.title}{cancelled ? ' · cancelled (1 day kept)' : ''}</span></td>
                <td className="r">{inr(cancelled ? b.ownerKeepAmount : b.rentAmount)}</td>
                <td className="r">{b.platformFee || cancelled ? `−${inr(cancelled ? b.ownerKeepAmount - p.amount : b.platformFee)}` : '₹0'}</td>
                <td className="r">{cancelled ? '—' : claimAmountFor(b.claim) ? `+${inr(claimAmountFor(b.claim))}` : '—'}</td>
                <td className="r"><b>{inr(p.amount)}</b></td>
                <td>
                  {p.status === 'PAID' ? (
                    <span className="badge" style={{ background: 'var(--kb-dceedf)', color: 'var(--kf-1e5a37)' }}>Paid {p.paidAt ? fmtTime(p.paidAt) : ''} · {p.reference}</span>
                  ) : (
                    <form action={markPayoutPaidAction} style={{ display: 'flex', gap: '6px' }}>
                      <input type="hidden" name="id" value={p.id} /><input type="hidden" name="back" value={qs({})} />
                      <input name="reference" className="k-in" required minLength={4} placeholder="UTR / UPI ref" style={{ minHeight: '38px', width: '150px' }} aria-label={`Reference for ${p.owner.name}`} />
                      <button className="k-btn g sm" type="submit">Mark paid</button>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
      <Pager page={page} total={total} size={ADMIN_PAGE_SIZE} href={(n) => qs({ page: n })} />
      <p className="mute" style={{ fontSize: '13px' }}>Transfer the money from Kirayo’s bank account, then record the UTR / UPI reference here. The owner gets an email.</p>
    </>
  );
}
