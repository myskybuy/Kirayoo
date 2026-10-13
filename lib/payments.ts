// Payments: Razorpay TEST mode when keys exist (Orders API + Checkout +
// server-side signature check + Refunds API), otherwise a demo mode where
// payments are simulated and refunds are simply marked REFUNDED.
import crypto from 'node:crypto';
import Razorpay from 'razorpay';

export const razorpayEnabled = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

let client: Razorpay | null = null;
function rz() {
  if (!client) client = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
  return client;
}

/** Creates a Razorpay order for `amount` rupees. */
export async function createOrder(amount: number, receipt: string, notes: Record<string, string> = {}) {
  const order = await rz().orders.create({ amount: amount * 100, currency: 'INR', receipt: receipt.slice(0, 40), notes });
  return { id: order.id, amount: Number(order.amount), currency: order.currency };
}

/** Verifies the Checkout signature: HMAC_SHA256(order_id|payment_id, key_secret). */
export function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Server-side check that the payment really is captured/authorized for this order and amount. */
export async function fetchPaymentOk(paymentId: string, orderId: string, amount: number): Promise<boolean> {
  try {
    const p = await rz().payments.fetch(paymentId);
    return p.order_id === orderId && Number(p.amount) === amount * 100 && (p.status === 'captured' || p.status === 'authorized');
  } catch {
    return false;
  }
}

export type RefundResult = { ok: true; refundId: string } | { ok: false; error: string };

/**
 * Refunds `amount` rupees of a payment. Demo payments (id starts with "demo_")
 * or no Razorpay keys → a demo refund id is returned immediately.
 */
export async function refundPayment(paymentId: string | null, amount: number): Promise<RefundResult> {
  if (amount <= 0) return { ok: true, refundId: 'none' };
  if (!paymentId || paymentId.startsWith('demo_') || !razorpayEnabled()) return { ok: true, refundId: `demo_rfnd_${crypto.randomBytes(6).toString('hex')}` };
  try {
    const r = await rz().payments.refund(paymentId, { amount: amount * 100, speed: 'normal' });
    return { ok: true, refundId: r.id };
  } catch (e) {
    const msg = (e as { error?: { description?: string } })?.error?.description || (e as Error).message || 'Refund failed';
    return { ok: false, error: msg };
  }
}

export const demoPaymentId = () => `demo_pay_${crypto.randomBytes(8).toString('hex')}`;
