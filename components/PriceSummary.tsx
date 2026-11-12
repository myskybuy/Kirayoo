import type { Booking } from '@prisma/client';
import { inr } from '@/lib/format';

/** Rent / deposit / delivery breakdown for a booking (renter view: no platform fee). */
export default function PriceSummary({ b, owner = false }: { b: Booking; owner?: boolean }) {
  const daily = b.pricePerDay * (b.days - 0);
  const baseRent = b.rentAmount - b.extensionAmount;
  const baseDays = b.days;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="kv"><span className="mute">{inr(b.pricePerDay)} × {baseDays} day{baseDays > 1 ? 's' : ''}{b.extensionAmount ? ' (incl. extension)' : ''}</span><span>{inr(Math.max(daily, b.rentAmount))}</span></div>
      {daily > b.rentAmount && <div className="kv" style={{ color: 'var(--kf-1e5a37)' }}><span>Weekly price discount</span><span>−{inr(daily - b.rentAmount)}</span></div>}
      {b.extensionAmount > 0 && <div className="kv"><span className="mute">of which extension</span><span>{inr(b.extensionAmount)}</span></div>}
      {b.deliveryFee > 0 && <div className="kv"><span className="mute">Delivery (drop-off + collection)</span><span>{inr(b.deliveryFee)}</span></div>}
      <div className="kv" style={{ color: 'var(--kf-1e5a37)', fontWeight: 600 }}><span>Refundable deposit</span><span>{inr(b.deposit)}</span></div>
      <div className="kv" style={{ fontWeight: 800, borderTop: '1px solid var(--kl-e3daca)', marginTop: '6px', paddingTop: '10px' }}><span>Total</span><span>{inr(b.total)}</span></div>
      {owner && (
        <>
          {b.platformFee > 0 && <div className="kv"><span className="mute">Kirayo fee (from your payout)</span><span>−{inr(b.platformFee)}</span></div>}
          <div className="kv" style={{ fontWeight: 700, color: 'var(--kf-1f4d3a)' }}><span>You earn (rent{b.platformFee ? ' − fee' : ''})</span><span>{inr(baseRent + b.extensionAmount - b.platformFee)}</span></div>
        </>
      )}
      <span className="mute" style={{ fontSize: '12.5px' }}>{b.paymentMode === 'CASH_AT_PICKUP' ? 'Paid in cash / UPI at pickup.' : b.paymentMode ? `Paid online (${b.paymentMode === 'DEMO' ? 'demo' : 'Razorpay'}).` : 'Not paid yet.'}</span>
    </div>
  );
}
