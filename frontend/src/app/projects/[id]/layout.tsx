import { Metadata } from 'next';

type Props = {
  params: any;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Fetch project details from the backend URL to generate server-side SEO metadata
    const res = await fetch(`https://spring-boot-production-6abb.up.railway.app/api/projects/${id}`, {
      next: { revalidate: 3600 } // cache for 1 hour
    });
    
    if (!res.ok) throw new Error('Failed to fetch project');
    const project = await res.json();
    
    return {
      title: `${project.title} | DevCraftPro`,
      description: project.shortDesc,
      openGraph: {
        title: `${project.title} | DevCraftPro`,
        description: project.shortDesc,
        images: [{ url: project.thumbnailUrl }],
        type: 'website',
      },
    };
  } catch (error) {
    return {
      title: 'Project Details | DevCraftPro',
      description: 'Discover premium, pre-built engineering projects and accelerate your timeline.',
    };
  }
}

export default function ProjectDetailLayout({ children }: Props) {
  return <>{children}</>;
}
