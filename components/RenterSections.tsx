import type { FullBooking } from '@/lib/booking-view';

/** Status-specific sections of the renter booking page (filled in Phase 7). */
export default function RenterSections({ b }: { b: FullBooking }) {
  if (b.status === 'CONFIRMED' || b.status === 'PICKED_UP') {
    const code = b.status === 'CONFIRMED' ? b.pickupOtp : b.returnOtp;
    return (
      <section id="otp" className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h2 className="d" style={{ fontSize: '22px', fontWeight: '700' }}>{b.status === 'CONFIRMED' ? 'Your pickup code' : 'Your return code'}</h2>
        <p className="d" style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '.3em', color: '#1F4D3A' }}>{code}</p>
        <p className="mute">Show this to the owner at handover. Never share it before you have the item in your hands.</p>
      </section>
    );
  }
  return null;
}
