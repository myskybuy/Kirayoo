import Link from 'next/link';
import PageCss from '@/components/PageCss';
import Pager from '@/components/Pager';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { fmtDay, fmtTime, inr, monthYear, shortName } from '@/lib/format';
import { claimAmountFor, payoutFor } from '@/lib/bookings';
import { PLATFORM_FEE_PERCENT } from '@/lib/constants';

export const metadata = { title: 'Earnings & payouts' };
const SIZE = 20;

export default async function EarningsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser('/owner/earnings');
  const page = Math.max(1, Number(sp.page) || 1);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [pending, paidMonth, paidAll, onHold, total, rows, cash] = await Promise.all([
    prisma.payout.aggregate({ where: { ownerId: user.id, status: 'PENDING' }, _sum: { amount: true }, _count: true }),
    prisma.payout.aggregate({ where: { ownerId: user.id, status: 'PAID', paidAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.payout.aggregate({ where: { ownerId: user.id, status: 'PAID' }, _sum: { amount: true } }),
    prisma.booking.findMany({ where: { ownerId: user.id, paymentMode: { in: ['RAZORPAY', 'DEMO'] }, status: { in: ['CONFIRMED', 'PICKED_UP', 'RETURNED', 'DISPUTED', 'RETURN_CONFIRMED'] } }, include: { claim: true } }),
    prisma.payout.count({ where: { ownerId: user.id } }),
    prisma.payout.findMany({ where: { ownerId: user.id }, include: { booking: { include: { item: { select: { title: true } }, renter: { select: { name: true } }, claim: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * SIZE, take: SIZE }),
    prisma.booking.findMany({ where: { ownerId: user.id, paymentMode: 'CASH_AT_PICKUP', status: { in: ['PICKED_UP', 'RETURNED', 'DISPUTED', 'RETURN_CONFIRMED', 'DEPOSIT_REFUNDED'] } }, include: { item: { select: { title: true } }, renter: { select: { name: true } }, claim: true }, orderBy: { startDate: 'desc' }, take: 20 }),
  ]);
  const holdAmount = onHold.reduce((a, b) => a + payoutFor(b, claimAmountFor(b.claim)), 0);
  return (
    <>
      <PageCss id="O08-Earnings" />
      <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,42px)', fontWeight: '700' }}>Earnings &amp; payouts</h1>
      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(200px,100%),1fr))' }}>
        <div className="kpi" style={{ background: 'var(--kb-1f4d3a)', color: 'var(--kf-f6f1e7)' }}><span style={{ fontSize: '13px', color: 'var(--kf-dce6da)' }}>Next payout</span><b className="v">{inr(pending._sum.amount ?? 0)}</b><span style={{ fontSize: '12.5px', color: 'var(--kf-bfd1bd)' }}>{pending._count} rental{pending._count === 1 ? '' : 's'} settled, waiting for transfer</span></div>
        <div className="kpi"><span className="mute" style={{ fontSize: '13px' }}>On hold</span><b className="v" style={{ color: 'var(--kf-7a4708)' }}>{inr(holdAmount)}</b><span className="mute" style={{ fontSize: '12.5px' }}>{onHold.length} online rental{onHold.length === 1 ? '' : 's'} not settled yet</span></div>
        <div className="kpi"><span className="mute" style={{ fontSize: '13px' }}>Paid in {monthYear(new Date()).split(' ')[0]}</span><b className="v">{inr(paidMonth._sum.amount ?? 0)}</b><span className="mute" style={{ fontSize: '12.5px' }}>{PLATFORM_FEE_PERCENT ? `after ${PLATFORM_FEE_PERCENT}% Kirayo fee` : 'no Kirayo fee'}</span></div>
        <div className="kpi"><span className="mute" style={{ fontSize: '13px' }}>Since you joined</span><b className="v">{inr(paidAll._sum.amount ?? 0)}</b><span className="mute" style={{ fontSize: '12.5px' }}>{monthYear(user.createdAt)} – today</span></div>
      </div>
      <section style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', padding: '20px 22px', borderRadius: '24px', background: 'var(--kb-fffdf8)', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)' }}>
        <span style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--kb-dce6da)', color: 'var(--kf-1f4d3a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg className="ic" viewBox="0 0 24 24"><path d="M3 10 12 4l9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"></path></svg></span>
        <div style={{ flex: '1 1 260px' }}><b>How payouts work</b><p className="mute" style={{ fontSize: '13.5px' }}>For online bookings Kirayo pays you rent{PLATFORM_FEE_PERCENT ? ` minus a ${PLATFORM_FEE_PERCENT}% fee` : ''} plus any approved claim, once the deposit is settled. The transfer reference appears here. Cash bookings you collect yourself.</p></div>
      </section>
      <h2 className="d" style={{ fontSize: '22px', fontWeight: '700' }}>Transactions</h2>
      <div className="tw"><table>
        <thead><tr><th>Booking</th><th>Item · renter</th><th>Settled</th><th className="r">Rent</th><th className="r">Kirayo fee</th><th className="r">Claim</th><th className="r">You get</th><th>Status</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={8} className="mute">No payouts yet. They appear when an online rental’s deposit is settled.</td></tr>}
          {rows.map((p) => {
            const b = p.booking;
            const cancelled = b.status === 'CANCELLED';
            const rent = cancelled ? b.ownerKeepAmount : b.rentAmount;
            return (
              <tr key={p.id}>
                <td><Link className="mute" href={`/owner/bookings/${b.id}`}>{b.code}</Link></td>
                <td><b>{b.item.title}</b><br /><span className="mute" style={{ fontSize: '12.5px' }}>{shortName(b.renter.name)}{cancelled ? ' · cancelled, 1 day kept' : ''}</span></td>
                <td>{fmtDay(p.createdAt)}</td>
                <td className="r">{inr(rent)}</td>
                <td className="r mute">− {inr(cancelled ? rent - p.amount : b.platformFee)}</td>
                <td className="r">{!cancelled && claimAmountFor(b.claim) ? `+ ${inr(claimAmountFor(b.claim))}` : '—'}</td>
                <td className="r"><b>{inr(p.amount)}</b></td>
                <td>{p.status === 'PAID' ? <span className="badge" style={{ background: 'var(--kb-dceedf)', color: 'var(--kf-1e5a37)' }}>Paid {p.paidAt ? fmtTime(p.paidAt) : ''} · {p.reference}</span> : <span className="badge" style={{ background: 'var(--kb-fbebcf)', color: 'var(--kf-7a4708)' }}>Scheduled</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
      <Pager page={page} total={total} size={SIZE} href={(n) => `/owner/earnings?page=${n}`} />
      {cash.length > 0 && (
        <>
          <h2 className="d" style={{ fontSize: '22px', fontWeight: '700' }}>Cash / UPI collected by you</h2>
          <div className="tw"><table>
            <thead><tr><th>Booking</th><th>Item · renter</th><th>Picked up</th><th className="r">Rent collected</th><th className="r">Deposit collected</th><th className="r">Deposit kept (claim)</th></tr></thead>
            <tbody>
              {cash.map((b) => <tr key={b.id}><td><Link className="mute" href={`/owner/bookings/${b.id}`}>{b.code}</Link></td><td><b>{b.item.title}</b><br /><span className="mute" style={{ fontSize: '12.5px' }}>{shortName(b.renter.name)}</span></td><td>{fmtDay(b.startDate)}</td><td className="r">{inr(b.rentAmount + b.deliveryFee)}</td><td className="r">{inr(b.deposit)}</td><td className="r">{claimAmountFor(b.claim) ? inr(claimAmountFor(b.claim)) : '—'}</td></tr>)}
            </tbody>
          </table></div>
          <p className="mute" style={{ fontSize: '13px' }}>Kirayo records cash bookings but doesn’t move this money; no payout is created for them.</p>
        </>
      )}
    </>
  );
}
