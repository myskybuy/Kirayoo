import type { Metadata, Viewport } from 'next';
import SiteMotion from '@/components/SiteMotion';
import { THEME_BOOT } from '@/lib/theme';

export const metadata: Metadata = {
  title: { default: 'Kirayo — rent from people near you', template: '%s · Kirayo' },
  description: 'Rent cameras, tools, party gear, tents and more from verified neighbours in India.',
  icons: { icon: '/design/assets/icons/logo-mark.svg' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#1F4D3A' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme is set by THEME_BOOT before React hydrates, so the attribute differs on purpose.
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <link rel="stylesheet" href="/design/assets/css/kirayo.css" />
        <link rel="stylesheet" href="/theme.css" />
        <link rel="stylesheet" href="/app.css" />
      </head>
      <body>
        <div className="k-progress" aria-hidden="true" />
        {children}
        <SiteMotion />
      </body>
    </html>
  );
}
