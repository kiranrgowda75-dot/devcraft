import type { Metadata } from 'next';
import './globals.css';
import RootLayoutClient from '@/components/RootLayoutClient';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'DevCraftPro — Precision Digital Craftsmanship',
  description:
    'Browse and buy premium, production-ready coding projects. Web apps, mobile apps, APIs, and more — ready to deploy.',
  keywords: ['coding projects', 'web app templates', 'buy source code', 'React', 'Spring Boot'],
  openGraph: {
    title: 'DevCraftPro — Precision Digital Craftsmanship',
    description: 'Browse and buy premium, production-ready coding projects.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <RootLayoutClient>{children}</RootLayoutClient>
        <Analytics />
      </body>
    </html>
  );
}
