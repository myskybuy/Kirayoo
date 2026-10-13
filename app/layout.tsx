import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: { default: 'Kirayo — rent from people near you', template: '%s · Kirayo' },
  description: 'Rent cameras, tools, party gear, tents and more from verified neighbours in India.',
  icons: { icon: '/design/assets/icons/logo-mark.svg' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#1F4D3A' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="stylesheet" href="/design/assets/css/kirayo.css" />
        <link rel="stylesheet" href="/app.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
