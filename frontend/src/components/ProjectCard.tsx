import Image from 'next/image';
import Link from 'next/link';
import { Project } from '@/lib/data';

interface ProjectCardProps {
  project: Project;
}

// Category → badge color mapping
const CATEGORY_COLORS: Record<string, string> = {
  'Web App':     'badge-blue',
  'Mobile App':  'badge-green',
  'API / Backend': 'bg-purple-50 text-purple-700 badge',
  'ML / AI':     'bg-orange-50 text-orange-700 badge',
  'Game':        'bg-red-50 text-red-700 badge',
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const categoryClass = CATEGORY_COLORS[project.category] ?? 'badge-gray';

  return (
    <article
      className="card flex flex-col group"
      id={`project-card-${project.id}`}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
        <Image
          src={project.thumbnailUrl}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category badge overlay */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className={categoryClass}>{project.category}</span>
          {project.techStack.slice(0, 1).map((tech) => (
            <span key={tech} className="badge-gray">{tech}</span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Title */}
        <h3 className="font-display font-semibold text-base text-navy-900 leading-snug mb-2 group-hover:text-brand-600 transition-colors">
          {project.title}
        </h3>

        {/* Short description */}
        <p className="text-sm text-gray-500 leading-relaxed flex-1">
          {project.shortDesc}
        </p>

        {/* Footer row: verified + price + CTA */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          {/* Verified badge */}
          <span className="verified-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#9ca3af" strokeWidth="1.2"/>
              <path d="M5 8l2 2 4-4" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Verified
          </span>

          {/* Price */}
          <span className="font-display font-bold text-navy-900 text-base">
            ₹{project.price.toLocaleString('en-IN')}
          </span>
        </div>

        {/* View details link */}
        <Link
          href={`/projects/${project.id}`}
          className="mt-3 w-full text-center py-2.5 px-4 text-sm font-medium text-navy-900 border border-gray-200 
                     rounded-lg hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-all duration-200"
          id={`project-card-link-${project.id}`}
        >
          View Details →
        </Link>
      </div>
    </article>
  );
}
