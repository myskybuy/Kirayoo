import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { BookingError, confirmPayment, payExtension } from '@/lib/bookings';
import { demoPaymentId, razorpayEnabled } from '@/lib/payments';
import { payTarget } from '@/lib/pay-target';

// Demo payment (no Razorpay keys): "Pay" succeeds, "Simulate failed payment" fails.
export async function POST(req: Request) {
  if (razorpayEnabled()) return NextResponse.json({ error: 'Demo payments are off when Razorpay keys are set.' }, { status: 400 });
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  try {
    const t = await payTarget(user, String(body.bookingId), body.extensionId ? String(body.extensionId) : null);
    if (body.outcome === 'fail') return NextResponse.json({ ok: false, failed: true, reason: 'Simulated failure — the bank declined the payment.' });
    const paymentId = demoPaymentId();
    if (t.ext) {
      await payExtension(t.ext.id, user.id, paymentId);
      return NextResponse.json({ ok: true, redirect: `/bookings/${t.booking.id}?ok=${encodeURIComponent('Extension paid.')}` });
    }
    const r = await confirmPayment(t.booking.id, { mode: 'DEMO', paymentId, amount: t.amount });
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error, redirect: `/bookings/${t.booking.id}` });
    return NextResponse.json({ ok: true, redirect: `/bookings/${t.booking.id}/confirmed` });
  } catch (e) {
    if (e instanceof BookingError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
