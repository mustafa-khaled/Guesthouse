import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'),
  title: {
    template: '%s | Serene Stays',
    default: 'Serene Stays — A garden retreat for rest and renewal',
  },
  description:
    'Suites, garden spa rituals, and unhurried wellness packages in a warm sanctuary designed for rest and renewal.',
  openGraph: {
    title: 'Serene Stays',
    description:
      'Suites, garden spa rituals, and unhurried wellness packages in a warm sanctuary designed for rest and renewal.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#f6f2e8',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/newsreader-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/instrument-sans-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-surface text-ink min-h-screen antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
