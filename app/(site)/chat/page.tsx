import PageCss from '@/components/PageCss';
import ConversationList from '@/components/ConversationList';
import AutoRefresh from '@/components/AutoRefresh';
import { requireUser } from '@/lib/auth';
import { listConversations } from '@/lib/chat';

export const metadata = { title: 'Inbox' };

export default async function InboxPage() {
  const user = await requireUser('/chat');
  const convs = await listConversations(user.id);
  return (
    <>
      <PageCss id="R07-Chat" />
      <AutoRefresh seconds={5} />
      <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '20px 16px 40px', boxSizing: 'border-box', display: 'flex' }}>
        <ConversationList convs={convs} full />
      </div>
    </>
  );
}
