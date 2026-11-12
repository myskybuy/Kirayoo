import Link from 'next/link';
import type { BookingStatus } from '@prisma/client';
import PageCss from '@/components/PageCss';
import BookingRow, { BADGES } from '@/components/BookingRow';
import EmptyState from '@/components/EmptyState';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { fmtRange } from '@/lib/format';
import { isOverdue, nextStepFor } from '@/lib/bookings';
import { runDueJobs } from '@/lib/jobs';

export const metadata = { title: 'Bookings' };

const TABS: { key: string; label: string; statuses: BookingStatus[] }[] = [
  { key: 'new', label: 'New', statuses: ['PENDING_PAYMENT'] },
  { key: 'upcoming', label: 'Upcoming', statuses: ['CONFIRMED'] },
  { key: 'out', label: 'Out now', statuses: ['PICKED_UP'] },
  { key: 'returned', label: 'Returned (to confirm)', statuses: ['RETURNED', 'DISPUTED', 'RETURN_CONFIRMED'] },
  { key: 'completed', label: 'Completed', statuses: ['DEPOSIT_REFUNDED'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['CANCELLED'] },
];

export default async function OwnerBookingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser('/owner/bookings');
  await runDueJobs();
  const bookings = await prisma.booking.findMany({
    where: { ownerId: user.id },
    include: { item: { select: { title: true, photos: true } }, renter: { select: { name: true } }, owner: { select: { name: true } }, claim: true, extensions: true, refunds: true, payout: true, reviews: { select: { fromUserId: true } } },
    orderBy: { startDate: 'asc' },
  });
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[1];
  const rows = bookings.filter((b) => tab.statuses.includes(b.status));
  if (tab.key === 'completed' || tab.key === 'cancelled') rows.reverse();
  return (
    <>
      <PageCss id="R13-MyRentals" />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px' }}>
        <div><h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,42px)', fontWeight: '700' }}>Bookings</h1><p className="mute">Handover at pickup and return happens on each booking’s page.</p></div>
        <Link href="/owner/requests" style={{ fontWeight: 700, fontSize: '14px' }}>Booking requests →</Link>
      </div>
      <div role="tablist" aria-label="Booking status" style={{ display: 'flex', gap: '6px', padding: '5px', borderRadius: '24px', background: 'var(--kb-fffdf8)', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)', alignSelf: 'flex-start', flexWrap: 'wrap' }}>
        {TABS.map((t) => {
          const on = t.key === tab.key;
          const n = bookings.filter((b) => t.statuses.includes(b.status)).length;
          return (
            <Link key={t.key} className="tab" role="tab" aria-selected={on} href={`/owner/bookings?tab=${t.key}`} style={{ background: on ? 'var(--kb-1f4d3a)' : 'transparent', color: on ? 'var(--kf-ffffff)' : 'var(--kf-474c52)', textDecoration: 'none', minHeight: '42px', fontSize: '14px', padding: '0 16px' }}>
              {t.label}<span style={{ minWidth: '22px', height: '22px', padding: '0 6px', boxSizing: 'border-box', borderRadius: '999px', background: on ? 'rgba(255,255,255,.2)' : '#EDE5D5', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
            </Link>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {rows.map((b) => (
          <BookingRow key={b.id} photo={b.item.photos[0]} badge={isOverdue(b) ? BADGES.OVERDUE : b.status === 'PENDING_PAYMENT' ? { text: 'Awaiting payment', bg: 'var(--kb-fbebcf)', fg: 'var(--kf-7a4708)' } : BADGES[b.status]} code={b.code} title={b.item.title}
            sub={`${fmtRange(b.startDate, b.endDate)} · ${b.days} day${b.days > 1 ? 's' : ''} · ${b.renter.name}${b.paymentMode === 'CASH_AT_PICKUP' ? ' · cash at pickup' : ''}`}
            next={nextStepFor(b, 'OWNER')} detailsHref={`/owner/bookings/${b.id}`} />
        ))}
        {rows.length === 0 && <EmptyState icon="calendar" title={`No ${tab.label.toLowerCase()} bookings`} text="Bookings appear here once you accept a request in chat." />}
      </div>
    </>
  );
}
