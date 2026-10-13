import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getOrCreateConversation } from '@/lib/chat';
import { BookingError } from '@/lib/bookings';
import { currentPath } from '@/lib/path';

/** "Chat with owner" / "Request to book": opens (or creates) the chat for this item. */
export default async function NewChatPage({ searchParams }: { searchParams: Promise<{ item?: string; start?: string; end?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser(await currentPath());
  if (!sp.item) redirect('/chat');
  let convId: string;
  try {
    convId = (await getOrCreateConversation(sp.item, user.id)).id;
  } catch (e) {
    if (e instanceof BookingError) redirect(`/items/${sp.item}`);
    throw e;
  }
  const q = new URLSearchParams();
  if (sp.start && sp.end) {
    q.set('compose', '1');
    q.set('start', sp.start);
    q.set('end', sp.end);
  }
  redirect(`/chat/${convId}${q.size ? `?${q}` : ''}`);
}
