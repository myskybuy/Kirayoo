import Link from 'next/link';
import PageCss from '@/components/PageCss';
import EmptyState from '@/components/EmptyState';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { avatarColor, dayOf, fmtRange, initials, inr, todayIST } from '@/lib/format';
import { countDays, quote } from '@/lib/bookings';
import { DELIVERY_FEE, PLATFORM_FEE_PERCENT } from '@/lib/constants';
import { answerRequestAction } from '@/app/actions/requests';

export const metadata = { title: 'Booking requests' };

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser('/owner/requests');
  const reqs = await prisma.message.findMany({
    where: { type: 'BOOKING_REQUEST', requestStatus: 'PENDING', conversation: { ownerId: user.id }, senderId: { not: user.id } },
    include: { conversation: { include: { item: true, renter: true } } },
    orderBy: { createdAt: 'asc' },
  });
  const renterIds = [...new Set(reqs.map((r) => r.conversation.renterId))];
  const [stats, lastTexts, waiting] = await Promise.all([
    Promise.all(renterIds.map(async (id) => ({
      id,
      agg: await prisma.review.aggregate({ where: { toUserId: id, booking: { renterId: id } }, _avg: { rating: true }, _count: true }),
      rentals: await prisma.booking.count({ where: { renterId: id, status: { in: ['RETURN_CONFIRMED', 'DEPOSIT_REFUNDED'] } } }),
    }))),
    Promise.all(reqs.map((r) => prisma.message.findFirst({ where: { conversationId: r.conversationId, type: 'TEXT', senderId: r.conversation.renterId }, orderBy: { createdAt: 'desc' } }))),
    prisma.message.count({ where: { type: 'BOOKING_REQUEST', requestStatus: 'PENDING', conversation: { ownerId: user.id }, senderId: user.id } }),
  ]);
  const today = todayIST();

  return (
    <>
      <PageCss id="O04-Requests" />
      <div><h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,42px)', fontWeight: '700' }}>Booking requests</h1><p className="mute">Accept, decline, or suggest other dates. Renters see your answer in chat.</p></div>
      {sp.ok && <p className="k-alert ok">{sp.ok}</p>}
      {sp.error && <p className="k-alert err">{sp.error}</p>}
      {waiting > 0 && <p className="k-alert info">{waiting} suggestion{waiting > 1 ? 's' : ''} you sent {waiting > 1 ? 'are' : 'is'} waiting for the renter.</p>}
      {reqs.length === 0 && <EmptyState icon="check" title="No requests waiting" text="New booking requests from renters show up here and in your chats." />}
      {reqs.map((r, i) => {
        const c = r.conversation;
        const s = stats.find((x) => x.id === c.renterId)!;
        const start = dayOf(r.startDate!);
        const end = dayOf(r.endDate!);
        const q = quote(c.item, start, end, 'PICKUP', DELIVERY_FEE, PLATFORM_FEE_PERCENT);
        const days = countDays(start, end);
        const note = lastTexts[i];
        return (
          <article key={r.id} className="req">
            <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: '1 1 220px' }}>
                <span style={{ width: '52px', height: '52px', borderRadius: '50%', background: avatarColor(c.renter.id), color: 'var(--kf-ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flex: 'none' }}>{initials(c.renter.name)}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <b style={{ fontSize: '16px' }}>{c.renter.name}</b>
                  <span style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="badge" style={c.renter.idStatus === 'VERIFIED' ? { background: 'var(--kb-dceedf)', color: 'var(--kf-1e5a37)' } : { background: 'var(--kb-fbebcf)', color: 'var(--kf-7a4708)' }}>{c.renter.idStatus === 'VERIFIED' ? 'ID verified' : c.renter.idStatus === 'PENDING' ? 'ID pending' : 'ID not verified'}</span>
                    <span className="badge" style={{ background: 'var(--kb-ede5d5)', color: 'var(--kf-474c52)' }}>{s.agg._count ? `${(s.agg._avg.rating ?? 0).toFixed(1)} · ` : ''}{s.rentals ? `${s.rentals} rental${s.rentals > 1 ? 's' : ''}` : 'New member'}</span>
                  </span>
                </div>
              </div>
              <div style={{ flex: '2 1 360px', display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))' }}>
                <div className="kv"><span>Item</span><b>{c.item.title}</b></div>
                <div className="kv"><span>Dates</span><b>{fmtRange(start, end)} · {days} day{days > 1 ? 's' : ''}</b></div>
                <div className="kv"><span>Deposit</span><b>{inr(c.item.deposit)}</b></div>
                <div className="kv"><span>You earn</span><b style={{ color: 'var(--kf-1f4d3a)' }}>{inr(q.rent - q.platformFee)}</b></div>
              </div>
              <span className="badge" style={{ background: 'var(--kb-fbe3d8)', color: 'var(--kf-9a3412)' }}>{r.createdAt > new Date(Date.now() - 86400000) ? 'New' : 'Waiting'}</span>
            </div>
            {note && <div style={{ padding: '0 20px 16px', fontSize: '14px', color: 'var(--kf-474c52)' }}>“{note.text}”</div>}
            {c.renter.idStatus !== 'VERIFIED' && <div style={{ padding: '0 20px 16px', fontSize: '13px', color: 'var(--kf-7a4708)' }}>The renter verifies their ID before paying — you can accept now.</div>}
            <div style={{ padding: '14px 20px', background: 'var(--kb-f6f1e7)', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Link href={`/chat/${c.id}`} style={{ marginRight: 'auto', fontWeight: '700', fontSize: '14px' }}>Open chat</Link>
              <form action={answerRequestAction}><input type="hidden" name="messageId" value={r.id} /><input type="hidden" name="answer" value="DECLINE" />
                <button className="btn" type="submit" style={{ background: 'transparent', color: 'var(--kf-8e2a20)', boxShadow: 'inset 0 0 0 1.5px var(--kl-b3372b)' }}>Decline</button></form>
              <details style={{ position: 'relative' }}>
                <summary className="btn" style={{ listStyle: 'none', background: 'var(--kb-fffdf8)', color: 'var(--kf-1f4d3a)', boxShadow: 'inset 0 0 0 1.5px var(--kl-1f4d3a)' }}>Suggest dates</summary>
                <form action={answerRequestAction} className="card" style={{ position: 'absolute', right: 0, bottom: 'calc(100% + 8px)', zIndex: 5, padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', width: 'min(320px, 86vw)', background: 'var(--kb-fffdf8)', borderRadius: '20px', boxShadow: '0 22px 48px -16px rgba(31,77,58,.4)' }}>
                  <input type="hidden" name="messageId" value={r.id} /><input type="hidden" name="answer" value="COUNTER" />
                  <label className="lbl">Pickup<input className="in" type="date" name="start" min={today} defaultValue={start} required /></label>
                  <label className="lbl">Return<input className="in" type="date" name="end" min={today} defaultValue={end} required /></label>
                  <button className="btn" type="submit" style={{ background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)' }}>Send suggestion</button>
                  <Link href={`/chat/${c.id}`} style={{ fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>Use the calendar in chat</Link>
                </form>
              </details>
              <form action={answerRequestAction}><input type="hidden" name="messageId" value={r.id} /><input type="hidden" name="answer" value="ACCEPT" />
                <button className="btn" type="submit" style={{ background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)' }}>Accept</button></form>
            </div>
          </article>
        );
      })}
    </>
  );
}
