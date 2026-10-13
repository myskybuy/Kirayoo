import type { Tx } from './bookings';

/** Posts a SYSTEM message (status change) into a conversation and bumps it. */
export async function postSystem(db: Tx, conversationId: string | null | undefined, text: string, bookingId?: string) {
  if (!conversationId) return;
  await db.message.create({ data: { conversationId, type: 'SYSTEM', text, bookingId: bookingId ?? null } });
  await db.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
}
