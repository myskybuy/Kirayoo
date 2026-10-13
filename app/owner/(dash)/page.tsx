import Link from 'next/link';
import PageCss from '@/components/PageCss';
import EmptyState from '@/components/EmptyState';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { fmtDay, fmtRange, fmtTime, inr, monthYear, shortName, todayIST, toDbDate, addDays } from '@/lib/format';
import { CLAIM_RESPONSE_HOURS, RETURN_CONFIRM_HOURS } from '@/lib/constants';
import { lateDays } from '@/lib/bookings';
import { runDueJobs } from '@/lib/jobs';

export const metadata = { title: 'Owner dashboard' };

type Task = { key: string; tone: 'req' | 'pick' | 'ret' | 'claim' | 'late' | 'ext'; title: string; sub: string; href: string; cta: string };
const TONE: Record<Task['tone'], [string, string, string]> = {
  req: ['#FBE3D8', '#A93C18', '<path d="M5 18.5V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9z"></path>'],
  pick: ['#DCE6DA', '#1F4D3A', '<rect x="5" y="10.5" width="14" height="10" rx="2.5"></rect><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path>'],
  ret: ['#FBEBCF', '#7A4708', '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4"></path><path d="m9 13 2.2 2.2L15.5 11"></path>'],
  claim: ['#EDE5D5', '#474C52', '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"></path>'],
  late: ['#F7DCD7', '#8E2A20', '<circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5V12l3 2"></path>'],
  ext: ['#DCE6DA', '#1F4D3A', '<rect x="3.5" y="5" width="17" height="15" rx="3"></rect><path d="M3.5 10h17M12 13v4M10 15h4"></path>'],
};

export default async function OwnerDashboard() {
  const user = await requireUser('/owner');
  await runDueJobs();
  const today = todayIST();
  const [requests, pickups, returns, claims, late, exts, items, outNow, rating, earned, upcoming] = await Promise.all([
    prisma.message.findMany({ where: { type: 'BOOKING_REQUEST', requestStatus: 'PENDING', conversation: { ownerId: user.id }, senderId: { not: user.id } }, include: { conversation: { include: { item: { select: { title: true } }, renter: { select: { name: true } } } } }, orderBy: { createdAt: 'asc' } }),
    prisma.booking.findMany({ where: { ownerId: user.id, status: 'CONFIRMED', startDate: { lte: toDbDate(today) } }, include: { item: { select: { title: true } }, renter: { select: { name: true } } } }),
    prisma.booking.findMany({ where: { ownerId: user.id, status: 'RETURNED', claim: null }, include: { item: { select: { title: true } }, renter: { select: { name: true } } } }),
    prisma.booking.findMany({ where: { ownerId: user.id, status: { in: ['RETURNED', 'DISPUTED'] }, claim: { isNot: null } }, include: { item: { select: { title: true } }, renter: { select: { name: true } }, claim: true } }),
    prisma.booking.findMany({ where: { ownerId: user.id, status: 'PICKED_UP', endDate: { lt: toDbDate(today) } }, include: { item: { select: { title: true } }, renter: { select: { name: true } } } }),
    prisma.extensionRequest.findMany({ where: { status: 'PENDING', booking: { ownerId: user.id } }, include: { booking: { include: { item: { select: { title: true } }, renter: { select: { name: true } } } } } }),
    prisma.item.count({ where: { ownerId: user.id, deletedAt: null, status: 'ACTIVE' } }),
    prisma.booking.count({ where: { ownerId: user.id, status: 'PICKED_UP' } }),
    prisma.review.aggregate({ where: { toUserId: user.id, booking: { ownerId: user.id } }, _avg: { rating: true }, _count: true }),
    prisma.payout.aggregate({ where: { ownerId: user.id, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }, _sum: { amount: true } }),
    prisma.booking.findMany({ where: { ownerId: user.id, status: 'CONFIRMED', startDate: { gt: toDbDate(today), lte: toDbDate(addDays(today, 14)) } }, include: { item: { select: { title: true } }, renter: { select: { name: true } } }, orderBy: { startDate: 'asc' }, take: 6 }),
  ]);
  const pendingPay = await prisma.payout.aggregate({ where: { ownerId: user.id, status: 'PENDING' }, _sum: { amount: true } });
  const tasks: Task[] = [
    ...requests.map((m) => ({ key: m.id, tone: 'req' as const, title: `${shortName(m.conversation.renter.name)} wants the ${m.conversation.item.title}`, sub: `${fmtRange(m.startDate!, m.endDate!)} · Accept, decline or suggest other dates`, href: '/owner/requests', cta: 'Respond' })),
    ...exts.map((e) => ({ key: e.id, tone: 'ext' as const, title: `Extension asked · ${e.booking.item.title}`, sub: `${shortName(e.booking.renter.name)} wants it until ${fmtDay(e.newEndDate)} (${inr(e.extraAmount)})`, href: `/owner/bookings/${e.bookingId}#extension`, cta: 'Answer' })),
    ...pickups.map((b) => ({ key: b.id, tone: 'pick' as const, title: `Pickup ${b.startDate.toISOString().slice(0, 10) === today ? 'today' : `was due ${fmtDay(b.startDate)}`} · ${b.item.title}`, sub: `${shortName(b.renter.name)} · ${b.mode === 'DELIVERY' ? 'delivery' : 'self pickup'} · photos + their 4-digit code${b.paymentMode === 'CASH_AT_PICKUP' ? ` · collect ${inr(b.total)}` : ''}`, href: `/owner/bookings/${b.id}#handover`, cta: 'Start handover' })),
    ...returns.map((b) => ({ key: b.id, tone: 'ret' as const, title: `Check return · ${b.item.title}`, sub: `${shortName(b.renter.name)} returned it ${b.returnedAt ? fmtTime(b.returnedAt) : ''} · ${Math.max(0, Math.ceil(((b.returnedAt?.getTime() ?? 0) + RETURN_CONFIRM_HOURS * 3600000 - Date.now()) / 3600000))} h left to confirm`, href: `/owner/bookings/${b.id}#confirm`, cta: 'Check now' })),
    ...late.map((b) => ({ key: b.id, tone: 'late' as const, title: `Overdue · ${b.item.title}`, sub: `${shortName(b.renter.name)} is ${lateDays(b)} day(s) late (due ${fmtDay(b.endDate)})`, href: `/owner/bookings/${b.id}`, cta: 'Open' })),
    ...claims.map((b) => ({ key: b.id, tone: 'claim' as const, title: `Claim ${b.claim!.status === 'OPEN' ? 'waiting for the renter' : 'with admin'} · ${b.item.title}`, sub: b.claim!.status === 'OPEN' ? `${inr(b.claim!.amount)} · auto-accepted ${CLAIM_RESPONSE_HOURS} h after you filed it` : `${shortName(b.renter.name)} disputed ${inr(b.claim!.amount)}`, href: `/owner/bookings/${b.id}`, cta: 'View' })),
  ];
  const hour = Number(new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }).format(new Date()));
  return (
    <>
      <PageCss id="O01-Dashboard" />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px' }}>
        <div><p className="mute" style={{ fontSize: '14px' }}>{fmtDay(today)}</p><h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,42px)', fontWeight: '700' }}>Good {hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, {user.name.split(' ')[0]}</h1></div>
        <Link className="btn" href="/owner/new" style={{ background: '#C9491F', color: '#fff' }}><svg className="ic" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>List an item</Link>
      </div>
      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(190px,100%),1fr))' }}>
        <Link className="kpi" href="/owner/earnings" style={{ background: '#1F4D3A', color: '#F6F1E7', textDecoration: 'none' }}><span style={{ fontSize: '13px', color: '#DCE6DA' }}>Earned in {monthYear(new Date()).split(' ')[0]}</span><b className="v">{inr(earned._sum.amount ?? 0)}</b><span style={{ fontSize: '12.5px', color: '#BFD1BD' }}>{inr(pendingPay._sum.amount ?? 0)} waiting for payout</span></Link>
        <Link className="kpi" href="/owner/requests" style={{ textDecoration: 'none', color: '#23262A' }}><span className="mute" style={{ fontSize: '13px' }}>New requests</span><b className="v" style={{ color: requests.length ? '#C9491F' : '#23262A' }}>{requests.length}</b><span className="mute" style={{ fontSize: '12.5px' }}>{requests.length ? 'Reply soon, renters are waiting' : 'All answered'}</span></Link>
        <Link className="kpi" href="/owner/bookings?tab=out" style={{ textDecoration: 'none', color: '#23262A' }}><span className="mute" style={{ fontSize: '13px' }}>Out on rent now</span><b className="v">{outNow} of {items}</b><span className="mute" style={{ fontSize: '12.5px' }}>items listed</span></Link>
        <Link className="kpi" href="/owner/reviews" style={{ textDecoration: 'none', color: '#23262A' }}><span className="mute" style={{ fontSize: '13px' }}>Your rating</span><b className="v">{rating._count ? (rating._avg.rating ?? 0).toFixed(1) : '—'}</b><span className="mute" style={{ fontSize: '12.5px' }}>from {rating._count} review{rating._count === 1 ? '' : 's'}</span></Link>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
        <section className="card" style={{ flex: '999 1 440px', minWidth: '0', padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 className="d" style={{ fontSize: '22px', fontWeight: '700' }}>Needs your action</h2>
          {tasks.length === 0 && <EmptyState icon="check" title="Nothing needs you right now" text="New requests, pickups, returns to check and claims show up here." />}
          {tasks.map((t) => (
            <div key={t.tone + t.key} className="task">
              <span style={{ width: '44px', height: '44px', borderRadius: '14px', background: TONE[t.tone][0], color: TONE[t.tone][1], display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><svg className="ic" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: TONE[t.tone][2] }} /></span>
              <span style={{ flex: '1 1 220px' }}><b>{t.title}</b><br /><span className="mute" style={{ fontSize: '13px' }}>{t.sub}</span></span>
              <Link className="btn" href={t.href} style={{ background: '#1F4D3A', color: '#fff', minHeight: '42px' }}>{t.cta}</Link>
            </div>
          ))}
        </section>
        <section className="card" style={{ flex: '1 1 320px', minWidth: '0', padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><h2 className="d" style={{ fontSize: '20px', fontWeight: '700' }}>Coming up</h2><Link href="/owner/calendar" style={{ fontSize: '13px', fontWeight: '700' }}>Calendar</Link></div>
          {upcoming.length === 0 && <p className="mute" style={{ fontSize: '14px' }}>No pickups in the next 2 weeks.</p>}
          {upcoming.map((b) => <Link key={b.id} href={`/owner/bookings/${b.id}`} className="task" style={{ textDecoration: 'none', color: '#23262A' }}><span style={{ flex: 1 }}><b>{fmtDay(b.startDate)}</b> · {b.item.title}<br /><span className="mute" style={{ fontSize: '13px' }}>{shortName(b.renter.name)} · {fmtRange(b.startDate, b.endDate)}</span></span></Link>)}
        </section>
      </div>
    </>
  );
}
