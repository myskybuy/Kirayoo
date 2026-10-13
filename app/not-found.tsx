import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import NotFoundBody from '@/components/states/NotFoundBody';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="k-shell">
      <SiteHeader />
      <main><NotFoundBody /></main>
      <SiteFooter />
    </div>
  );
}
