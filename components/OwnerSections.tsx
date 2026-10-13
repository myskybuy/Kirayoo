import Link from 'next/link';
import type { FullBooking } from '@/lib/booking-view';
import { claimAmountFor, isOnline, lateDays, payoutFor } from '@/lib/bookings';
import { RETURN_CONFIRM_HOURS, MAX_CONDITION_PHOTOS } from '@/lib/constants';
import { dayOf, diffDays, fmtDay, fmtTime, hoursLeft, inr, todayIST } from '@/lib/format';
import { conditionAction, noShowAction, pickupAction, respondExtensionAction, returnAction, returnOkAction } from '@/app/actions/bookings';
import PhotoUploader from './PhotoUploader';
import OtpInput from './OtpInput';
import ConditionPairs from './ConditionPairs';
import ClaimForm from './ClaimForm';
import ConfirmButton from './ConfirmButton';

function PhotoStep({ b, stage, n, title, done }: { b: FullBooking; stage: 'PICKUP' | 'RETURN'; n: number; title: string; done?: boolean }) {
  const mine = b.conditionReports.find((r) => r.stage === stage && r.byUserId === b.ownerId);
  const theirs = b.conditionReports.find((r) => r.stage === stage && r.byUserId === b.renterId);
  return (
    <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span className="k-sn">{done || (mine && mine.photos.length >= 2) ? '✓' : n}</span><b style={{ fontSize: '17px', flex: '1' }}>{title}</b><span style={{ fontSize: '13px', fontWeight: '700', color: mine && mine.photos.length >= 2 ? '#1E5A37' : '#7A4708' }}>{mine ? `${mine.photos.length} saved` : 'At least 2'}</span></div>
      <form action={conditionAction} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="hidden" name="bookingId" value={b.id} />
        <input type="hidden" name="stage" value={stage} />
        <PhotoUploader kind="condition" name="photos" max={MAX_CONDITION_PHOTOS} initial={mine?.photos ?? []} tile={120} label="Add photo" />
        <label className="k-lbl">Anything already damaged? (optional)<input className="k-in" name="notes" defaultValue={mine?.notes ?? ''} maxLength={500} placeholder="e.g. small scuff on the bottom plate" /></label>
        <button className="k-btn o" type="submit" style={{ alignSelf: 'flex-start' }}>{mine ? 'Update photos' : 'Save photos'}</button>
      </form>
      <p className="mute" style={{ fontSize: '13px' }}>{theirs ? `The renter also added ${theirs.photos.length} photo${theirs.photos.length > 1 ? 's' : ''}.` : 'The renter can add their own photos too.'} Both sets are used if there’s a deposit claim.</p>
    </section>
  );
}

/** Owner booking page body by status (O06 pickup, return handover, O07 check/claim, settlement). */
export default function OwnerSections({ b }: { b: FullBooking }) {
  const r = b.renter.name.split(' ')[0];
  const today = todayIST();
  const cash = b.paymentMode === 'CASH_AT_PICKUP';
  const ext = b.extensions.find((e) => e.status === 'PENDING');
  const late = lateDays(b);

  if (b.status === 'PENDING_PAYMENT')
    return <section className="card" style={{ padding: '22px' }}><b>Waiting for {r} to pay.</b><p className="mute">The dates are held until {b.holdExpiresAt ? fmtTime(b.holdExpiresAt) : '—'}. If {r} doesn’t pay by then, the booking is cancelled and the dates are free again.</p></section>;

  if (b.status === 'CONFIRMED') {
    const myPhotos = b.conditionReports.find((x) => x.stage === 'PICKUP' && x.byUserId === b.ownerId);
    const ready = !!myPhotos && myPhotos.photos.length >= 2;
    const canHand = dayOf(b.startDate) <= today;
    return (
      <div id="handover" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ flex: '999 1 440px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span className="k-sn">i</span><b style={{ fontSize: '17px' }}>Pickup handover · {fmtDay(b.startDate)}</b></div>
            <p style={{ fontSize: '14px', color: '#474C52' }}>{b.mode === 'DELIVERY' ? `Deliver to: ${b.address}` : `${r} picks it up from you.`} Renter phone: {b.renter.phone ?? 'ask in chat'}. Show {r} everything in the bag, take photos, {cash ? `collect ${inr(b.total)}, ` : ''}then enter {r}’s code.</p>
          </section>
          <PhotoStep b={b} stage="PICKUP" n={1} title="Your condition photos at pickup" />
        </div>
        <aside style={{ flex: '1 1 340px', minWidth: '0' }}>
          <form action={pickupAction} style={{ borderRadius: '28px', background: '#EDE5D5', padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="hidden" name="bookingId" value={b.id} />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span className="k-sn" style={{ background: '#C9491F' }}>2</span><b style={{ fontSize: '17px' }}>Enter {r}’s pickup code</b></div>
            {cash && (
              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', borderRadius: '16px', background: '#FFFDF8', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" name="cash" style={{ width: '20px', height: '20px', accentColor: '#1F4D3A', margin: '1px 0 0', flex: 'none' }} />
                <span><b>I collected {inr(b.total)}</b> in cash / UPI (rent {inr(b.rentAmount + b.deliveryFee)} + deposit {inr(b.deposit)}).</span>
              </label>
            )}
            <OtpInput />
            <p className="mute" style={{ fontSize: '13.5px', textAlign: 'center' }}>{r} sees it on their booking page. Enter it only after {r} has the item.</p>
            {!canHand && <p className="k-alert info">You can hand over from {fmtDay(b.startDate)}.</p>}
            {canHand && !ready && <p className="k-alert warn">Save at least 2 condition photos first.</p>}
            <button className="k-btn g" type="submit" disabled={!canHand || !ready}>Confirm handover</button>
          </form>
          {today > dayOf(b.startDate) && (
            <form action={noShowAction} className="card" style={{ padding: '18px', marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input type="hidden" name="bookingId" value={b.id} />
              <b>{r} didn’t come?</b>
              <span className="mute" style={{ fontSize: '13px' }}>{cash ? 'Nothing was paid online, so no money moves.' : `${r} gets the deposit and delivery fee back; you keep 1 day’s rent (${inr(Math.min(b.pricePerDay, b.rentAmount))}).`} The dates are freed.</span>
              <ConfirmButton message={`Mark that ${r} didn’t come? This cancels the booking.`} className="k-btn r sm">Renter didn’t come</ConfirmButton>
            </form>
          )}
        </aside>
      </div>
    );
  }

  if (b.status === 'PICKED_UP') {
    const ret = b.conditionReports.find((x) => x.stage === 'RETURN' && x.byUserId === b.ownerId);
    const ready = !!ret && ret.photos.length >= 2;
    const left = diffDays(today, dayOf(b.endDate));
    return (
      <>
        <section style={{ borderRadius: '28px', background: late ? '#A93C18' : '#1F4D3A', color: '#F6F1E7', padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }} role={late ? 'alert' : undefined}>
          <div style={{ flex: '1 1 300px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: late ? '#FFE9DF' : '#E8643C' }}>{late ? 'Overdue' : 'Out on rent'}</span>
            <h2 className="d" style={{ fontSize: '28px', fontWeight: '700' }}>{late ? `${late} day${late > 1 ? 's' : ''} late — was due ${fmtDay(b.endDate)}` : `${left} day${left === 1 ? '' : 's'} left · due back ${fmtDay(b.endDate)}`}</h2>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>{late ? `You can claim a late fee of up to ${inr(Math.min(b.deposit, late * b.pricePerDay))} (${inr(b.pricePerDay)}/day) after the return.` : `Picked up ${b.pickedUpAt ? fmtTime(b.pickedUpAt) : ''}.`}</p>
          </div>
        </section>
        {ext && (
          <section id="extension" className="card" style={{ padding: '22px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 260px' }}><b style={{ fontSize: '17px' }}>{r} asked to extend until {fmtDay(ext.newEndDate)}</b><p className="mute" style={{ fontSize: '14px' }}>+{ext.extraDays} day{ext.extraDays > 1 ? 's' : ''} · {inr(ext.extraAmount)} {cash ? 'paid to you in cash / UPI' : `paid online by ${r} after you accept`}.</p></div>
            <form action={respondExtensionAction}><input type="hidden" name="bookingId" value={b.id} /><input type="hidden" name="extensionId" value={ext.id} /><input type="hidden" name="answer" value="decline" /><button className="k-btn r" type="submit">Decline</button></form>
            <form action={respondExtensionAction}><input type="hidden" name="bookingId" value={b.id} /><input type="hidden" name="extensionId" value={ext.id} /><input type="hidden" name="answer" value="accept" /><button className="k-btn g" type="submit">Accept</button></form>
          </section>
        )}
        {b.extensions.find((e) => e.status === 'ACCEPTED') && <p className="k-alert info">Extension accepted — waiting for {r} to pay {inr(b.extensions.find((e) => e.status === 'ACCEPTED')!.extraAmount)}.</p>}
        <div id="handover" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ flex: '999 1 440px', minWidth: '0' }}><PhotoStep b={b} stage="RETURN" n={1} title="Condition photos at return" /></div>
          <aside style={{ flex: '1 1 340px', minWidth: '0' }}>
            <form action={returnAction} style={{ borderRadius: '28px', background: '#FBE3D8', padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="hidden" name="bookingId" value={b.id} />
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span className="k-sn" style={{ background: '#A93C18' }}>2</span><b style={{ fontSize: '17px' }}>Enter {r}’s return code</b></div>
              <OtpInput />
              <p style={{ fontSize: '13.5px', color: '#5E2A12', textAlign: 'center' }}>Enter it when you have the item back. That stops the rental clock.</p>
              {!ready && <p className="k-alert warn">Save at least 2 return photos first.</p>}
              <button className="k-btn g" type="submit" disabled={!ready}>Confirm return</button>
            </form>
          </aside>
        </div>
        <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <b style={{ fontSize: '17px' }}>Condition photos (pickup vs return)</b>
          <ConditionPairs reports={b.conditionReports} ownerId={b.ownerId} renterId={b.renterId} />
        </section>
      </>
    );
  }

  if (b.status === 'RETURNED' && !b.claim) {
    const until = new Date((b.returnedAt ?? new Date()).getTime() + RETURN_CONFIRM_HOURS * 3600000);
    const lateAtReturn = lateDays(b, b.returnedAt ?? new Date());
    const payout = isOnline(b) ? payoutFor(b, 0) : 0;
    return (
      <div id="confirm" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '16px', background: '#DCEEDF', color: '#1E5A37', fontWeight: '700', fontSize: '14px' }}>✓ Return code entered · {b.returnedAt ? fmtTime(b.returnedAt) : ''}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '16px', background: lateAtReturn ? '#F7DCD7' : '#DCEEDF', color: lateAtReturn ? '#8E2A20' : '#1E5A37', fontWeight: '700', fontSize: '14px' }}>{lateAtReturn ? `${lateAtReturn} day${lateAtReturn > 1 ? 's' : ''} late (due ${fmtDay(b.endDate)})` : `✓ On time (due ${fmtDay(b.endDate)})`}</span>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', background: '#FBEBCF', color: '#7A4708', fontWeight: '700', fontSize: '13px' }}>{hoursLeft(until)} h left · auto-confirms after</span>
        </div>
        <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <b style={{ fontSize: '17px' }}>Pickup vs return photos</b>
          <ConditionPairs reports={b.conditionReports} ownerId={b.ownerId} renterId={b.renterId} />
        </section>
        <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))' }}>
          <form action={returnOkAction} style={{ display: 'contents' }}>
            <input type="hidden" name="bookingId" value={b.id} />
            <button className="k-choice" type="submit" style={{ background: '#FFFDF8', boxShadow: 'inset 0 0 0 1px #E3DACA', color: '#23262A' }}>
              <svg className="ic" viewBox="0 0 24 24" style={{ width: '28px', height: '28px', color: '#1F4D3A' }}><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
              <b style={{ fontSize: '17px' }}>All OK</b><span className="mute" style={{ fontSize: '13.5px' }}>{cash ? `Hand the ${inr(b.deposit)} deposit back to ${r} in cash.` : `Full ${inr(b.deposit)} goes back to ${r}. Your ${inr(payout)} payout is created.`}</span>
            </button>
          </form>
          <a className="k-choice" href="#claim" style={{ background: '#F7DCD7', boxShadow: 'inset 0 0 0 2px #B3372B', color: '#23262A', textDecoration: 'none' }}>
            <svg className="ic" viewBox="0 0 24 24" style={{ width: '28px', height: '28px', color: '#B3372B' }}><path d="M12 3.5 2.5 20h19z"></path><path d="M12 10v4.5M12 17.3v.2"></path></svg>
            <b style={{ fontSize: '17px' }}>Claim damage / late fee</b><span className="mute" style={{ fontSize: '13.5px' }}>Damage, missing part or late return. {r} can accept or dispute.</span>
          </a>
        </div>
        <div id="claim"><ClaimForm bookingId={b.id} deposit={b.deposit} renterFirst={r} lateDays={lateAtReturn} pricePerDay={b.pricePerDay} /></div>
      </div>
    );
  }

  if (b.status === 'RETURNED' || b.status === 'DISPUTED' || ((b.status === 'RETURN_CONFIRMED' || b.status === 'DEPOSIT_REFUNDED') && b.claim)) {
    const c = b.claim!;
    return (
      <>
        <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}><b style={{ fontSize: '17px' }}>Your claim</b><span className="badge" style={{ padding: '4px 10px', borderRadius: '999px', background: '#F7DCD7', color: '#8E2A20', fontSize: '12px', fontWeight: '700' }}>{inr(c.amount)} of {inr(b.deposit)}{c.lateFee ? ` · incl. late fee ${inr(c.lateFee)}` : ''}</span></div>
          <p style={{ color: '#474C52' }}>{c.reason}</p>
          {c.photos.length > 0 && <div className="k-thumbs">{c.photos.map((p) => <a key={p} href={p} target="_blank" rel="noreferrer"><img src={p} alt="Claim evidence" className="k-photo" /></a>)}</div>}
          <div className="k-kv"><span className="mute">Status</span><b>{c.status === 'OPEN' ? `Waiting for ${r} (auto-accepted after 48 h)` : c.status === 'ACCEPTED' ? `${r} accepted` : c.status === 'DISPUTED' ? `${r} disputed — admin is deciding` : `Admin decided ${inr(c.adminDecisionAmount ?? 0)}`}</b></div>
          {c.renterNote && <div className="k-kv"><span className="mute">{r}’s note</span><span>{c.renterNote}</span></div>}
          {c.adminNote && <div className="k-kv"><span className="mute">Admin’s note</span><span>{c.adminNote}</span></div>}
        </section>
        <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <b style={{ fontSize: '17px' }}>Pickup vs return photos</b>
          <ConditionPairs reports={b.conditionReports} ownerId={b.ownerId} renterId={b.renterId} />
        </section>
        <Settlement b={b} />
      </>
    );
  }

  if (b.status === 'RETURN_CONFIRMED' || b.status === 'DEPOSIT_REFUNDED') return <Settlement b={b} />;

  if (b.status === 'CANCELLED')
    return (
      <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <b style={{ fontSize: '17px' }}>Cancelled {b.cancelledAt ? fmtTime(b.cancelledAt) : ''}</b>
        <p className="mute">{b.cancelReason}</p>
        {b.ownerKeepAmount > 0 && <p>You keep {inr(b.ownerKeepAmount)} (1 day’s rent){b.payout ? ` — payout ${inr(b.payout.amount)} ${b.payout.status === 'PAID' ? 'paid' : 'scheduled'}` : ''}.</p>}
      </section>
    );
  return null;
}

function Settlement({ b }: { b: FullBooking }) {
  const claim = claimAmountFor(b.claim);
  const cash = b.paymentMode === 'CASH_AT_PICKUP';
  const r = b.renter.name.split(' ')[0];
  const reviewed = b.reviews.some((x) => x.fromUserId === b.ownerId);
  return (
    <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h2 className="d" style={{ fontSize: '22px', fontWeight: '700' }}>Settlement</h2>
      <div className="k-kv"><span>Deposit</span><b>{inr(b.deposit)}</b></div>
      {claim > 0 && <div className="k-kv" style={{ color: '#1E5A37' }}><span>Kept for your claim</span><b>{inr(claim)}</b></div>}
      <div className="k-kv"><span>Back to {r}</span><b>{inr(b.deposit - claim)}{cash ? ' (you return it in cash)' : ''}</b></div>
      {!cash && (
        <div className="k-kv" style={{ fontWeight: 800, color: '#1F4D3A' }}><span>Your payout (rent{b.platformFee ? ' − fee' : ''}{claim ? ' + claim' : ''})</span><span>{b.payout ? `${inr(b.payout.amount)} · ${b.payout.status === 'PAID' ? `paid${b.payout.reference ? ` (${b.payout.reference})` : ''}` : 'scheduled'}` : b.status === 'DEPOSIT_REFUNDED' ? '—' : 'after the deposit refund'}</span></div>
      )}
      {cash && <p className="mute" style={{ fontSize: '13px' }}>Cash booking: Kirayo records it but moves no money.</p>}
      {(b.status === 'DEPOSIT_REFUNDED' || b.status === 'RETURN_CONFIRMED') && !reviewed && <Link className="k-btn p" href={`/owner/bookings/${b.id}/review`} style={{ alignSelf: 'flex-start' }}>Rate {r}</Link>}
    </section>
  );
}

