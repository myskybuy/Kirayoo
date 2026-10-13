import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { BookingError } from '@/lib/bookings';
import { createOrder, razorpayEnabled } from '@/lib/payments';
import { payTarget } from '@/lib/pay-target';

// Creates a Razorpay order (test mode) — or tells the client to use demo mode.
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  try {
    const t = await payTarget(user, String(body.bookingId), body.extensionId ? String(body.extensionId) : null);
    if (!razorpayEnabled()) return NextResponse.json({ mode: 'demo', amount: t.amount });
    const order = await createOrder(t.amount, t.receipt, { bookingId: t.booking.id, ...(t.ext ? { extensionId: t.ext.id } : {}) });
    if (t.ext) await prisma.extensionRequest.update({ where: { id: t.ext.id }, data: { razorpayOrderId: order.id } });
    else await prisma.booking.update({ where: { id: t.booking.id }, data: { razorpayOrderId: order.id } });
    return NextResponse.json({
      mode: 'razorpay',
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name: 'Kirayo',
      description: `${t.booking.item.title} · ${t.booking.code}${t.ext ? ' · extension' : ''}`,
      prefill: { name: user.name, email: user.email, contact: user.phone ?? '' },
    });
  } catch (e) {
    if (e instanceof BookingError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'Could not start the payment. Please try again.' }, { status: 500 });
  }
}
