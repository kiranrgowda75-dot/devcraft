'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import api from '@/lib/api';

// Stats for the trust bar
const STATS = [
  { value: '50+', label: 'Projects Available' },
  { value: '200+', label: 'Happy Clients' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '24h', label: 'Support Response' },
];

// Shown while hero content loads / if the settings endpoint is unreachable
const DEFAULT_HERO = {
  heroTitle: 'Precision Digital Craftsmanship.',
  heroHighlight: 'Ready to Deploy.',
  heroDescription: 'Discover premium, pre-built engineering projects. Skip the boilerplate ' +
    'and accelerate your timeline with production-ready codebases designed ' +
    'for modern infrastructure.',
  heroImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=85',
};

export default function HomePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState(DEFAULT_HERO);

  useEffect(() => {
    api.get('/projects', { params: { size: 3, sort: 'newest' } })
      .then((res) => {
        setProjects(res.data.items);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    // Admin-editable hero content (photo, headline, description) — falls back
    // to DEFAULT_HERO above if this hasn't been set yet or the request fails.
    api.get('/settings')
      .then((res) => {
        setHero({
          heroTitle: res.data.heroTitle || DEFAULT_HERO.heroTitle,
          heroHighlight: res.data.heroHighlight || DEFAULT_HERO.heroHighlight,
          heroDescription: res.data.heroDescription || DEFAULT_HERO.heroDescription,
          heroImageUrl: res.data.heroImageUrl || DEFAULT_HERO.heroImageUrl,
        });
      })
      .catch((err) => console.error('Failed to load site settings, using defaults', err));
  }, []);

  return (
    <>
      {/* ═══════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════ */}
      <section className="bg-grid relative overflow-hidden" id="hero" aria-label="Hero">
        <div className="container-main">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 py-16 lg:py-24">

            {/* Left — copy */}
            <div className="flex-1 max-w-xl text-center lg:text-left animate-fade-up">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 mb-6">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-xs font-medium text-brand-700">New projects added weekly</span>
              </div>

              {/* Headline */}
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-5xl text-navy-900 leading-[1.1] tracking-tight mb-5">
                {hero.heroTitle}{' '}
                <span className="text-brand-600">{hero.heroHighlight}</span>
              </h1>

              {/* Subheadline */}
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                {hero.heroDescription}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/projects" className="btn-primary" id="hero-browse-btn">
                  Browse Projects
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10m-4-4l4 4-4 4" />
                  </svg>
                </Link>
                <Link href="/contact" className="btn-outline" id="hero-learn-btn">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right — hero image */}
            <div className="flex-1 w-full max-w-2xl lg:max-w-none animate-fade-in">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200 aspect-[4/3]">
                {/* Plain <img> here (not next/image) since this URL is admin-editable
                    and can point to any domain — next/image would reject domains not
                    listed in next.config.mjs remotePatterns. */}
                <img
                  src={hero.heroImageUrl}
                  alt="Developer workspace showing code and dashboards"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Glassmorphism overlay card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 16 16">
                        <path strokeLinecap="round" d="M2 8l4 4 8-8" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-navy-900">Production-Ready</p>
                      <p className="text-xs text-gray-500">All projects are fully tested &amp; documented</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative gradient blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════
          STATS / TRUST BAR
      ════════════════════════════════════════════════ */}
      <section className="border-y border-gray-100 bg-white" id="trust-bar" aria-label="Statistics">
        <div className="container-main py-8">
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-gray-100">
            {STATS.map((stat) => (
              <li key={stat.label} className="flex flex-col items-center justify-center text-center px-6 py-2">
                <span className="font-display font-bold text-2xl text-navy-900">{stat.value}</span>
                <span className="text-sm text-gray-500 mt-0.5">{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURED PROJECTS
      ════════════════════════════════════════════════ */}
      <section className="section bg-white" id="featured-projects" aria-label="Featured Projects">
        <div className="container-main">

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display font-bold text-3xl text-navy-900 mb-2">
                Featured Projects
              </h2>
              <p className="text-gray-500 text-base">
                Curated codebases for immediate integration.
              </p>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors flex-shrink-0"
              id="featured-view-all"
            >
              View All
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10m-4-4l4 4-4 4" />
              </svg>
            </Link>
          </div>

          {/* Project grid */}
          {loading ? (
            <div className="text-center py-12" id="featured-loading">
              <Loader2 size={32} className="animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-500">Loading featured projects...</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 text-sm" id="featured-empty">
              No projects available at the moment. Check back soon!
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════ */}
      <section className="section bg-gray-50 border-t border-gray-100" id="how-it-works" aria-label="How it works">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display font-bold text-3xl text-navy-900 mb-3">
              How It Works
            </h2>
            <p className="text-gray-500">
              Three simple steps to get your production-ready project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Browse the Catalog',
                description: 'Explore our library of projects across web, mobile, and backend categories.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                ),
              },
              {
                step: '02',
                title: 'Pick Your Project',
                description: 'View descriptions, tech stacks, screenshots, and demo videos before deciding.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
              },
              {
                step: '03',
                title: 'Buy via WhatsApp',
                description: "Click 'Buy Now', get redirected to WhatsApp, and we'll send you the code instantly.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                ),
              },
            ].map((step) => (
              <div key={step.step} className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    {step.icon}
                  </svg>
                </div>
                <span className="text-xs font-bold text-brand-500 tracking-widest uppercase mb-2">{step.step}</span>
                <h3 className="font-display font-semibold text-lg text-navy-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════ */}
      <section className="section bg-navy-900" id="cta-banner" aria-label="Call to action">
        <div className="container-main text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
            Ready to skip the boilerplate?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Browse all available projects and get production-ready code delivered
            straight to you via WhatsApp.
          </p>
          <Link href="/projects" className="btn-primary bg-white text-navy-900 hover:bg-gray-100" id="cta-browse-btn">
            Browse All Projects
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10m-4-4l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
