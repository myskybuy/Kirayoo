import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageCss from '@/components/PageCss';
import ItemCard from '@/components/ItemCard';
import BookingWidget from '@/components/BookingWidget';
import RangeCalendar from '@/components/RangeCalendar';
import Gallery from '@/components/Gallery';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CATEGORIES, categoryLabel, DELIVERY_FEE } from '@/lib/constants';
import { addDays, avatarColor, fmtDay, fmtRange, initials, inr, isDay, monthYear, shortName, todayIST } from '@/lib/format';
import { countDays, freeItemIds, occupiedDays, quote, rangeError } from '@/lib/bookings';
import { toCards, visibleWhere } from '@/lib/search';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.item.findUnique({ where: { id }, select: { title: true } });
  return { title: item?.title ?? 'Item' };
}

export default async function ItemPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ start?: string; end?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getUser();
  const item = await prisma.item.findUnique({ where: { id }, include: { owner: true } });
  if (!item || item.deletedAt) notFound();
  const isOwner = user?.id === item.ownerId;
  const live = item.status === 'ACTIVE' && item.owner.idStatus === 'VERIFIED' && !item.owner.isBlocked;
  // Non-live items are visible only to their owner (and the admin).
  if (!live && !isOwner && !user?.isAdmin) notFound();
  if (!isOwner) await prisma.item.update({ where: { id }, data: { views: { increment: 1 } } });

  const today = todayIST();
  const [occ, itemReviews, ownerAgg, ownerItems, completed] = await Promise.all([
    occupiedDays(item.id, today, addDays(today, 180)),
    prisma.review.findMany({ where: { itemId: item.id }, include: { fromUser: { select: { id: true, name: true } }, booking: { select: { days: true } } }, orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.review.aggregate({ where: { toUserId: item.ownerId, booking: { ownerId: item.ownerId } }, _avg: { rating: true }, _count: true }),
    prisma.item.count({ where: { ownerId: item.ownerId, status: 'ACTIVE', deletedAt: null } }),
    prisma.booking.count({ where: { ownerId: item.ownerId, status: { in: ['RETURN_CONFIRMED', 'DEPOSIT_REFUNDED'] } } }),
  ]);
  const itemAgg = await prisma.review.aggregate({ where: { itemId: item.id }, _avg: { rating: true }, _count: true });
  const unavailable = [...new Set([...occ.booked, ...occ.blocked])].sort();
  const ownerFirst = item.owner.name.split(' ')[0];
  const cat = CATEGORIES.find((c) => c.key === item.category);

  // S04: dates passed in (from browse or login) that are not free.
  const want = isDay(sp.start) && isDay(sp.end) && sp.start! <= sp.end! ? { start: sp.start!, end: sp.end! } : null;
  const wantErr = want ? rangeError(item, want.start, want.end, today) : null;
  const clash = want && !wantErr ? unavailable.filter((d) => d >= want.start && d <= want.end) : [];
  const initial = want && !wantErr && clash.length === 0 ? want : {};

  const handover = item.canPickup && item.canDeliver ? 'Pickup or delivery' : item.canDeliver ? 'Delivery only' : 'Self pickup';

  if (want && clash.length > 0 && !isOwner) {
    // Closest free ranges of the same length, before and after.
    const len = countDays(want.start, want.end);
    const freeFrom = (s: string) => {
      for (let d = s, i = 0; i < 120; i++, d = addDays(d, 1)) {
        if (d < today) continue;
        const e = addDays(d, len);
        if (!unavailable.some((u) => u >= d && u <= e)) return d;
      }
      return null;
    };
    const alts = [freeFrom(addDays(want.end, 1)), (() => { for (let d = addDays(want.start, -len - 1); d >= today; d = addDays(d, -1)) { const e = addDays(d, len); if (!unavailable.some((u) => u >= d && u <= e)) return d; } return null; })()]
      .filter((d): d is string => !!d)
      .sort();
    const similarRows = await prisma.item.findMany({ where: { ...visibleWhere(user?.id), city: item.city, category: item.category, id: { not: item.id } }, include: { owner: { select: { id: true, name: true } } }, take: 30 });
    const free = await freeItemIds(similarRows.map((r) => r.id), want.start, want.end);
    const similar = await toCards(similarRows.filter((r) => free.has(r.id)).slice(0, 4), want);
    return (
      <>
        <PageCss id="S04-Unavailable" />
        <div className="wrap" style={{ paddingTop: '32px', paddingBottom: '72px', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>
          <main style={{ flex: '999 1 520px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link href={`/items/${item.id}`} style={{ fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}>← {item.title}</Link>
            <h1 className="d" style={{ fontSize: 'clamp(28px,3vw,40px)', fontWeight: '700', lineHeight: '1.1' }}>Not free for all of {fmtRange(want.start, want.end)}</h1>
            <p className="mute">{clash.length === 1 ? `${fmtDay(clash[0])} is` : `${clash.slice(0, 3).map((d) => fmtDay(d)).join(', ')}${clash.length > 3 ? '…' : ''} are`} already booked or blocked. Pick dates around {clash.length === 1 ? 'it' : 'them'}, or try a similar item nearby that&apos;s free for your exact dates.</p>
            <h2 className="d" style={{ fontSize: '22px', fontWeight: '700', marginTop: '12px' }}>Free {fmtRange(want.start, want.end)} near you</h2>
            {similar.length ? (
              <div style={{ display: 'grid', gap: '36px 20px', gridTemplateColumns: 'repeat(auto-fill,minmax(min(250px,100%),1fr))' }}>{similar.map((c) => <ItemCard key={c.href} {...c} />)}</div>
            ) : <p className="mute">No similar items are free for those dates right now.</p>}
          </main>
          <aside style={{ flex: '1 1 360px', minWidth: '0' }}>
            <div style={{ background: '#FFFDF8', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 26px 56px -20px rgba(31,77,58,.42)' }}>
              <div><span className="d" style={{ fontSize: '28px', fontWeight: '700' }}>{inr(item.pricePerDay)}</span><span className="mute"> / day</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: '18px', boxShadow: 'inset 0 0 0 2px #B3372B', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderRight: '1.5px solid #E3DACA' }}><span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '.06em', color: '#8E2A20' }}>PICKUP</span><p style={{ fontWeight: '700' }}>{fmtDay(want.start)}</p></div>
                <div style={{ padding: '10px 14px' }}><span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '.06em', color: '#8E2A20' }}>RETURN</span><p style={{ fontWeight: '700' }}>{fmtDay(want.end)}</p></div>
              </div>
              <RangeCalendar small readOnly today={today} unavailable={unavailable} value={want} />
              <p role="alert" style={{ padding: '12px 14px', borderRadius: '14px', background: '#F7DCD7', color: '#8E2A20', fontWeight: '700', fontSize: '14px' }}>{clash.length === 1 ? `${fmtDay(clash[0])} is unavailable.` : `${fmtDay(clash[0])} – ${fmtDay(clash[clash.length - 1])}: ${clash.length} days unavailable.`}</p>
              {alts.length > 0 && <b style={{ fontSize: '13px', color: '#474C52' }}>Closest free dates</b>}
              {alts.map((s) => {
                const e = addDays(s, len);
                const qq = quote(item, s, e, 'PICKUP', DELIVERY_FEE);
                return <Link key={s} className="alt" href={`/items/${item.id}?start=${s}&end=${e}`}><span><b>{fmtRange(s, e)}</b> · {qq.days} day{qq.days > 1 ? 's' : ''}</span><b>{inr(qq.rent)}</b></Link>;
              })}
              <button className="btn" type="button" disabled style={{ background: '#E3DACA', color: '#60666C', cursor: 'not-allowed' }}>Request to book</button>
              <Link href={user ? `/chat/new?item=${item.id}` : `/login?next=/items/${item.id}`} style={{ textAlign: 'center', fontWeight: '700', fontSize: '14px' }}>Ask {ownerFirst} if dates can change</Link>
            </div>
          </aside>
        </div>
      </>
    );
  }

  return (
    <>
      <PageCss id="R04-Item" />
      <div className="wrap" style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <nav aria-label="Breadcrumb" className="mute" style={{ fontSize: '13px' }}><Link href="/browse" style={{ color: '#60666C' }}>← Back to results</Link> · {categoryLabel(item.category)} · {item.area}</nav>
        {!live && <p className="k-alert warn">{isOwner ? `Only you can see this page — the item is ${item.status === 'PENDING_REVIEW' ? 'waiting for admin review' : item.status.toLowerCase()}.` : `Not live (${item.status.toLowerCase()}).`}</p>}
        {wantErr && <p className="k-alert warn">{wantErr}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,44px)', fontWeight: '700', lineHeight: '1.05' }}>{item.title}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', alignItems: 'center', fontSize: '14px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="#C9491F"></path></svg>{itemAgg._count ? (itemAgg._avg.rating ?? 0).toFixed(1) : 'New'} <a href="#reviews" style={{ fontWeight: '500' }}>({itemAgg._count} review{itemAgg._count === 1 ? '' : 's'})</a></span>
              <span className="mute" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"></path><circle cx="12" cy="9.5" r="2.5"></circle></svg>{item.area}, {item.city}</span>
              <span className="badge b-ok">Owner ID verified</span>
              <span className="badge b-n">{handover}</span>
              {item.acceptsCashAtPickup && <span className="badge b-n">Cash / UPI at pickup</span>}
            </div>
          </div>
        </div>
        <Gallery photos={item.photos} title={item.title} icon={cat?.icon} />
      </div>
      <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'flex-start', paddingTop: '12px', paddingBottom: '64px' }}>
        <main style={{ flex: '999 1 560px', minWidth: '0' }}>
          <div className="sec" style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
            <span style={{ position: 'relative', flex: 'none' }}>
              <span style={{ width: '60px', height: '60px', borderRadius: '50%', background: avatarColor(item.owner.id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '19px' }}>{initials(item.owner.name)}</span>
              <span style={{ position: 'absolute', right: '-2px', bottom: '-2px', width: '22px', height: '22px', borderRadius: '50%', background: '#1F4D3A', boxShadow: '0 0 0 3px #F6F1E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg></span>
            </span>
            <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column' }}>
              <b style={{ fontSize: '17px' }}>Lent by {item.owner.name}</b>
              <span className="mute" style={{ fontSize: '13.5px' }}>ID verified · {ownerAgg._count ? `★ ${(ownerAgg._avg.rating ?? 0).toFixed(1)} (${ownerAgg._count}) · ` : ''}{completed} completed rental{completed === 1 ? '' : 's'} · On Kirayo since {monthYear(item.owner.createdAt)} · {ownerItems} item{ownerItems === 1 ? '' : 's'} listed</span>
            </div>
            {!isOwner && <Link className="btn btn-o" href={user ? `/chat/new?item=${item.id}` : `/login?next=/items/${item.id}`} style={{ minHeight: '46px' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}><path d="M5 18.5V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9z"></path></svg>Chat with owner</Link>}
          </div>
          <div className="sec">
            <h2>About this item</h2>
            <p style={{ color: '#474C52', maxWidth: '680px', whiteSpace: 'pre-wrap' }}>{item.description}</p>
          </div>
          <div className="sec">
            <h2>Rates &amp; deposit</h2>
            <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
              <div style={{ padding: '18px', borderRadius: '20px', background: '#FFFDF8', boxShadow: 'inset 0 0 0 1px #E3DACA' }}><span className="mute" style={{ fontSize: '13px' }}>Per day</span><p className="d" style={{ fontSize: '28px', fontWeight: '700' }}>{inr(item.pricePerDay)}</p></div>
              {item.pricePerWeek && <div style={{ padding: '18px', borderRadius: '20px', background: '#FFFDF8', boxShadow: 'inset 0 0 0 1px #E3DACA' }}><span className="mute" style={{ fontSize: '13px' }}>Week · 7 days</span><p className="d" style={{ fontSize: '28px', fontWeight: '700' }}>{inr(item.pricePerWeek)}</p></div>}
              <div style={{ padding: '18px', borderRadius: '20px', background: '#1F4D3A', color: '#F6F1E7' }}><span style={{ fontSize: '13px', color: '#DCE6DA' }}>Refundable deposit</span><p className="d" style={{ fontSize: '28px', fontWeight: '700' }}>{inr(item.deposit)}</p></div>
            </div>
            <ul style={{ margin: '0', paddingLeft: '18px', color: '#474C52', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Minimum {item.minDays} day{item.minDays > 1 ? 's' : ''}, maximum {item.maxDays} days. Days are counted from pickup day to return day.</li>
              <li>{item.canPickup && `Self pickup${item.pickupNote ? ` — ${item.pickupNote}` : ` in ${item.area}`} (exact address shared after payment)`}{item.canPickup && item.canDeliver ? ', or ' : ''}{item.canDeliver && `delivery in ${item.area} & nearby areas for a flat ${inr(DELIVERY_FEE)} (drop-off + collection)`}.</li>
              {item.acceptsCashAtPickup && <li>You can pay online now, or pay {ownerFirst} in cash / UPI at pickup.</li>}
              <li>The deposit is refunded after a confirmed return. <Link href="/deposit-policy">Deposit policy</Link></li>
            </ul>
          </div>
          <div className="sec">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}><h2>Availability</h2><span className="mute" style={{ fontSize: '13px' }}>Pick dates in the booking box</span></div>
            <RangeCalendar readOnly months={2} today={today} unavailable={unavailable} value={initial} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12.5px', color: '#474C52' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '14px', height: '14px', borderRadius: '5px', background: '#1F4D3A' }}></span>Your dates</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '14px', height: '14px', borderRadius: '5px', background: '#EDE5D5' }}></span>Booked / blocked</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '14px', height: '14px', borderRadius: '5px', boxShadow: 'inset 0 0 0 1.5px #C9491F' }}></span>Today</span>
            </div>
          </div>
          <div className="sec" id="reviews" style={{ borderBottom: '0' }}>
            <h2>Reviews{itemAgg._count ? ` · ${(itemAgg._avg.rating ?? 0).toFixed(1)}` : ''}</h2>
            {itemReviews.length === 0 && <p className="mute">No reviews yet. Renters review the item after returning it.</p>}
            <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(280px,100%),1fr))' }}>
              {itemReviews.map((r) => (
                <div key={r.id} className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: avatarColor(r.fromUser.id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px' }}>{initials(r.fromUser.name)}</span>
                    <span style={{ display: 'flex', flexDirection: 'column' }}><b style={{ fontSize: '14px' }}>{shortName(r.fromUser.name)} <span style={{ color: '#C9491F' }}>{'★'.repeat(r.rating)}</span></b><span className="mute" style={{ fontSize: '12px' }}>{monthYear(r.createdAt)} · {r.booking.days} day{r.booking.days > 1 ? 's' : ''}</span></span>
                  </div>
                  {r.tags.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{r.tags.map((t) => <span key={t} className="badge b-n">{t}</span>)}</div>}
                  {r.text && <p style={{ fontSize: '14px', color: '#474C52' }}>{r.text}</p>}
                </div>
              ))}
            </div>
          </div>
        </main>
        <aside style={{ flex: '1 1 360px', minWidth: '0', maxWidth: '100%', position: 'sticky', top: '20px' }}>
          <BookingWidget
            item={{ id: item.id, pricePerDay: item.pricePerDay, pricePerWeek: item.pricePerWeek, deposit: item.deposit, minDays: item.minDays, maxDays: item.maxDays, canPickup: item.canPickup, canDeliver: item.canDeliver, pickupNote: item.pickupNote, area: item.area }}
            ownerFirst={ownerFirst}
            today={today}
            unavailable={unavailable}
            deliveryFee={DELIVERY_FEE}
            initial={initial}
            loggedIn={!!user}
            isOwner={isOwner}
          />
        </aside>
      </div>
    </>
  );
}
