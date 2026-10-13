import type { Booking } from '@prisma/client';
import { diffDays, dayOf, fmtDay, fmtTime, hoursLeft, todayIST } from '@/lib/format';
import { lateDays } from '@/lib/bookings';

type S = { label: string; sub: string; state: 'done' | 'now' | 'todo' };

/** R14 six-step rental status stepper. */
export function stepperFor(b: Booking): S[] {
  const today = todayIST();
  // index of the step that is "now"
  const nowIdx = b.status === 'DISPUTED' ? 4 : b.status === 'CANCELLED' ? -1 : { PENDING_PAYMENT: 0, CONFIRMED: 1, PICKED_UP: 2, RETURNED: 4, RETURN_CONFIRMED: 5, DEPOSIT_REFUNDED: 6 }[b.status as string] ?? 0;
  const late = lateDays(b);
  const steps: Omit<S, 'state'>[] = [
    { label: 'Booked', sub: b.confirmedAt ? fmtDay(b.confirmedAt) : b.holdExpiresAt ? `Pay within ${hoursLeft(b.holdExpiresAt)} h` : '' },
    { label: 'Picked up', sub: b.pickedUpAt ? fmtTime(b.pickedUpAt) : `On ${fmtDay(b.startDate)}` },
    { label: 'In use', sub: b.status === 'PICKED_UP' ? (late ? `${late} day${late > 1 ? 's' : ''} overdue` : `${Math.max(0, diffDays(today, dayOf(b.endDate)))} days left`) : `${b.days} day${b.days > 1 ? 's' : ''}` },
    { label: 'Returned', sub: b.returnedAt ? fmtTime(b.returnedAt) : `Due ${fmtDay(b.endDate)}` },
    { label: 'Return confirmed', sub: b.returnConfirmedAt ? fmtDay(b.returnConfirmedAt) : b.status === 'DISPUTED' ? 'Admin deciding' : 'By owner' },
    { label: 'Deposit refunded', sub: b.refundedAt ? fmtDay(b.refundedAt) : b.paymentMode === 'CASH_AT_PICKUP' ? 'In cash' : 'Within 48 h' },
  ];
  return steps.map((s, i) => ({ ...s, state: nowIdx === -1 ? (i === 0 ? 'done' : 'todo') : i < nowIdx ? 'done' : i === nowIdx ? 'now' : 'todo' }));
}

export default function BookingStepper({ booking }: { booking: Booking }) {
  const steps = stepperFor(booking);
  return (
    <section className="card" style={{ padding: '24px', overflowX: 'auto' }} aria-label="Rental status">
      {booking.status === 'CANCELLED' && <p className="k-alert err" style={{ marginBottom: '14px' }}>Cancelled{booking.cancelReason ? ` — ${booking.cancelReason}` : ''}</p>}
      <ol style={{ listStyle: 'none', margin: '0', padding: '0', display: 'grid', gridTemplateColumns: 'repeat(6,minmax(120px,1fr))', minWidth: '760px' }}>
        {steps.map((s, i) => (
          <li key={s.label}>
            <div className="stepbtn" aria-current={s.state === 'now' ? 'step' : undefined} style={{ width: '100%' }}>
              <span style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: s.state === 'done' ? '#1F4D3A' : s.state === 'now' ? '#C9491F' : '#FFFDF8', color: s.state === 'todo' ? '#60666C' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', boxShadow: s.state === 'now' ? '0 0 0 6px #FBE3D8' : s.state === 'todo' ? 'inset 0 0 0 2px #D9CEB8' : 'none', flex: 'none' }}>{s.state === 'done' ? '✓' : i + 1}</span>
                <span style={{ flex: '1', height: '3px', background: i === steps.length - 1 ? 'transparent' : s.state === 'done' ? '#1F4D3A' : '#E3DACA', margin: '0 8px', borderRadius: '2px' }}></span>
              </span>
              <b style={{ fontSize: '14px', color: s.state === 'todo' ? '#60666C' : '#23262A' }}>{s.label}</b>
              <span style={{ fontSize: '12px', color: '#60666C' }}>{s.sub}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
