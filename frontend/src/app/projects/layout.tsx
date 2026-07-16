import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Premium Projects | DevCraftPro',
  description: 'Explore our catalog of premium, production-ready coding projects. Skip the boilerplate and accelerate your timeline with Web Apps, Mobile Apps, and APIs.',
  keywords: ['coding projects', 'nextjs templates', 'react native', 'spring boot api', 'source code marketplace'],
  openGraph: {
    title: 'Browse Premium Projects | DevCraftPro',
    description: 'Explore our catalog of premium, production-ready coding projects. Skip the boilerplate and accelerate your timeline.',
    type: 'website',
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
