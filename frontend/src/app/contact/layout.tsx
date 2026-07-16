import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | DevCraftPro Support & Sales',
  description: 'Have questions about our projects or need custom digital craftsmanship? Contact our technical support and sales team today.',
  keywords: ['contact devcraftpro', 'technical support', 'custom project request', 'custom software development'],
  openGraph: {
    title: 'Contact Us | DevCraftPro Support & Sales',
    description: 'Have questions about our projects or need custom digital craftsmanship? Contact our technical support and sales team today.',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
