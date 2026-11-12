import type { Booking } from '@prisma/client';
import { cancellationTerms } from '@/lib/bookings';
import { cancelBookingAction } from '@/app/actions/bookings';
import ConfirmButton from './ConfirmButton';

/** Cancel (before pickup) with the policy outcome spelled out. */
export default function CancelBox({ b, role }: { b: Booking; role: 'RENTER' | 'OWNER' }) {
  if (b.status !== 'PENDING_PAYMENT' && b.status !== 'CONFIRMED') return null;
  const t = cancellationTerms(b, role);
  return (
    <details className="card" style={{ padding: '18px 22px' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--kf-8e2a20)' }}>Cancel this booking</summary>
      <form action={cancelBookingAction} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
        <input type="hidden" name="bookingId" value={b.id} />
        <p style={{ fontSize: '14px' }}>{role === 'OWNER' && b.status === 'CONFIRMED' ? `${t.text} Owner cancellations are recorded on your profile.` : t.text}</p>
        <label className="k-lbl">Reason (shown to the other side)<input className="k-in" name="reason" maxLength={200} placeholder={role === 'RENTER' ? 'Plans changed' : 'Item not available'} /></label>
        <ConfirmButton message="Cancel this booking? This can’t be undone." className="k-btn r">Cancel booking</ConfirmButton>
      </form>
    </details>
  );
}
