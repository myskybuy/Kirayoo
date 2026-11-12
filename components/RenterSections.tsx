import Link from 'next/link';
import type { FullBooking } from '@/lib/booking-view';
import { claimAmountFor, isOnline, lateDays, occupiedDays } from '@/lib/bookings';
import { CLAIM_RESPONSE_HOURS, COMPLAINT_REASONS, MAX_CONDITION_PHOTOS, RETURN_CONFIRM_HOURS } from '@/lib/constants';
import { addDays, dayOf, diffDays, fmtDay, fmtTime, hoursLeft, inr, todayIST } from '@/lib/format';
import { complaintAction, conditionAction, respondClaimAction } from '@/app/actions/bookings';
import PhotoUploader from './PhotoUploader';
import ConditionPairs from './ConditionPairs';
import ExtensionForm from './ExtensionForm';

function Code({ code, title, text, tone }: { code: string; title: string; text: string; tone: 'green' | 'peach' }) {
  const green = tone === 'green';
  return (
    <section id="otp" style={{ borderRadius: '28px', background: green ? 'var(--kb-1f4d3a)' : 'var(--kb-fbe3d8)', color: green ? 'var(--kf-f6f1e7)' : 'var(--kf-23262a)', padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span className="k-sn" style={green ? { background: 'var(--kb-e8643c)', color: 'var(--kf-23262a)' } : { background: 'var(--kb-a93c18)' }}>#</span><b style={{ fontSize: '17px' }}>{title}</b></div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }} aria-label={`${title} ${code.split('').join(' ')}`}>{code.split('').map((d, i) => <span key={i} className="k-dg" style={green ? undefined : { color: 'var(--kf-a93c18)' }}>{d}</span>)}</div>
      <p style={{ fontSize: '14px', color: green ? 'var(--kf-dce6da)' : 'var(--kf-5e2a12)', textAlign: 'center' }}>{text}</p>
    </section>
  );
}

function MyPhotos({ b, stage }: { b: FullBooking; stage: 'PICKUP' | 'RETURN' }) {
  const mine = b.conditionReports.find((r) => r.stage === stage && r.byUserId === b.renterId);
  return (
    <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span className="k-sn">{mine ? '✓' : '1'}</span><b style={{ fontSize: '17px', flex: '1' }}>Your condition photos at {stage === 'PICKUP' ? 'pickup' : 'return'}</b><span className="mute" style={{ fontSize: '13px' }}>Optional · recommended</span></div>
      <p className="mute" style={{ fontSize: '14px' }}>Photograph the item from a few angles. If there’s ever a damage claim, your photos sit next to the owner’s.</p>
      <form action={conditionAction} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="hidden" name="bookingId" value={b.id} />
        <input type="hidden" name="stage" value={stage} />
        <PhotoUploader kind="condition" name="photos" max={MAX_CONDITION_PHOTOS} initial={mine?.photos ?? []} tile={120} label="Add photo" />
        <label className="k-lbl">Anything already damaged? (optional)<input className="k-in" name="notes" defaultValue={mine?.notes ?? ''} maxLength={500} /></label>
        <button className="k-btn o" type="submit" style={{ alignSelf: 'flex-start' }}>{mine ? 'Update my photos' : 'Save my photos'}</button>
      </form>
    </section>
  );
}

function Problem({ b }: { b: FullBooking }) {
  const open = b.complaints.find((c) => c.status === 'OPEN' && c.byUserId === b.renterId);
  return (
    <details id="problem" className="card" style={{ padding: '18px 22px' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Report a problem to Kirayo</summary>
      {open && <p className="k-alert info" style={{ marginTop: '10px' }}>You reported “{open.reason}” on {fmtTime(open.createdAt)}. Admin will get back to you.</p>}
      <form action={complaintAction} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
        <input type="hidden" name="bookingId" value={b.id} />
        <label className="k-lbl">What’s wrong?<select className="k-in" name="reason">{COMPLAINT_REASONS.map((r) => <option key={r}>{r}</option>)}</select></label>
        <label className="k-lbl">Details<textarea className="k-in" name="text" required minLength={10} maxLength={1000} placeholder="What happened, and when?"></textarea></label>
        <PhotoUploader kind="complaint" name="photos" max={6} tile={100} label="Add photo" />
        <button className="k-btn r" type="submit" style={{ alignSelf: 'flex-start' }}>Send report</button>
      </form>
    </details>
  );
}

/** Renter booking page body by status. */
export default async function RenterSections({ b }: { b: FullBooking }) {
  const o = b.owner.name.split(' ')[0];
  const today = todayIST();
  const cash = b.paymentMode === 'CASH_AT_PICKUP';

  if (b.status === 'PENDING_PAYMENT')
    return (
      <section style={{ borderRadius: '28px', background: 'var(--kb-1f4d3a)', color: 'var(--kf-f6f1e7)', padding: '26px', display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--kf-e8643c)' }}>Dates held for you</span>
          <h2 className="d" style={{ fontSize: '28px', fontWeight: '700', lineHeight: '1.1' }}>Pay within {b.holdExpiresAt ? hoursLeft(b.holdExpiresAt) : 0} h to confirm</h2>
          <p style={{ fontSize: '14.5px', opacity: 0.9 }}>Hold ends {b.holdExpiresAt ? fmtTime(b.holdExpiresAt) : ''}. After that the dates go back to everyone.</p>
        </div>
        <Link className="btn" href={`/book/${b.id}`} style={{ background: 'var(--kb-fffdf8)', color: 'var(--kf-1f4d3a)' }}>Continue to booking</Link>
      </section>
    );

  if (b.status === 'CONFIRMED')
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flex: '999 1 420px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--kf-c9491f)' }}>Pickup handover · with {o}</span>
            <h2 className="d" style={{ fontSize: '26px', fontWeight: '700', lineHeight: '1.1' }}>Check it, snap it, then share your code</h2>
            <p style={{ fontSize: '14px', color: 'var(--kf-474c52)' }}>{b.mode === 'DELIVERY' ? `${o} delivers to ${b.address} on ${fmtDay(b.startDate)}.` : `Pick it up from ${o} on ${fmtDay(b.startDate)} — ${b.owner.address ?? b.item.area}.`} {o}’s phone: {b.owner.phone ?? 'ask in chat'}.{cash ? ` Pay ${inr(b.total)} in cash / UPI before taking the item.` : ''}</p>
          </section>
          <MyPhotos b={b} stage="PICKUP" />
        </div>
        <aside style={{ flex: '1 1 320px', minWidth: '0' }}>
          <Code code={b.pickupOtp} title="Your pickup code" tone="green" text={`${o} types this when you have the item in your hands. Something wrong with the item? Don’t share the code — message ${o} or report a problem.`} />
          <div style={{ marginTop: '14px' }}><Problem b={b} /></div>
        </aside>
      </div>
    );

  if (b.status === 'PICKED_UP') {
    const late = lateDays(b);
    const left = diffDays(today, dayOf(b.endDate));
    const total = Math.max(1, diffDays(dayOf(b.startDate), dayOf(b.endDate)));
    const pct = Math.min(100, Math.max(4, Math.round((diffDays(dayOf(b.startDate), today) / total) * 100)));
    const ext = b.extensions[0];
    const occ = await occupiedDays(b.itemId, addDays(dayOf(b.endDate), 1), addDays(dayOf(b.endDate), 60), b.id);
    const lateFee = Math.min(b.deposit, late * b.pricePerDay);
    return (
      <>
        {late > 0 ? (
          <section role="alert" style={{ borderRadius: '32px', background: 'var(--kb-a93c18)', color: 'var(--kf-ffffff)', padding: 'clamp(24px,4vw,40px)', display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '5px 12px', borderRadius: '999px', background: 'rgba(255,255,255,.16)', fontSize: '12.5px', fontWeight: '700' }}>Overdue · {b.item.title} · {b.code}</span>
              <h2 className="d" style={{ fontSize: 'clamp(40px,5.4vw,72px)', fontWeight: '700', lineHeight: '.95' }}>{late} day{late > 1 ? 's' : ''} late</h2>
              <p style={{ color: 'var(--kf-ffe9df)' }}>Was due back to {o} on <b style={{ color: 'var(--kf-ffffff)' }}>{fmtDay(b.endDate)}</b>. {o} can claim {inr(b.pricePerDay)} per late day from your deposit.</p>
            </div>
            <div style={{ flex: '1 1 280px', padding: '20px', borderRadius: '22px', background: 'rgba(255,255,255,.1)', display: 'flex', flexDirection: 'column' }}>
              <div className="k-kv"><span>Deposit</span><b>{inr(b.deposit)}</b></div>
              <div className="k-kv"><span>Late fee so far ({late} day{late > 1 ? 's' : ''})</span><b>− {inr(lateFee)}</b></div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,.25)', margin: '6px 0' }}></div>
              <div className="k-kv" style={{ fontSize: '17px' }}><span>Back if returned today</span><b>{inr(b.deposit - lateFee)}</b></div>
              <span style={{ fontSize: '12.5px', color: 'var(--kf-ffe9df)' }}>Goes up by {inr(b.pricePerDay)} each day. You get a reminder email daily.</span>
            </div>
          </section>
        ) : (
          <section style={{ borderRadius: '32px', background: 'var(--kb-1f4d3a)', color: 'var(--kf-f6f1e7)', padding: 'clamp(24px,4vw,40px)', display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
              <span style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', background: 'rgba(246,241,231,.12)', fontSize: '12.5px', fontWeight: '700' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--kb-7fd19c)' }}></span>In use · {b.item.title}</span>
              <h2 className="d" style={{ fontSize: 'clamp(44px,6vw,80px)', fontWeight: '700', lineHeight: '.95' }}>{left === 0 ? <>Due <span style={{ color: 'var(--kf-e8643c)' }}>today</span></> : <>{left} day{left > 1 ? 's' : ''} <span style={{ color: 'var(--kf-e8643c)' }}>left</span></>}</h2>
              <p style={{ color: 'var(--kf-dce6da)' }}>Return to {o} by <b style={{ color: 'var(--kf-ffffff)' }}>{fmtDay(b.endDate)}</b>. Late returns cost {inr(b.pricePerDay)} per extra day from your deposit.</p>
            </div>
            <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--kf-dce6da)' }}><span>{fmtDay(b.startDate)}</span><span>{fmtDay(b.endDate)}</span></div>
              <div style={{ height: '12px', borderRadius: '6px', background: 'rgba(246,241,231,.15)', overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', borderRadius: '6px', background: 'var(--kb-e8643c)' }}></div></div>
              <span style={{ fontSize: '13px', color: 'var(--kf-dce6da)' }}>Day {Math.min(total, diffDays(dayOf(b.startDate), today) + 1)} of {total}</span>
            </div>
          </section>
        )}
        <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(200px,100%),1fr))' }}>
          <a className="k-act" href="#extension" style={{ background: 'var(--kb-eef3ec)', boxShadow: 'inset 0 0 0 2px var(--kl-1f4d3a)', color: 'var(--kf-23262a)' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '26px', height: '26px', color: 'var(--kf-1f4d3a)' }}><rect x="3.5" y="5" width="17" height="15" rx="3"></rect><path d="M3.5 10h17M8 3v4M16 3v4M12 13v4M10 15h4"></path></svg><b style={{ fontSize: '16px' }}>Extend rental</b><span className="mute" style={{ fontSize: '13px' }}>Ask {o} for more days</span></a>
          <a className="k-act" href="#problem" style={{ background: 'var(--kb-fffdf8)', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)', color: 'var(--kf-23262a)' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '26px', height: '26px', color: 'var(--kf-b3372b)' }}><path d="M12 3.5 2.5 20h19z"></path><path d="M12 10v4.5M12 17.3v.2"></path></svg><b style={{ fontSize: '16px' }}>Report a problem</b><span className="mute" style={{ fontSize: '13px' }}>Not working, missing part, damage</span></a>
          <a className="k-act" href="#otp" style={{ background: 'var(--kb-c9491f)', color: 'var(--kf-ffffff)' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '26px', height: '26px' }}><path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4"></path><path d="m9 13 2.2 2.2L15.5 11"></path></svg><b style={{ fontSize: '16px' }}>Return</b><span style={{ fontSize: '13px', color: 'var(--kf-ffe9df)' }}>Show your return code</span></a>
          {b.conversationId && <Link className="k-act" href={`/chat/${b.conversationId}`} style={{ background: 'var(--kb-fffdf8)', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)', color: 'var(--kf-23262a)' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '26px', height: '26px', color: 'var(--kf-1f4d3a)' }}><path d="M5 18.5V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9z"></path></svg><b style={{ fontSize: '16px' }}>Message {o}</b><span className="mute" style={{ fontSize: '13px' }}>{b.owner.phone ?? ''}</span></Link>}
        </div>
        {ext?.status === 'PENDING' ? (
          <p id="extension" className="k-alert info">You asked to extend until {fmtDay(ext.newEndDate)} ({inr(ext.extraAmount)}). Waiting for {o} to answer.</p>
        ) : ext?.status === 'ACCEPTED' && isOnline(b) ? (
          <section id="extension" className="k-next"><div className="k-next-t"><small>Next</small><b>{o} accepted your extension to {fmtDay(ext.newEndDate)}. Pay {inr(ext.extraAmount)} to lock it in.</b></div><Link className="k-btn p" href={`/pay/${b.id}?ext=${ext.id}`}>Pay {inr(ext.extraAmount)}</Link></section>
        ) : (
          <>
            {ext?.status === 'DECLINED' && <p className="k-alert warn">{o} declined your last extension request.</p>}
            {ext?.status === 'PAID' && <p className="k-alert ok">Extended until {fmtDay(ext.newEndDate)}.</p>}
            <ExtensionForm bookingId={b.id} start={dayOf(b.startDate)} end={dayOf(b.endDate)} pricePerDay={b.pricePerDay} pricePerWeek={b.pricePerWeek} rentAmount={b.rentAmount} ownerFirst={o} unavailable={[...occ.booked, ...occ.blocked]} maxDays={b.item.maxDays} cash={cash} />
          </>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ flex: '999 1 420px', minWidth: 0 }}><MyPhotos b={b} stage="RETURN" /></div>
          <aside style={{ flex: '1 1 320px', minWidth: 0 }}><Code code={b.returnOtp} title="Your return code" tone="peach" text={`${o} enters this when they have the item back. That stops the rental clock, so you’re never charged late.`} /></aside>
        </div>
        <Problem b={b} />
      </>
    );
  }

  if ((b.status === 'RETURNED' || b.status === 'DISPUTED') && b.claim) {
    const c = b.claim;
    const until = new Date(c.createdAt.getTime() + CLAIM_RESPONSE_HOURS * 3600000);
    return (
      <div id="claim" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ flex: '999 1 520px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--kf-b3372b)' }}>Deposit claim · {b.code}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}><b>{o}’s claim</b><span style={{ padding: '4px 10px', borderRadius: '999px', background: 'var(--kb-f7dcd7)', color: 'var(--kf-8e2a20)', fontSize: '12px', fontWeight: '700' }}>{inr(c.amount)} of {inr(b.deposit)}</span></div>
            <p style={{ color: 'var(--kf-474c52)' }}>“{c.reason}”</p>
            {c.lateFee > 0 && <p className="mute" style={{ fontSize: '13px' }}>Includes a late fee of {inr(c.lateFee)}.</p>}
            {c.photos.length > 0 && <div className="k-thumbs">{c.photos.map((p) => <a key={p} href={p} target="_blank" rel="noreferrer"><img src={p} alt="Claim evidence" className="k-photo" /></a>)}</div>}
            <ConditionPairs reports={b.conditionReports} ownerId={b.ownerId} renterId={b.renterId} />
          </section>
          {c.status === 'OPEN' ? (
            <form action={respondClaimAction} className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="hidden" name="bookingId" value={b.id} />
              <b style={{ fontSize: '17px' }}>Your response · {hoursLeft(until)} h left</b>
              <label htmlFor="rsp" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--kf-474c52)' }}>If you disagree, tell the admin what happened</label>
              <textarea id="rsp" name="note" className="k-in" maxLength={600} placeholder="Your side of the story"></textarea>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="k-btn o" type="submit" name="answer" value="accept">Accept {inr(c.amount)}</button>
                <button className="k-btn" type="submit" name="answer" value="dispute" style={{ background: 'var(--kb-b3372b)', color: 'var(--kf-ffffff)' }}>Dispute · send to admin</button>
              </div>
              <span className="mute" style={{ fontSize: '12.5px' }}>No answer in {CLAIM_RESPONSE_HOURS} h means the claim is accepted.</span>
            </form>
          ) : (
            <p className="k-alert info">You disputed this claim{c.renterNote ? `: “${c.renterNote}”` : ''}. Kirayo admin is comparing both condition reports and will decide the amount.</p>
          )}
        </div>
        <aside style={{ flex: '1 1 320px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="card" style={{ padding: '22px' }}>
            <b className="d" style={{ fontSize: '19px', display: 'block', marginBottom: '6px' }}>Your deposit</b>
            <div className="k-kv"><span>Deposit held</span><b>{inr(b.deposit)}</b></div>
            <div className="k-kv" style={{ color: 'var(--kf-8e2a20)' }}><span>Claimed</span><b>− {inr(c.amount)}</b></div>
            <div className="k-kv" style={{ color: 'var(--kf-1e5a37)' }}><span>Back to you if accepted</span><b>{inr(b.deposit - c.amount)}</b></div>
          </section>
          <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <b style={{ fontSize: '15px' }}>What happens</b>
            <div className="k-tl"><span className="k-dot" style={{ background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)' }}>✓</span><span><b>Claim filed</b><br /><span className="mute" style={{ fontSize: '13px' }}>{fmtTime(c.createdAt)}</span></span></div>
            <div className="k-tl"><span className="k-dot" style={c.status === 'OPEN' ? { background: 'var(--kb-c9491f)', color: 'var(--kf-ffffff)' } : { background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)' }}>{c.status === 'OPEN' ? '2' : '✓'}</span><span><b>Your response</b><br /><span className="mute" style={{ fontSize: '13px' }}>Accept or dispute within 48 h</span></span></div>
            <div className="k-tl"><span className="k-dot" style={c.status === 'DISPUTED' ? { background: 'var(--kb-c9491f)', color: 'var(--kf-ffffff)' } : { boxShadow: 'inset 0 0 0 2px var(--kl-d9ceb8)', color: 'var(--kf-60666c)' }}>3</span><span><b>Admin decides</b><br /><span className="mute" style={{ fontSize: '13px' }}>Only if you dispute · final amount</span></span></div>
          </section>
        </aside>
      </div>
    );
  }

  if (b.status === 'RETURNED') {
    const until = new Date((b.returnedAt ?? new Date()).getTime() + RETURN_CONFIRM_HOURS * 3600000);
    return (
      <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '999px', background: 'var(--kb-dceedf)', color: 'var(--kf-1e5a37)', fontWeight: '800', fontSize: '13px' }}>✓ Returned {b.returnedAt ? fmtTime(b.returnedAt) : ''}</span>
        <b style={{ fontSize: '16px' }}>{o} has {hoursLeft(until)} h to check it.</b>
        <p className="mute" style={{ fontSize: '13.5px' }}>If {o} marks it OK (or doesn’t respond), your {inr(b.deposit)} deposit is {cash ? 'handed back in cash' : 'refunded automatically'}.</p>
        <ConditionPairs reports={b.conditionReports} ownerId={b.ownerId} renterId={b.renterId} />
      </section>
    );
  }

  if (b.status === 'RETURN_CONFIRMED' || b.status === 'DEPOSIT_REFUNDED') {
    const claim = claimAmountFor(b.claim);
    const refund = b.deposit - claim;
    const r = b.refunds.find((x) => x.kind === 'DEPOSIT');
    const lateFee = b.claim?.lateFee && (b.claim.status === 'ACCEPTED' || b.claim.status === 'RESOLVED') ? Math.min(b.claim.lateFee, claim) : 0;
    const reviewed = b.reviews.some((x) => x.fromUserId === b.renterId);
    return (
      <>
        <section style={{ borderRadius: '32px', background: claim ? 'var(--kb-fbebcf)' : 'var(--kb-dceedf)', padding: 'clamp(24px,4vw,40px)', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: claim ? 'var(--kf-7a4708)' : 'var(--kf-1e5a37)' }}>Deposit · {b.code} · {b.item.title}</span>
            <h2 className="d" style={{ fontSize: 'clamp(40px,5vw,64px)', fontWeight: '700', lineHeight: '1', color: 'var(--kf-1f4d3a)' }}>{inr(refund)} <span style={{ fontSize: '.5em', color: 'var(--kf-474c52)' }}>back to you</span></h2>
            <p style={{ color: 'var(--kf-474c52)' }}>{cash ? `${o} hands the deposit back in cash.` : r?.status === 'REFUNDED' ? `${inr(refund)} refunded to your original payment method · refund id ${r.refundId}.` : r?.status === 'FAILED' ? 'The refund hit a snag — Kirayo admin is retrying it.' : refund === 0 ? 'The full deposit went to the owner for the claim.' : 'The refund is being processed.'}{claim ? ` ${inr(claim)} went to ${o} for the claim.` : ` ${o} confirmed the item came back fine.`}</p>
          </div>
          <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px', borderRadius: '22px', background: 'rgba(255,253,248,.75)' }}>
            <div className="k-tl"><span className="k-dot" style={{ background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)' }}>✓</span><span><b>Returned</b><br /><span className="mute" style={{ fontSize: '13px' }}>{b.returnedAt ? fmtTime(b.returnedAt) : ''}</span></span></div>
            <div className="k-tl"><span className="k-dot" style={{ background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)' }}>✓</span><span><b>{b.claim ? 'Claim settled' : 'Owner confirmed: all OK'}</b><br /><span className="mute" style={{ fontSize: '13px' }}>{b.returnConfirmedAt ? fmtTime(b.returnConfirmedAt) : ''}</span></span></div>
            <div className="k-tl"><span className="k-dot" style={b.status === 'DEPOSIT_REFUNDED' ? { background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)' } : { background: 'var(--kb-c9491f)', color: 'var(--kf-ffffff)', boxShadow: '0 0 0 5px var(--kl-fbe3d8)' }}>{b.status === 'DEPOSIT_REFUNDED' ? '✓' : '•'}</span><span><b>{cash ? 'Deposit returned in cash' : 'Refund sent'}</b><br /><span className="mute" style={{ fontSize: '13px' }}>{b.refundedAt ? fmtTime(b.refundedAt) : 'In progress'}</span></span></div>
          </div>
        </section>
        <section className="card" style={{ padding: '24px' }}>
          <h2 className="d" style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px' }}>Breakdown</h2>
          <div className="k-kv"><span>Deposit paid</span><b>{inr(b.deposit)}</b></div>
          <div className="k-kv"><span>Late return fee</span>{lateFee ? <b>− {inr(lateFee)}</b> : <span className="mute">₹0 · returned on time</span>}</div>
          {claim - lateFee > 0 && <div className="k-kv"><span>Damage / missing parts</span><b>− {inr(claim - lateFee)}</b></div>}
          <div className="k-kv" style={{ fontWeight: '800', fontSize: '19px', color: 'var(--kf-1f4d3a)' }}><span>Refund</span><span>{inr(refund)}</span></div>
        </section>
        {!reviewed && (
          <section className="card" style={{ padding: '22px 24px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
            <b style={{ fontSize: '16px' }}>All good on both sides. How was renting from {o}?</b>
            <Link className="btn" href={`/bookings/${b.id}/review`} style={{ background: 'var(--kb-c9491f)', color: 'var(--kf-ffffff)' }}>Leave a review</Link>
          </section>
        )}
      </>
    );
  }

  if (b.status === 'CANCELLED') {
    return (
      <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <b style={{ fontSize: '17px' }}>Cancelled {b.cancelledAt ? fmtTime(b.cancelledAt) : ''}</b>
        <p className="mute">{b.cancelReason}</p>
        {b.refunds.map((r) => <div key={r.id} className="k-kv"><span>Refund ({r.kind === 'CONFLICT' ? 'dates were taken' : 'cancellation'})</span><b>{inr(r.amount)} · {r.status === 'REFUNDED' ? `refunded${r.refundId ? ` · ${r.refundId}` : ''}` : r.status === 'FAILED' ? 'retrying' : 'processing'}</b></div>)}
        {b.ownerKeepAmount > 0 && <div className="k-kv"><span>Kept for the owner (1 day’s rent)</span><b>{inr(b.ownerKeepAmount)}</b></div>}
        <Link className="k-btn g" href="/browse" style={{ alignSelf: 'flex-start' }}>Find something else</Link>
      </section>
    );
  }
  return null;
}
