import Link from 'next/link';
import { avatarColor, initials } from '@/lib/format';
import type { listConversations } from '@/lib/chat';

type Conv = Awaited<ReturnType<typeof listConversations>>[number];

/** R07 inbox list. */
export default function ConversationList({ convs, activeId, className, full }: { convs: Conv[]; activeId?: string; className?: string; full?: boolean }) {
  return (
    <aside className={className} aria-label="Conversations" style={{ flex: full ? '1 1 100%' : '1 1 260px', maxWidth: full ? '720px' : '300px', margin: full ? '0 auto' : undefined, width: full ? '100%' : undefined, background: '#FFFDF8', borderRadius: '24px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: '0 1px 2px rgba(35,38,42,.06)', alignSelf: 'flex-start' }}>
      <h2 className="d" style={{ fontSize: '22px', fontWeight: '700', padding: '4px 8px 10px' }}>Inbox</h2>
      {convs.length === 0 && <p className="mute" style={{ padding: '8px', fontSize: '14px' }}>No messages yet. Chats start when you message an owner from an item page.</p>}
      {convs.map((c) => {
        const other = c.role === 'RENTER' ? c.owner : c.renter;
        const last = c.messages[0];
        const preview = !last ? 'New conversation' : last.type === 'BOOKING_REQUEST' ? `Booking request · ${last.requestStatus?.toLowerCase()}` : last.text;
        const on = c.id === activeId;
        return (
          <Link key={c.id} className="conv" href={`/chat/${c.id}`} aria-current={on ? 'page' : undefined} style={on ? { background: '#EEF3EC', boxShadow: 'inset 0 0 0 1.5px #1F4D3A' } : undefined}>
            <span style={{ width: '44px', height: '44px', borderRadius: '50%', background: avatarColor(other.id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flex: 'none' }}>{initials(other.name)}</span>
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: '0', flex: '1' }}>
              <b style={{ fontSize: '14px' }}>{other.name} <span className="mute" style={{ fontWeight: 500, fontSize: '12px' }}>· {c.role === 'RENTER' ? 'owner' : 'renter'}</span></b>
              <span className="mute" style={{ fontSize: '12.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.item.title} · {preview}</span>
              {c.pendingForMe > 0 && <span style={{ fontSize: '12px', fontWeight: 700, color: '#A93C18' }}>Request waiting for you</span>}
            </span>
            {c.unread > 0 && <span style={{ minWidth: '22px', height: '22px', padding: '0 6px', borderRadius: '999px', background: '#C9491F', color: '#fff', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label={`${c.unread} unread`}>{c.unread}</span>}
          </Link>
        );
      })}
    </aside>
  );
}
