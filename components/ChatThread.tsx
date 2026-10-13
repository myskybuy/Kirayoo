'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ThreadData, ThreadMsg } from '@/lib/thread-types';
import { quote, rangeError } from '@/lib/pricing';
import RangeCalendar from './RangeCalendar';
import { NextCard, ProgressBar } from './NextCard';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
const dfmt = (d: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', ...o }).format(new Date(d + 'T00:00:00Z'));
const day = (d: string) => dfmt(d, { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '');
const clock = (iso: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso));
const istDay = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(iso));

type Modal = { kind: 'request' } | { kind: 'counter'; messageId: string; start: string; end: string } | null;

export default function ChatThread({ initial, compose }: { initial: ThreadData; compose?: { start?: string; end?: string } }) {
  const [d, setD] = useState(initial);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<Modal>(compose && initial.role === 'RENTER' && !initial.pendingRequest ? { kind: 'request' } : null);
  const [range, setRange] = useState<{ start?: string; end?: string }>(compose ?? {});
  const [now, setNow] = useState(() => Date.now());
  const bottom = useRef<HTMLDivElement>(null);
  const lastCount = useRef(initial.messages.length);

  const poll = useCallback(async () => {
    try {
      const r = await fetch(`/api/chat/${d.id}`, { cache: 'no-store' });
      if (r.ok) setD(await r.json());
    } catch {
      /* network blip — skip silently, next poll will catch up */
    }
  }, [d.id]);

  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') poll();
    }, 5000);
    const c = setInterval(() => setNow(Date.now()), 30000);
    return () => {
      clearInterval(t);
      clearInterval(c);
    };
  }, [poll]);

  useEffect(() => {
    if (d.messages.length !== lastCount.current) {
      lastCount.current = d.messages.length;
      bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [d.messages.length]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' });
  }, []);

  async function act(body: Record<string, unknown>) {
    setBusy(true);
    setError('');
    try {
      const r = await fetch(`/api/chat/${d.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({ error: 'Something went wrong.' }));
      if (!r.ok) {
        setError(j.error || 'Something went wrong.');
        poll();
        return false;
      }
      setD(j);
      return true;
    } catch {
      setError('Network error — check your connection and try again.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function send(t = text) {
    if (!t.trim()) return;
    if (await act({ action: 'text', text: t })) setText('');
  }

  const isRenter = d.role === 'RENTER';
  const otherFirst = d.other.name.split(' ')[0];
  const q = range.start && range.end && !rangeError(d.item, range.start, range.end, d.today) ? quote(d.item, range.start, range.end, 'PICKUP', d.deliveryFee) : null;
  const rangeErr = range.start && range.end ? rangeError(d.item, range.start, range.end, d.today) : null;
  const pending = [...d.messages].reverse().find((m) => m.type === 'BOOKING_REQUEST' && m.requestStatus === 'PENDING');

  // Next card when there is no booking yet (requests only).
  let pre: { text: string; tone: 'action' | 'wait'; button?: { label: string; onClick?: () => void; href?: string } } | null = null;
  if (!d.booking || d.booking.status === 'CANCELLED') {
    if (pending && !pending.mine)
      pre = isRenter
        ? { text: `${otherFirst} suggested other dates (${day(pending.start!)} – ${day(pending.end!)}). Accept them or withdraw.`, tone: 'action', button: { label: 'See suggested dates', href: `#m-${pending.id}` } }
        : { text: 'New booking request — Accept / Decline / Suggest other dates.', tone: 'action', button: { label: 'Answer request', href: `#m-${pending.id}` } };
    else if (pending && pending.mine)
      pre = { text: isRenter ? `Waiting for ${otherFirst} to answer your booking request.` : `Waiting for ${otherFirst} to answer your suggested dates.`, tone: 'wait' };
    else if (isRenter && d.item.live) pre = { text: 'Pick your dates and send a booking request. You won’t pay yet.', tone: 'action', button: { label: 'Request dates', onClick: () => setModal({ kind: 'request' }) } };
    else if (!isRenter) pre = { text: `Answer ${otherFirst}’s questions. They send a booking request when they’re ready.`, tone: 'wait' };
  }

  const holdLeft = d.booking?.status === 'PENDING_PAYMENT' && d.booking.holdExpiresAt ? Math.max(0, new Date(d.booking.holdExpiresAt).getTime() - now) : 0;

  return (
    <>
      <section aria-label={`Chat with ${d.other.name}`} style={{ flex: '999 1 480px', minWidth: '0', display: 'flex', flexDirection: 'column', background: '#EFE8DA', borderRadius: '24px', overflow: 'hidden', minHeight: 'min(900px, calc(100vh - 160px))' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: '#FFFDF8', borderBottom: '1px solid #E3DACA', flexWrap: 'wrap' }}>
          <Link href="/chat" className="k-show-m" aria-label="Back to inbox" style={{ fontSize: '22px', textDecoration: 'none', marginRight: '-4px' }}>‹</Link>
          <span style={{ width: '44px', height: '44px', borderRadius: '50%', background: d.other.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flex: 'none' }}>{d.other.initials}</span>
          <span style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '150px' }}><b>{d.other.name}</b><span className="mute" style={{ fontSize: '12.5px' }}>{d.other.sub}</span></span>
          <Link href={`/items/${d.item.id}`} className="btn btn-o" style={{ minHeight: '40px', fontSize: '13px' }}>View item</Link>
        </header>
        {/* Item strip with its status */}
        <div className="k-strip" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', background: '#FFFDF8', borderBottom: '1px solid #E3DACA', fontSize: '13.5px' }}>
          <span style={{ width: '40px', height: '32px', borderRadius: '10px', overflow: 'hidden', background: '#BFD1BD', flex: 'none' }}>{d.item.photo && <img src={d.item.photo} alt="" className="k-photo" />}</span>
          <b style={{ flex: '1 1 140px', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.item.title}</b>
          {d.booking && d.booking.status !== 'CANCELLED' ? (
            <span className={`badge ${['PENDING_PAYMENT', 'RETURNED', 'DISPUTED'].includes(d.booking.status) ? 'b-wa' : 'b-ok'}`}>{d.booking.statusLabel} · {d.booking.code}</span>
          ) : (
            <span className={`badge ${d.item.live ? 'b-ok' : 'b-n'}`}>{d.item.live ? 'Available to book' : d.item.status === 'PAUSED' ? 'Paused by owner' : 'Not available'}</span>
          )}
        </div>
        {/* What do I do next? */}
        <div style={{ padding: '12px 16px', background: '#F6F1E7', borderBottom: '1px solid #E3DACA', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {d.booking && d.booking.status !== 'CANCELLED' ? (
            <>
              <ProgressBar steps={d.booking.steps} />
              {d.booking.status === 'PENDING_PAYMENT' ? (
                <div className="k-next" style={{ background: '#FFFDF8' }}>
                  <div className="k-next-t">
                    <small>{isRenter ? 'Next: pay to confirm' : `Waiting for ${otherFirst} to pay`}</small>
                    <b>Dates confirmed — pay within 12 h</b>
                    <span className="mute" style={{ fontSize: '13px' }}>{day(d.booking.start)} – {day(d.booking.end)} · {inr(d.booking.total)} incl. refundable deposit · <b style={{ color: holdLeft < 2 * 3600000 ? '#8E2A20' : '#1F4D3A' }}>{Math.floor(holdLeft / 3600000)} h {Math.floor((holdLeft % 3600000) / 60000)} min left</b></span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {isRenter && <Link className="k-btn p" href={`/book/${d.booking.id}`}>Continue to booking</Link>}
                    <button className="k-btn r sm" type="button" disabled={busy} onClick={() => { if (confirm(isRenter ? 'Cancel this booking? The dates will be released.' : 'Cancel this deal? The renter will be told and the dates released.')) act({ action: 'cancel', bookingId: d.booking!.id }); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <NextCard step={d.booking.next} who={isRenter ? otherFirst : otherFirst} />
              )}
            </>
          ) : pre ? (
            <div className={`k-next${pre.tone === 'wait' ? ' wait' : ''}`}>
              <div className="k-next-t"><small>{pre.tone === 'wait' ? 'Waiting' : 'Next'}</small><b>{pre.text}</b></div>
              {pre.button && (pre.button.href ? <a className="k-btn g sm" href={pre.button.href}>{pre.button.label}</a> : <button className="k-btn g sm" type="button" onClick={pre.button.onClick}>{pre.button.label}</button>)}
            </div>
          ) : null}
          {d.booking?.status === 'CANCELLED' && <p className="mute" style={{ fontSize: '12.5px' }}>Last booking {d.booking.code} was cancelled. <Link href={d.booking.href}>Details</Link></p>}
        </div>

        <div style={{ flex: '1', padding: '22px clamp(12px,3vw,22px)', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '70vh' }}>
          {d.messages.length === 0 && <p className="k-sys">Say hello — ask about the item, then send a booking request with your dates.</p>}
          {d.messages.map((m, i) => {
            const prevDay = i > 0 ? istDay(d.messages[i - 1].createdAt) : '';
            const thisDay = istDay(m.createdAt);
            return (
              <div key={m.id} id={`m-${m.id}`} style={{ display: 'contents' }}>
                {thisDay !== prevDay && <span style={{ alignSelf: 'center', fontSize: '12px', fontWeight: '700', color: '#60666C', padding: '4px 12px', borderRadius: '999px', background: 'rgba(255,253,248,.7)' }}>{thisDay === d.today ? 'Today' : day(thisDay)}</span>}
                <Message m={m} d={d} busy={busy} act={act} onCounter={(mm) => { setRange({ start: mm.start!, end: mm.end! }); setModal({ kind: 'counter', messageId: mm.id, start: mm.start!, end: mm.end! }); }} />
              </div>
            );
          })}
          <div ref={bottom}></div>
        </div>
        {error && <p className="k-alert err" role="alert" style={{ margin: '0 16px 8px' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '6px', padding: '8px 16px 0', flexWrap: 'wrap', background: '#FFFDF8' }}>
          {d.quickReplies.map((qr) => <button key={qr} type="button" className="badge b-n" style={{ border: 0, cursor: 'pointer', minHeight: '32px' }} disabled={busy} onClick={() => send(qr)}>{qr}</button>)}
        </div>
        <div style={{ padding: '10px 16px', background: '#FBEBCF', color: '#7A4708', fontSize: '12.5px', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center', order: 0 }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"></path></svg>Pay only on Kirayo. Phone numbers and exact address are shared after payment.</div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px 16px', background: '#FFFDF8' }}>
          {isRenter && d.item.live && (
            <button type="button" className="btn btn-o" style={{ minHeight: '46px', padding: '0 14px' }} onClick={() => setModal({ kind: 'request' })} aria-label="Request dates"><svg className="ic" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}><rect x="3.5" y="5" width="17" height="15" rx="3"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path></svg><span className="hide-m">Request dates</span></button>
          )}
          <label htmlFor="msg" className="k-sr">Message</label>
          <input id="msg" type="text" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Write a message…" autoComplete="off" style={{ flex: '1', minWidth: '0', minHeight: '46px', padding: '0 16px', borderRadius: '999px', border: '1.5px solid #E3DACA', font: "500 15px 'Plus Jakarta Sans',sans-serif" }} />
          <button type="submit" aria-label="Send" disabled={busy || !text.trim()} style={{ width: '46px', height: '46px', borderRadius: '50%', border: '0', background: '#C9491F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}><svg className="ic" viewBox="0 0 24 24"><path d="M4 12 20 4l-6 16-3-7z"></path></svg></button>
        </form>
      </section>

      <aside style={{ flex: '1 1 280px', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }} aria-label="Item" className="hide-m">
        <Link href={`/items/${d.item.id}`} style={{ background: '#FFFDF8', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(35,38,42,.06)', textDecoration: 'none', color: '#23262A' }}>
          <div style={{ height: '160px', background: '#BFD1BD', overflow: 'hidden' }}>{d.item.photo && <img src={d.item.photo} alt={d.item.title} className="k-photo" />}</div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <b>{d.item.title}</b>
            <span className="mute" style={{ fontSize: '13px' }}>{inr(d.item.pricePerDay)}/day{d.item.pricePerWeek ? ` · ${inr(d.item.pricePerWeek)}/week` : ''} · Deposit {inr(d.item.deposit)} · {d.item.area}</span>
          </div>
        </Link>
        <div style={{ background: '#FFFDF8', borderRadius: '24px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 1px 2px rgba(35,38,42,.06)' }}>
          <b style={{ fontSize: '14px' }}>Next steps</b>
          <ol style={{ margin: '0', paddingLeft: '18px', fontSize: '13.5px', color: '#474C52', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {(isRenter ? ['Agree dates in chat', 'Confirm booking summary', 'Verify ID (one time)', 'Pay rent + deposit', 'Pick up with your OTP', 'Return, get your deposit'] : ['Agree dates in chat', 'Renter pays', 'Hand over with the renter’s OTP', 'Check the return', 'Get paid']).map((s, i) => {
              const stage = d.booking ? { PENDING_PAYMENT: 1, CONFIRMED: isRenter ? 4 : 2, PICKED_UP: isRenter ? 5 : 3, RETURNED: isRenter ? 5 : 3, DISPUTED: isRenter ? 5 : 3, RETURN_CONFIRMED: isRenter ? 5 : 4, DEPOSIT_REFUNDED: 99, CANCELLED: 0 }[d.booking.status] ?? 0 : 0;
              return <li key={s}>{i < stage ? <span style={{ color: '#1E5A37' }}>✓ {s}</span> : i === stage ? <b style={{ color: '#1E5A37' }}>{s}</b> : s}</li>;
            })}
          </ol>
        </div>
      </aside>

      {modal && (
        <div className="k-modal" role="dialog" aria-modal="true" aria-label={modal.kind === 'request' ? 'Request dates' : 'Suggest other dates'} onClick={() => setModal(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="d" style={{ fontSize: '24px', fontWeight: 700 }}>{modal.kind === 'request' ? 'Request dates' : 'Suggest other dates'}</h2>
              <button type="button" onClick={() => setModal(null)} aria-label="Close" style={{ border: 0, background: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <p className="mute" style={{ fontSize: '13.5px' }}>{modal.kind === 'request' ? `Tap your pickup day, then your return day. Greyed days are booked. ${d.item.minDays > 1 ? `Minimum ${d.item.minDays} days. ` : ''}You won’t pay yet.` : `Was: ${day(modal.start)} – ${day(modal.end)}. Pick dates that work for you.`}</p>
            <RangeCalendar small today={d.today} unavailable={d.unavailable} value={range} onChange={(r) => { setError(''); setRange(r); }} onBlocked={setError} />
            {rangeErr && <p className="k-alert warn">{rangeErr}</p>}
            {q && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', padding: '12px 14px', borderRadius: '16px', background: '#F6F1E7' }}>
                <div className="kv"><span>{day(range.start!)} → {day(range.end!)}</span><b>{q.days} day{q.days > 1 ? 's' : ''}</b></div>
                <div className="kv"><span>{inr(d.item.pricePerDay)} × {q.days} days</span><span>{inr(q.dailyTotal)}</span></div>
                {q.weeklyDiscount > 0 && <div className="kv" style={{ color: '#1E5A37' }}><span>Weekly price</span><span>−{inr(q.weeklyDiscount)}</span></div>}
                <div className="kv" style={{ color: '#1E5A37' }}><span>Refundable deposit</span><span>{inr(q.deposit)}</span></div>
                <div className="kv" style={{ fontWeight: 800 }}><span>Total (pickup)</span><span>{inr(q.total)}</span></div>
                <span className="mute" style={{ fontSize: '12px' }}>Delivery, if offered, is a flat {inr(d.deliveryFee)} chosen at checkout.</span>
              </div>
            )}
            {error && <p className="k-alert err">{error}</p>}
            <button className="btn btn-p" type="button" disabled={!q || busy} onClick={async () => {
              const ok = modal.kind === 'request'
                ? await act({ action: 'request', start: range.start, end: range.end })
                : await act({ action: 'answer', answer: 'COUNTER', messageId: modal.messageId, start: range.start, end: range.end });
              if (ok) setModal(null);
            }}>{busy ? 'Sending…' : modal.kind === 'request' ? 'Send booking request' : 'Send suggested dates'}</button>
          </div>
        </div>
      )}
    </>
  );
}

function Message({ m, d, busy, act, onCounter }: { m: ThreadMsg; d: ThreadData; busy: boolean; act: (b: Record<string, unknown>) => Promise<boolean>; onCounter: (m: ThreadMsg) => void }) {
  if (m.type === 'SYSTEM') return <p className="k-sys">{m.text}</p>;
  if (m.type === 'TEXT')
    return (
      <div className={`bub ${m.mine ? 'me' : 'them'}`} style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {m.text}
        <div style={{ fontSize: '11px', color: m.mine ? '#BFD1BD' : '#60666C', textAlign: m.mine ? 'right' : 'left', marginTop: '4px' }}>{clock(m.createdAt)}{m.mine ? (m.read ? ' · Read' : ' · Sent') : ''}</div>
      </div>
    );
  const isRenter = d.role === 'RENTER';
  const otherFirst = d.other.name.split(' ')[0];
  const q = quote(d.item, m.start!, m.end!, 'PICKUP', d.deliveryFee);
  const pending = m.requestStatus === 'PENDING';
  const fromOwner = !m.fromRenter;
  const title = fromOwner ? (m.mine ? 'Dates you suggested' : `Counter offer from ${otherFirst}`) : m.mine ? 'Booking request · from you' : `Booking request from ${otherFirst}`;
  const badge = pending ? (m.mine ? ['Waiting for reply', 'b-n'] : ['Waiting for you', 'b-wa']) : ({ ACCEPTED: ['Accepted', 'b-ok'], DECLINED: ['Declined', 'b-n'], COUNTERED: ['Countered', 'b-n'], WITHDRAWN: ['Withdrawn', 'b-n'] } as Record<string, string[]>)[m.requestStatus ?? ''] ?? ['', 'b-n'];
  const highlight = pending && !m.mine;
  return (
    <div style={{ alignSelf: m.mine ? 'flex-end' : 'flex-start', width: 'min(440px,100%)', background: '#FFFDF8', borderRadius: '24px', overflow: 'hidden', boxShadow: highlight ? '0 2px 6px rgba(35,38,42,.06),0 18px 36px -16px rgba(31,77,58,.35)' : '0 1px 2px rgba(35,38,42,.06)', opacity: pending || m.requestStatus === 'ACCEPTED' ? 1 : 0.75 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '14px 16px', background: highlight ? '#1F4D3A' : 'transparent', color: highlight ? '#F6F1E7' : '#474C52' }}>
        <b style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}><rect x="3.5" y="5" width="17" height="15" rx="3"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path></svg>{title}</b>
        <span className={`badge ${badge[1]}`}>{badge[0]}</span>
      </div>
      <div style={{ padding: '4px 16px 14px', display: 'flex', flexDirection: 'column' }}>
        <div className="kv"><span className="mute">Pickup</span><b style={{ textDecoration: ['COUNTERED', 'DECLINED', 'WITHDRAWN'].includes(m.requestStatus ?? '') ? 'line-through' : 'none' }}>{day(m.start!)}</b></div>
        <div className="kv"><span className="mute">Return</span><b style={{ textDecoration: ['COUNTERED', 'DECLINED', 'WITHDRAWN'].includes(m.requestStatus ?? '') ? 'line-through' : 'none' }}>{day(m.end!)}</b></div>
        <div className="kv"><span className="mute">Rent</span><span>{q.weeklyDiscount > 0 ? `${q.days} days (weekly price) = ${inr(q.rent)}` : `${inr(d.item.pricePerDay)} × ${q.days} day${q.days > 1 ? 's' : ''} = ${inr(q.rent)}`}</span></div>
        <div className="kv"><span className="mute">Deposit</span><span>{inr(q.deposit)} refundable</span></div>
        <div style={{ fontSize: '11px', color: '#60666C', marginTop: '4px' }}>{clock(m.createdAt)}</div>
      </div>
      {pending && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 16px 16px' }}>
          {!m.mine && !isRenter && (
            <>
              <button className="btn btn-g" type="button" disabled={busy} style={{ flex: '1' }} onClick={() => act({ action: 'answer', answer: 'ACCEPT', messageId: m.id })}>Accept</button>
              <button className="btn btn-o" type="button" disabled={busy} style={{ flex: '1' }} onClick={() => onCounter(m)}>Suggest other dates</button>
              <button className="btn" type="button" disabled={busy} style={{ flex: '1 1 100%', background: 'transparent', color: '#8E2A20', minHeight: '40px' }} onClick={() => act({ action: 'answer', answer: 'DECLINE', messageId: m.id })}>Decline</button>
            </>
          )}
          {!m.mine && isRenter && (
            <>
              <button className="btn btn-g" type="button" disabled={busy} style={{ flex: '1' }} onClick={() => act({ action: 'answer', answer: 'ACCEPT', messageId: m.id })}>Accept dates</button>
              <button className="btn btn-o" type="button" disabled={busy} style={{ flex: '1' }} onClick={() => act({ action: 'answer', answer: 'WITHDRAW', messageId: m.id })}>Withdraw</button>
            </>
          )}
          {m.mine && isRenter && <button className="btn btn-o" type="button" disabled={busy} style={{ flex: '1' }} onClick={() => act({ action: 'answer', answer: 'WITHDRAW', messageId: m.id })}>Withdraw request</button>}
          {m.mine && !isRenter && <span className="mute" style={{ fontSize: '13px' }}>Waiting for {otherFirst} to accept.</span>}
        </div>
      )}
    </div>
  );
}
