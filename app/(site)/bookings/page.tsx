import Link from 'next/link';
import type { BookingStatus } from '@prisma/client';
import PageCss from '@/components/PageCss';
import BookingRow, { BADGES } from '@/components/BookingRow';
import EmptyState from '@/components/EmptyState';
import { ownerHref } from '@/components/SiteHeader';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { fmtRange } from '@/lib/format';
import { isOverdue, nextStepFor } from '@/lib/bookings';
import { runDueJobs } from '@/lib/jobs';

export const metadata = { title: 'My rentals' };

const TABS: { key: string; label: string; statuses: BookingStatus[] }[] = [
  { key: 'action', label: 'Needs action', statuses: [] },
  { key: 'upcoming', label: 'Upcoming', statuses: ['PENDING_PAYMENT', 'CONFIRMED'] },
  { key: 'active', label: 'Active', statuses: ['PICKED_UP', 'RETURNED', 'DISPUTED', 'RETURN_CONFIRMED'] },
  { key: 'past', label: 'Past', statuses: ['DEPOSIT_REFUNDED'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['CANCELLED'] },
];

export default async function MyRentalsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser('/bookings');
  await runDueJobs();
  const [bookings, requests] = await Promise.all([
    prisma.booking.findMany({
      where: { renterId: user.id },
      include: { item: { select: { title: true, photos: true } }, renter: { select: { name: true } }, owner: { select: { name: true } }, claim: true, extensions: true, refunds: true, payout: true, reviews: { select: { fromUserId: true } } },
      orderBy: { startDate: 'desc' },
    }),
    prisma.message.findMany({
      where: { type: 'BOOKING_REQUEST', requestStatus: 'PENDING', conversation: { renterId: user.id } },
      include: { conversation: { include: { item: { select: { title: true, photos: true } }, owner: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  const withNext = bookings.map((b) => ({ b, next: nextStepFor(b, 'RENTER') }));
  const needs = withNext.filter((x) => x.next.tone === 'action' || x.next.tone === 'alert');
  const counters = requests.filter((r) => r.senderId !== user.id);
  const actionCount = needs.length + counters.length;
  const tab = TABS.find((t) => t.key === sp.tab) ?? (actionCount ? TABS[0] : TABS[1]);
  const list = tab.key === 'action' ? needs : withNext.filter((x) => tab.statuses.includes(x.b.status));
  const reqs = tab.key === 'action' ? counters : tab.key === 'upcoming' ? requests : [];
  const count = (t: (typeof TABS)[number]) => (t.key === 'action' ? actionCount : withNext.filter((x) => t.statuses.includes(x.b.status)).length + (t.key === 'upcoming' ? requests.length : 0));

  return (
    <>
      <PageCss id="R13-MyRentals" />
      <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '72px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
          <h1 className="d" style={{ fontSize: 'clamp(32px,3.6vw,48px)', fontWeight: '700' }}>My rentals</h1>
          <Link href={ownerHref(user, '/owner')} style={{ fontWeight: '700', fontSize: '14px' }}>Items you lend out → Owner panel</Link>
        </div>
        <div role="tablist" aria-label="Rental status" style={{ display: 'flex', gap: '6px', padding: '5px', borderRadius: '28px', background: 'var(--kb-fffdf8)', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)', alignSelf: 'flex-start', flexWrap: 'wrap' }}>
          {TABS.map((t) => {
            const on = t.key === tab.key;
            const n = count(t);
            return (
              <Link key={t.key} className="tab" role="tab" aria-selected={on} href={`/bookings?tab=${t.key}`} style={{ background: on ? 'var(--kb-1f4d3a)' : 'transparent', color: on ? 'var(--kf-ffffff)' : 'var(--kf-474c52)', textDecoration: 'none' }}>
                {t.label}<span style={{ minWidth: '22px', height: '22px', padding: '0 6px', boxSizing: 'border-box', borderRadius: '999px', background: on ? 'rgba(255,255,255,.2)' : t.key === 'action' && n ? '#FBE3D8' : '#EDE5D5', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
              </Link>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {reqs.map((m) => (
            <BookingRow key={m.id} photo={m.conversation.item.photos[0]} badge={m.senderId === user.id ? BADGES.REQUEST : BADGES.COUNTER} title={m.conversation.item.title}
              sub={`${fmtRange(m.startDate!, m.endDate!)} · from ${m.conversation.owner.name}`}
              note={m.senderId === user.id ? `Waiting for ${m.conversation.owner.name.split(' ')[0]} to answer your request.` : `${m.conversation.owner.name.split(' ')[0]} suggested these dates — accept or withdraw in chat.`}
              detailsHref={`/chat/${m.conversationId}`} detailsLabel="Open chat" />
          ))}
          {list.map(({ b, next }) => (
            <BookingRow key={b.id} photo={b.item.photos[0]} badge={isOverdue(b) ? BADGES.OVERDUE : BADGES[b.status]} code={b.code} title={b.item.title}
              sub={`${fmtRange(b.startDate, b.endDate)} · ${b.days} day${b.days > 1 ? 's' : ''} · from ${b.owner.name}`}
              next={next} detailsHref={`/bookings/${b.id}`} />
          ))}
          {list.length === 0 && reqs.length === 0 && (
            tab.key === 'action'
              ? <EmptyState icon="check" title="Nothing needs you right now" text="When a payment, pickup, return or claim needs you, it shows up here." />
              : <EmptyState icon="calendar" title={bookings.length ? `No ${tab.label.toLowerCase()} rentals` : 'Nothing rented yet'} text="When you book something, its pickup code, return date and deposit status live here." action={{ href: '/browse', label: 'Browse nearby items' }} />
          )}
        </div>
      </div>
    </>
  );
}
