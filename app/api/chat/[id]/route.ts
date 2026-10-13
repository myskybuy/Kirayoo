import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { answerRequest, markRead, sendRequest, sendText, type RequestAction } from '@/lib/chat';
import { BookingError, cancelBooking } from '@/lib/bookings';
import { threadData } from '@/lib/thread';
import { prisma } from '@/lib/db';
import { isDay } from '@/lib/format';

type Ctx = { params: Promise<{ id: string }> };

function fail(e: unknown) {
  if (e instanceof BookingError) return NextResponse.json({ error: e.message }, { status: 400 });
  console.error(e);
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
}

/** Chat polling (every 5 s): the whole thread state. Viewing marks messages read. */
export async function GET(_req: Request, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  const { id } = await ctx.params;
  try {
    await markRead(id, user.id);
    return NextResponse.json(await threadData(id, user.id), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return fail(e);
  }
}

/** Chat actions: text, booking request, answer a request, cancel a held booking. */
export async function POST(req: Request, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
  try {
    switch (body.action) {
      case 'text':
        await sendText(id, user.id, String(body.text ?? ''));
        break;
      case 'request': {
        const start = String(body.start), end = String(body.end);
        if (!isDay(start) || !isDay(end)) throw new BookingError('Pick a start and an end date.');
        await sendRequest(id, user.id, start, end);
        break;
      }
      case 'answer': {
        const action = String(body.answer) as RequestAction;
        if (!['ACCEPT', 'DECLINE', 'COUNTER', 'WITHDRAW'].includes(action)) throw new BookingError('Unknown action.');
        const msg = await prisma.message.findUnique({ where: { id: String(body.messageId) } });
        if (!msg || msg.conversationId !== id) throw new BookingError('Request not found.');
        const counter = body.start && body.end ? { start: String(body.start), end: String(body.end) } : undefined;
        if (counter && (!isDay(counter.start) || !isDay(counter.end))) throw new BookingError('Pick the dates you suggest.');
        await answerRequest(msg.id, user.id, action, counter);
        break;
      }
      case 'cancel': {
        const b = await prisma.booking.findUnique({ where: { id: String(body.bookingId) } });
        if (!b || b.conversationId !== id) throw new BookingError('Booking not found.');
        if (b.status !== 'PENDING_PAYMENT') throw new BookingError('Open the booking page to cancel a confirmed booking.');
        const role = b.renterId === user.id ? 'RENTER' : b.ownerId === user.id ? 'OWNER' : null;
        if (!role) throw new BookingError('Booking not found.');
        await cancelBooking(b.id, { role, userId: user.id }, String(body.reason || (role === 'RENTER' ? 'renter changed plans' : 'owner cancelled the deal')).slice(0, 200));
        break;
      }
      default:
        throw new BookingError('Unknown action.');
    }
    await markRead(id, user.id);
    return NextResponse.json(await threadData(id, user.id));
  } catch (e) {
    return fail(e);
  }
}
