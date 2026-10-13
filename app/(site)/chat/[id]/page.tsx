import { notFound } from 'next/navigation';
import PageCss from '@/components/PageCss';
import ConversationList from '@/components/ConversationList';
import ChatThread from '@/components/ChatThread';
import { requireUser } from '@/lib/auth';
import { listConversations, markRead } from '@/lib/chat';
import { threadData } from '@/lib/thread';
import { BookingError } from '@/lib/bookings';
import { isDay } from '@/lib/format';
import { runDueJobs } from '@/lib/jobs';

export const metadata = { title: 'Chat' };

export default async function ChatPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ start?: string; end?: string; compose?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/chat/${id}`);
  await runDueJobs();
  let data;
  try {
    await markRead(id, user.id);
    data = await threadData(id, user.id);
  } catch (e) {
    if (e instanceof BookingError) notFound();
    throw e;
  }
  const convs = await listConversations(user.id);
  const compose = sp.compose ? { start: isDay(sp.start) ? sp.start : undefined, end: isDay(sp.end) ? sp.end : undefined } : undefined;
  return (
    <>
      <PageCss id="R07-Chat" />
      <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '20px clamp(8px,2vw,20px) 40px', boxSizing: 'border-box', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'stretch' }}>
        <ConversationList convs={convs} activeId={id} className="hide-m" />
        <ChatThread key={id} initial={data} compose={compose} />
      </div>
    </>
  );
}
