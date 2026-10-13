import SiteHeader from '@/components/SiteHeader';
import MobileTabBar from '@/components/MobileTabBar';
import { currentPath } from '@/lib/path';

// Login / verify use the kit's compact header without footer (R05, R06);
// location (R02) uses the full header.
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const path = await currentPath();
  return (
    <div className="k-shell">
      <SiteHeader compact={!path.startsWith('/location')} />
      <main>{children}</main>
      {path.startsWith('/location') && <MobileTabBar />}
    </div>
  );
}
