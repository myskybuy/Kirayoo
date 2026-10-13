import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import MobileTabBar from '@/components/MobileTabBar';
import { getUser } from '@/lib/auth';
import { unreadCount } from '@/lib/header';
import { currentPath } from '@/lib/path';

// Screens that use the kit's compact header (R04, R07, R08–R11).
const COMPACT = ['/items', '/chat', '/book', '/pay', '/verify-id'];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  const path = await currentPath();
  const unread = user ? await unreadCount(user.id) : 0;
  const compact = COMPACT.some((p) => path.startsWith(p));
  return (
    <div className="k-shell">
      <SiteHeader compact={compact} />
      <main>{children}</main>
      <SiteFooter />
      <MobileTabBar unread={unread} />
    </div>
  );
}
