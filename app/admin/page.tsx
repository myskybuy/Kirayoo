import Link from 'next/link';
import PageCss from '@/components/PageCss';
import { prisma } from '@/lib/db';
import { adminCounts } from '@/lib/admin';
import { fmtDay, fmtTime, inr, shortName, todayIST, toDbDate } from '@/lib/format';
import { lateDays } from '@/lib/bookings';
import { runDueJobs } from '@/lib/jobs';

export const metadata = { title: 'Admin dashboard' };

function oldest(d: Date | null | undefined) {
  if (!d) return '';
  const h = Math.round((Date.now() - d.getTime()) / 3600000);
  return h < 1 ? 'Oldest waiting < 1 h' : h < 48 ? `Oldest waiting ${h} h` : `Oldest waiting ${Math.round(h / 24)} d`;
}

export default async function AdminDashboard() {
  await runDueJobs();
  const today = toDbDate(todayIST());
  const c = await adminCounts();
  const [oldId, oldItem, payoutSum, late, active, pickups, returns, deposits, blocked, contacts] = await Promise.all([
    prisma.user.findFirst({ where: { idStatus: 'PENDING' }, orderBy: { idSubmittedAt: 'asc' }, select: { idSubmittedAt: true } }),
    prisma.item.findFirst({ where: { status: 'PENDING_REVIEW', deletedAt: null }, orderBy: { updatedAt: 'asc' }, select: { updatedAt: true } }),
    prisma.payout.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } }),
    prisma.booking.findMany({ where: { status: 'PICKED_UP', endDate: { lt: today } }, include: { item: { select: { title: true } }, renter: { select: { name: true } }, owner: { select: { name: true } } }, orderBy: { endDate: 'asc' }, take: 20 }),
    prisma.booking.count({ where: { status: 'PICKED_UP' } }),
    prisma.booking.count({ where: { status: 'CONFIRMED', startDate: today } }),
    prisma.booking.count({ where: { status: 'PICKED_UP', endDate: today } }),
    prisma.booking.aggregate({ where: { status: { in: ['CONFIRMED', 'PICKED_UP', 'RETURNED', 'DISPUTED', 'RETURN_CONFIRMED'] }, paymentMode: { in: ['RAZORPAY', 'DEMO'] } }, _sum: { deposit: true } }),
    prisma.user.count({ where: { isBlocked: true } }),
    prisma.contactMessage.count({ where: { resolved: false } }),
  ]);
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const monthStart = toDbDate(todayIST().slice(0, 8) + '01');
  const online = { paymentMode: { in: ['RAZORPAY', 'DEMO'] as ('RAZORPAY' | 'DEMO')[] }, paidAt: { not: null }, status: { not: 'CANCELLED' as const } };
  const [users, newUsers, liveItems, owners, bookings, bookingsMonth, revenue] = await Promise.all([
    prisma.user.count({ where: { isAdmin: false } }),
    prisma.user.count({ where: { isAdmin: false, createdAt: { gte: weekAgo } } }),
    prisma.item.count({ where: { status: 'ACTIVE', deletedAt: null } }),
    prisma.user.count({ where: { ownerStatus: 'APPROVED' } }),
    prisma.booking.count({ where: { confirmedAt: { not: null } } }),
    prisma.booking.count({ where: { confirmedAt: { gte: monthStart } } }),
    prisma.booking.aggregate({ where: online, _sum: { rentAmount: true, extensionAmount: true, deliveryFee: true, platformFee: true } }),
  ]);
  const gmv = (revenue._sum.rentAmount ?? 0) + (revenue._sum.extensionAmount ?? 0) + (revenue._sum.deliveryFee ?? 0);
  const kpis: [string, string, string, string][] = [
    ['Users', users.toLocaleString('en-IN'), `+${newUsers} this week`, '/admin/users'],
    ['Active listings', liveItems.toLocaleString('en-IN'), `${owners} approved owners`, '/admin/listings?tab=live'],
    ['Bookings', bookings.toLocaleString('en-IN'), `${bookingsMonth} confirmed this month`, '/admin/bookings'],
    ['Revenue (online)', inr(gmv), `Kirayo fees ${inr(revenue._sum.platformFee ?? 0)}`, '/admin/payouts'],
    ['Open disputes', String(c.disputes), c.disputes ? 'Decide the amount' : 'None open', '/admin/disputes'],
  ];
  return (
    <>
      <PageCss id="A01-Dashboard" />
      <div><p className="mute" style={{ fontSize: '14px' }}>{fmtTime(new Date())}</p><h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,40px)', fontWeight: '700' }}>Dashboard</h1></div>
      <section aria-label="Key numbers" style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(170px,100%),1fr))' }}>
        {kpis.map(([label, value, sub, href], i) => (
          <Link key={label} href={href} style={{ padding: '18px 20px', borderRadius: '22px', background: i === 0 ? 'var(--kb-23262a)' : 'var(--kb-fffdf8)', color: i === 0 ? 'var(--kf-f6f1e7)' : 'var(--kf-23262a)', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 1px 2px rgba(35,38,42,.06)' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.06em', textTransform: 'uppercase', opacity: 0.75 }}>{label}</span>
            <b className="d" style={{ fontSize: '30px', lineHeight: 1.1, color: label === 'Open disputes' && c.disputes ? 'var(--kf-b3372b)' : undefined }}>{value}</b>
            <span style={{ fontSize: '12.5px', opacity: 0.8 }}>{sub}</span>
          </Link>
        ))}
      </section>
      <h2 className="d" style={{ fontSize: '22px', fontWeight: '700' }}>Today&apos;s queue</h2>
      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(200px,100%),1fr))' }}>
        <Link className="q" href="/admin/owners"><span className="mute" style={{ fontSize: '13px', fontWeight: '600' }}>Owner approvals</span><b className="v" style={{ color: c.owners ? 'var(--kf-c9491f)' : 'var(--kf-23262a)' }}>{c.owners}</b><span className="mute" style={{ fontSize: '12.5px' }}>{c.owners ? 'Applications waiting' : 'All caught up'}</span></Link>
        <Link className="q" href="/admin/ids"><span className="mute" style={{ fontSize: '13px', fontWeight: '600' }}>ID verifications</span><b className="v" style={{ color: c.ids ? 'var(--kf-c9491f)' : 'var(--kf-23262a)' }}>{c.ids}</b><span style={{ fontSize: '12.5px', color: 'var(--kf-7a4708)', fontWeight: '700' }}>{oldest(oldId?.idSubmittedAt) || 'All caught up'}</span></Link>
        <Link className="q" href="/admin/listings"><span className="mute" style={{ fontSize: '13px', fontWeight: '600' }}>Listing approvals</span><b className="v" style={{ color: c.listings ? 'var(--kf-c9491f)' : 'var(--kf-23262a)' }}>{c.listings}</b><span className="mute" style={{ fontSize: '12.5px' }}>{oldest(oldItem?.updatedAt) || 'All caught up'}</span></Link>
        <Link className="q" href="/admin/disputes"><span className="mute" style={{ fontSize: '13px', fontWeight: '600' }}>Deposit disputes</span><b className="v" style={{ color: c.disputes ? 'var(--kf-b3372b)' : 'var(--kf-23262a)' }}>{c.disputes}</b><span style={{ fontSize: '12.5px', color: 'var(--kf-8e2a20)', fontWeight: '700' }}>{c.disputes ? 'Decide the amount' : 'None open'}</span></Link>
        <Link className="q" href="/admin/payouts"><span className="mute" style={{ fontSize: '13px', fontWeight: '600' }}>Payouts to pay</span><b className="v">{inr(payoutSum._sum.amount ?? 0)}</b><span className="mute" style={{ fontSize: '12.5px' }}>{c.payouts} payout{c.payouts === 1 ? '' : 's'}</span></Link>
        <Link className="q" href="/admin/refunds"><span className="mute" style={{ fontSize: '13px', fontWeight: '600' }}>Refunds pending</span><b className="v" style={{ color: c.refunds ? 'var(--kf-b3372b)' : 'var(--kf-23262a)' }}>{c.refunds}</b><span className="mute" style={{ fontSize: '12.5px' }}>{c.refunds ? 'Retry failed refunds' : 'All refunded'}</span></Link>
        <Link className="q" href="/admin/complaints"><span className="mute" style={{ fontSize: '13px', fontWeight: '600' }}>Complaints &amp; contact</span><b className="v" style={{ color: c.complaints ? 'var(--kf-c9491f)' : 'var(--kf-23262a)' }}>{c.complaints}</b><span className="mute" style={{ fontSize: '12.5px' }}>{contacts} contact message{contacts === 1 ? '' : 's'}</span></Link>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
        <section style={{ flex: '999 1 440px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><h2 className="d" style={{ fontSize: '22px', fontWeight: '700' }}>Late returns</h2><Link href="/admin/bookings?tab=late" style={{ fontSize: '13px', fontWeight: '700' }}>All bookings</Link></div>
          <div className="tw"><table>
            <thead><tr><th>Booking</th><th>Item</th><th>Renter → Owner</th><th>Was due</th><th>Late</th></tr></thead>
            <tbody>
              {late.length === 0 && <tr><td colSpan={5} className="mute">No late returns.</td></tr>}
              {late.map((b) => {
                const n = lateDays(b);
                return <tr key={b.id}><td><Link href={`/admin/bookings?id=${b.id}`} className="mute">{b.code}</Link></td><td><b>{b.item.title}</b></td><td>{shortName(b.renter.name)} → {shortName(b.owner.name)}</td><td>{fmtDay(b.endDate)}</td><td><span className="badge" style={n > 1 ? { background: 'var(--kb-fbe3d8)', color: 'var(--kf-9a3412)' } : { background: 'var(--kb-fbebcf)', color: 'var(--kf-7a4708)' }}>{n} day{n > 1 ? 's' : ''}</span></td></tr>;
              })}
            </tbody>
          </table></div>
        </section>
        <section style={{ flex: '1 1 300px', minWidth: '0', padding: '22px', borderRadius: '22px', background: 'var(--kb-fffdf8)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 className="d" style={{ fontSize: '20px', fontWeight: '700' }}>Right now</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="mute">Active rentals</span><b>{active}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="mute">Pickups today</span><b>{pickups}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="mute">Returns due today</span><b>{returns}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="mute">Deposits held (online)</span><b>{inr(deposits._sum.deposit ?? 0)}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="mute">Blocked users</span><b>{blocked}</b></div>
        </section>
      </div>
    </>
  );
}
