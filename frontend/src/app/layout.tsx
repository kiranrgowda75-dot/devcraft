import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'DevCraft — Precision Digital Craftsmanship',
  description:
    'Browse and buy premium, production-ready coding projects. Web apps, mobile apps, APIs, and more — ready to deploy.',
  keywords: ['coding projects', 'web app templates', 'buy source code', 'React', 'Spring Boot'],
  openGraph: {
    title: 'DevCraft — Precision Digital Craftsmanship',
    description: 'Browse and buy premium, production-ready coding projects.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
