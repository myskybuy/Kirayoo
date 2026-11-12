import Link from 'next/link';
import PageCss from '@/components/PageCss';
import ItemThumb from '@/components/ItemThumb';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { addDays, dayOf, diffDays, fmtDay, inr, isDay, shortName, todayIST, toDbDate } from '@/lib/format';
import { CATEGORIES } from '@/lib/constants';
import { toggleBlockFormAction } from '@/app/actions/calendar';

export const metadata = { title: 'Calendar' };

const SPAN = 23; // matches the kit's .tl grid (220px + 23 day columns)
const WD = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default async function OwnerCalendarPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser('/owner/calendar');
  const today = todayIST();
  const from = sp.from && isDay(sp.from) ? sp.from : today;
  const to = addDays(from, SPAN - 1);
  const days = Array.from({ length: SPAN }, (_, i) => addDays(from, i));

  const items = await prisma.item.findMany({ where: { ownerId: user.id, deletedAt: null }, orderBy: { createdAt: 'asc' } });
  const ids = items.map((i) => i.id);
  const [bookings, blocked, requests] = await Promise.all([
    prisma.booking.findMany({
      where: { itemId: { in: ids }, status: { not: 'CANCELLED' }, startDate: { lte: toDbDate(to) }, endDate: { gte: toDbDate(from) } },
      include: { renter: { select: { name: true } } },
    }),
    prisma.blockedDate.findMany({ where: { itemId: { in: ids }, date: { gte: toDbDate(from), lte: toDbDate(to) } } }),
    prisma.message.findMany({
      where: { type: 'BOOKING_REQUEST', requestStatus: 'PENDING', conversation: { itemId: { in: ids } }, startDate: { lte: toDbDate(to) }, endDate: { gte: toDbDate(from) } },
      include: { conversation: { select: { itemId: true, renter: { select: { name: true } } } } },
    }),
  ]);
  const blockedSet = new Set(blocked.map((b) => `${b.itemId}|${dayOf(b.date)}`));
  const col = (d: string) => diffDays(from, d) + 2;

  return (
    <>
      <PageCss id="O05-Calendar" />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px' }}>
        <div><h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,42px)', fontWeight: '700' }}>Calendar</h1><p className="mute">All your items, all bookings. Tap a bar to open it, tap an empty day to block or unblock it.</p></div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {from > today ? <Link className="nav" href={`/owner/calendar?from=${addDays(from, -SPAN) < today ? today : addDays(from, -SPAN)}`} aria-label="Previous weeks"><svg className="ic" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"></path></svg></Link> : <span className="nav" aria-hidden="true" style={{ opacity: 0.4 }}><svg className="ic" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"></path></svg></span>}
          <b className="d" style={{ fontSize: '18px', minWidth: '150px', textAlign: 'center' }}>{fmtDay(from).replace(/^\w+ /, '')} – {fmtDay(to).replace(/^\w+ /, '')}</b>
          <Link className="nav" href={`/owner/calendar?from=${addDays(from, SPAN)}`} aria-label="Next weeks"><svg className="ic" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"></path></svg></Link>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="k-alert info">No items yet. <Link href="/owner/new">List your first item</Link> to see its calendar.</p>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '24px', background: 'var(--kb-fffdf8)', boxShadow: '0 1px 2px rgba(35,38,42,.06),0 8px 24px -10px rgba(31,77,58,.18)' }}>
          <div className="tl">
            <div className="hd" style={{ alignItems: 'flex-start', paddingLeft: '14px', position: 'sticky', left: '0', background: 'var(--kb-fffdf8)', zIndex: '2' }}>Item</div>
            {days.map((d) => {
              const wd = new Date(d + 'T00:00:00Z').getUTCDay();
              const isToday = d === today;
              const wkend = wd === 0 || wd === 6;
              return <div key={d} className="hd" style={{ background: isToday ? 'var(--kb-fbe3d8)' : wkend ? 'var(--kb-f6f1e7)' : 'transparent', color: isToday ? 'var(--kf-9a3412)' : 'var(--kf-60666c)' }}>{WD[wd]}<b style={{ color: isToday ? 'var(--kf-9a3412)' : 'var(--kf-60666c)' }}>{Number(d.slice(8))}</b></div>;
            })}
          </div>
          {items.map((it) => {
            const cat = CATEGORIES.find((c) => c.key === it.category);
            const bars = bookings.filter((b) => b.itemId === it.id);
            const reqs = requests.filter((r) => r.conversation.itemId === it.id);
            const taken = new Set<string>();
            for (const b of bars) for (let d = dayOf(b.startDate); d <= dayOf(b.endDate); d = addDays(d, 1)) taken.add(d);
            return (
              <div key={it.id} className="tl" style={{ opacity: it.status === 'ACTIVE' ? '1' : '.6' }}>
                <div className="rowlab" style={{ gridRow: '1', gridColumn: '1' }}>
                  <span style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--kb-bfd1bd)', flex: 'none', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--kf-2f4e40)' }}><ItemThumb photo={it.photos[0]} icon={cat?.icon} size={18} /></span>
                  <span style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}><b style={{ fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.title}</b><span className="mute" style={{ fontSize: '12px' }}>{inr(it.pricePerDay)}/day{it.status !== 'ACTIVE' ? ` · ${it.status === 'PAUSED' ? 'paused' : it.status === 'PENDING_REVIEW' ? 'in review' : 'rejected'}` : ''}</span></span>
                </div>
                {days.map((d, i) => {
                  const isBlocked = blockedSet.has(`${it.id}|${d}`);
                  const cell = { gridRow: '1', gridColumn: String(i + 2), height: '72px', borderBottom: '1px solid var(--kl-efe8da)', borderLeft: '1px solid var(--kl-f3ede2)', background: isBlocked ? 'repeating-linear-gradient(135deg,#E3DACA 0 4px,#F6F1E7 4px 8px)' : 'transparent' } as const;
                  if (taken.has(d) || d < today) return <div key={d} style={cell}></div>;
                  return (
                    <form key={d} action={toggleBlockFormAction} style={cell}>
                      <input type="hidden" name="itemId" value={it.id} />
                      <input type="hidden" name="day" value={d} />
                      <input type="hidden" name="block" value={isBlocked ? '0' : '1'} />
                      <input type="hidden" name="from" value={from} />
                      <button type="submit" aria-label={`${isBlocked ? 'Unblock' : 'Block'} ${fmtDay(d)} for ${it.title}`} title={isBlocked ? 'Blocked — tap to unblock' : 'Tap to block'} style={{ width: '100%', height: '100%', border: 0, background: 'transparent', cursor: 'pointer' }}></button>
                    </form>
                  );
                })}
                {bars.map((b) => {
                  const s = dayOf(b.startDate) < from ? from : dayOf(b.startDate);
                  const e = dayOf(b.endDate) > to ? to : dayOf(b.endDate);
                  const done = ['RETURN_CONFIRMED', 'DEPOSIT_REFUNDED', 'RETURNED', 'DISPUTED'].includes(b.status);
                  const hold = b.status === 'PENDING_PAYMENT';
                  return (
                    <Link key={b.id} className="bar" href={`/owner/bookings/${b.id}`} title={`${shortName(b.renter.name)} · ${fmtDay(b.startDate)} – ${fmtDay(b.endDate)}`}
                      style={{ gridRow: '1', gridColumn: `${col(s)} / ${col(e) + 1}`, background: done ? 'var(--kb-bfd1bd)' : hold ? 'var(--kb-dce6da)' : 'var(--kb-1f4d3a)', color: done || hold ? 'var(--kf-1f4d3a)' : 'var(--kf-ffffff)', boxShadow: 'none' }}>
                      {shortName(b.renter.name)}{b.mode === 'DELIVERY' ? ' · delivery' : ''}{hold ? ' · awaiting payment' : ''}
                    </Link>
                  );
                })}
                {reqs.map((r) => {
                  const s = dayOf(r.startDate!) < from ? from : dayOf(r.startDate!);
                  const e = dayOf(r.endDate!) > to ? to : dayOf(r.endDate!);
                  return (
                    <Link key={r.id} className="bar" href={`/chat/${r.conversationId}`} title={`${shortName(r.conversation.renter.name)} · request`}
                      style={{ gridRow: '1', gridColumn: `${col(s)} / ${col(e) + 1}`, background: 'var(--kb-fffdf8)', color: 'var(--kf-9a3412)', boxShadow: 'inset 0 0 0 2px var(--kl-c9491f)' }}>
                      {shortName(r.conversation.renter.name)} · request
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '13px', color: 'var(--kf-474c52)' }}>
        <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}><span style={{ width: '18px', height: '14px', borderRadius: '5px', background: 'var(--kb-1f4d3a)' }}></span>Confirmed booking</span>
        <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}><span style={{ width: '18px', height: '14px', borderRadius: '5px', background: 'var(--kb-dce6da)' }}></span>Dates held, awaiting payment</span>
        <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}><span style={{ width: '18px', height: '14px', borderRadius: '5px', background: 'var(--kb-fffdf8)', boxShadow: 'inset 0 0 0 2px var(--kl-c9491f)' }}></span>Request waiting for you</span>
        <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}><span style={{ width: '18px', height: '14px', borderRadius: '5px', background: 'var(--kb-bfd1bd)' }}></span>Completed</span>
        <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}><span style={{ width: '18px', height: '14px', borderRadius: '5px', background: 'repeating-linear-gradient(135deg,var(--kb-e3daca) 0 4px,var(--kb-f6f1e7) 4px 8px)' }}></span>Blocked by you</span>
      </div>
    </>
  );
}
