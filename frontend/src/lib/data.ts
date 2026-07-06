// Hardcoded sample projects — used until we wire in the real API
export interface Project {
  id: number;
  title: string;
  shortDesc: string;
  description: string;
  price: number;
  category: string;
  techStack: string[];
  thumbnailUrl: string;
  screenshotUrls: string[];
  demoVideoUrl: string | null;
  status: 'ACTIVE' | 'DRAFT';
}

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Nexus Analytics Dashboard',
    shortDesc: 'High-performance analytics template with 15+ pre-built chart components.',
    description:
      'A production-ready analytics dashboard built with React and Tailwind CSS. Includes 15+ pre-built chart and data-grid components, dark/light mode toggle, role-based access control, and full REST API integration.',
    price: 149,
    category: 'Web App',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Spring Boot'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    screenshotUrls: [],
    demoVideoUrl: 'https://youtube.com/watch?v=demo1',
    status: 'ACTIVE',
  },
  {
    id: 2,
    title: 'Aura E-Commerce Engine',
    shortDesc: 'Headless commerce boilerplate with Stripe integration and full cart state.',
    description:
      'A complete headless e-commerce boilerplate built on Next.js. Features product catalog, cart state management, checkout flow, Stripe payment integration, and an admin dashboard.',
    price: 299,
    category: 'Web App',
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'Zustand'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    screenshotUrls: [],
    demoVideoUrl: null,
    status: 'ACTIVE',
  },
  {
    id: 3,
    title: 'CoreAuth Microservice',
    shortDesc: 'JWT authentication service with RBAC, rate limiting, and Docker support.',
    description:
      'A robust, production-grade authentication microservice built with Spring Boot. Features JWT token auth, refresh tokens, role-based access control, rate limiting, and Docker support.',
    price: 99,
    category: 'API / Backend',
    techStack: ['Spring Boot', 'Java 17', 'PostgreSQL', 'Docker', 'JWT', 'Redis'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80',
    screenshotUrls: [],
    demoVideoUrl: null,
    status: 'ACTIVE',
  },
  {
    id: 4,
    title: 'SwiftTask Mobile App',
    shortDesc: 'Cross-platform task manager with offline sync and Kanban board.',
    description:
      'A cross-platform React Native task management app with offline-first sync, push notifications, team workspaces, drag-and-drop Kanban board, and Firebase backend.',
    price: 199,
    category: 'Mobile App',
    techStack: ['React Native', 'Expo', 'Firebase', 'TypeScript', 'Redux Toolkit'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    screenshotUrls: [],
    demoVideoUrl: 'https://youtube.com/watch?v=demo4',
    status: 'ACTIVE',
  },
];
