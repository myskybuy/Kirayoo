import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { BookingError, confirmPayment, payExtension } from '@/lib/bookings';
import { fetchPaymentOk, verifySignature } from '@/lib/payments';

// Razorpay Checkout success handler → server-side signature + payment check →
// atomic, idempotent confirmation.
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const orderId = String(body.razorpay_order_id || '');
  const paymentId = String(body.razorpay_payment_id || '');
  const signature = String(body.razorpay_signature || '');
  try {
    if (!verifySignature(orderId, paymentId, signature)) throw new BookingError('Payment could not be verified.');
    if (body.extensionId) {
      const ext = await prisma.extensionRequest.findUnique({ where: { id: String(body.extensionId) }, include: { booking: true } });
      if (!ext || ext.booking.renterId !== user.id || ext.razorpayOrderId !== orderId) throw new BookingError('Payment does not match this extension.');
      if (!(await fetchPaymentOk(paymentId, orderId, ext.extraAmount))) throw new BookingError('Payment not received.');
      await payExtension(ext.id, user.id, paymentId);
      return NextResponse.json({ ok: true, redirect: `/bookings/${ext.bookingId}?ok=${encodeURIComponent('Extension paid.')}` });
    }
    const b = await prisma.booking.findUnique({ where: { id: String(body.bookingId) } });
    if (!b || b.renterId !== user.id || b.razorpayOrderId !== orderId) throw new BookingError('Payment does not match this booking.');
    if (!(await fetchPaymentOk(paymentId, orderId, b.total))) throw new BookingError('Payment not received.');
    const r = await confirmPayment(b.id, { mode: 'RAZORPAY', paymentId, orderId, amount: b.total });
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error, redirect: `/bookings/${b.id}` });
    return NextResponse.json({ ok: true, redirect: `/bookings/${b.id}/confirmed` });
  } catch (e) {
    if (e instanceof BookingError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'Something went wrong while confirming. If money was taken it will be refunded.' }, { status: 500 });
  }
}
