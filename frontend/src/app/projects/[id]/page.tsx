'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { 
  ArrowLeft, Check, Lock, Code2, Database, LayoutDashboard, 
  Smartphone, FileCode2, Sparkles, Server, LayoutTemplate, Box, ChevronRight, Loader2
} from 'lucide-react';
import api from '@/lib/api';

// ─── Check icon for perks ─────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#e6f4f8] flex items-center justify-center">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="#00668a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState<number>(0);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    api.get(`/projects/${params.id}`)
      .then(res => {
        setProject(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        if (err.response?.status === 404) {
          notFound();
        }
      });
  }, [params.id]);

  const handleBuyWhatsApp = async () => {
    if (!project) return;
    setBuying(true);
    
    try {
      await api.post('/leads', {
        projectId: project.id,
        customerName: 'Guest User',
        customerPhone: 'WhatsApp',
        message: 'WhatsApp click intent',
        inquiryType: 'WHATSAPP_CLICK'
      });
    } catch (e) {
      console.error('Failed to log lead, proceeding anyway', e);
    }

    const msg = encodeURIComponent(`Hi, I'm interested in purchasing "${project.title}" (ID: ${project.id}) for $${project.price}.`);
    window.open(`https://wa.me/917760060026?text=${msg}`, '_blank');
    setBuying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Loading project details...</p>
      </div>
    );
  }

  if (!project) return notFound();

  // Combine thumbnail and screenshots for gallery
  const allImages = [project.thumbnailUrl, ...(project.screenshotUrls || [])].filter(Boolean);
  
  // Fake static data for display purposes that backend doesn't provide yet
  const tags = project.techStack || [];
  const currency = 'USD';
  const licenseType = 'Standard License';
  const perks = ['Lifetime Updates', 'Figma Design Files Included', '6 Months Technical Support'];
  const keyFeatures = [
    { title: 'Optimized Performance', desc: 'Zero-dependency chart rendering for ultra-fast load times.', icon: <Sparkles size={18} /> },
    { title: 'Responsive Fluid Grid', desc: 'Flawless scaling from mobile to 4K displays.', icon: <LayoutTemplate size={18} /> },
  ];
  const techSpecs = {
    FRAMEWORK: project.category,
    LANGUAGE: 'TypeScript / Java',
    'LAST UPDATED': 'October 24, 2024',
    VERSION: 'v1.0.0',
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* ══════════════════════════════════════════════════════
          BREADCRUMB
      ══════════════════════════════════════════════════════ */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-navy-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/projects" className="hover:text-navy-900 transition-colors">Projects</Link>
            <span>/</span>
            <span className="text-navy-900 font-medium">{project.title}</span>
          </nav>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          HERO — Image gallery + Purchase card
      ══════════════════════════════════════════════════════ */}
      <section className="py-8 lg:py-10" id="project-hero" aria-label="Project hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 xl:gap-10">

            {/* ── Left: Image gallery ──────────────────────── */}
            <div id="project-gallery">
              {/* Main image */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm ring-1 ring-gray-200">
                <Image
                  src={allImages[activeImg]}
                  alt={`${project.title} screenshot ${activeImg + 1}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-opacity duration-300"
                />
              </div>

              {/* Thumbnail strip */}
              <div className="flex gap-3 mt-3" role="tablist" aria-label="Image thumbnails">
                {allImages.map((src, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={activeImg === i}
                    aria-label={`View screenshot ${i + 1}`}
                    id={`thumb-${i}`}
                    onClick={() => setActiveImg(i)}
                    className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden ring-2 transition-all duration-200 ${
                      activeImg === i
                        ? 'ring-[#00668a] shadow-md'
                        : 'ring-gray-200 hover:ring-gray-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`Thumbnail ${i + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* ── Right: Purchase card ─────────────────────── */}
            <aside
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 h-fit lg:sticky lg:top-20"
              id="purchase-card"
              aria-label="Purchase information"
            >
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="font-display font-bold text-2xl text-navy-900 leading-snug">
                {project.title}
              </h1>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed">
                {project.shortDesc}
              </p>

              {/* Divider */}
              <hr className="border-gray-100" />

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-display font-bold text-4xl text-navy-900">
                  ${Number(project.price).toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 leading-tight">
                  {currency} / {licenseType}
                </span>
              </div>

              {/* Perks */}
              <ul className="flex flex-col gap-2.5" aria-label="Included perks">
                {perks.map((perk: string) => (
                  <li key={perk} className="flex items-center gap-2.5">
                    <CheckIcon />
                    <span className="text-sm text-gray-600">{perk}</span>
                  </li>
                ))}
              </ul>

              {/* Buy button */}
              <button
                onClick={handleBuyWhatsApp}
                disabled={buying}
                id="buy-whatsapp-btn"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl
                           bg-[#00668a] hover:bg-[#005070] active:bg-[#004060]
                           text-white font-semibold text-sm
                           transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0
                           focus:outline-none focus:ring-2 focus:ring-[#00668a] focus:ring-offset-2
                           disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label={`Buy ${project.title} via WhatsApp`}
              >
                {buying ? <Loader2 size={18} className="animate-spin" /> : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                )}
                Buy Now via WhatsApp
              </button>
              
              {/* Security note */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Lock size={12} />
                Secure transaction process
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CONTENT — Overview + Key Features | Tech Specs
      ══════════════════════════════════════════════════════ */}
      <section className="pb-16 lg:pb-24" id="project-content" aria-label="Project details">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 xl:gap-10">

            {/* ── Left: Overview + Key Features ────────────── */}
            <div className="flex flex-col gap-10">

              {/* Project Overview */}
              <div
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8"
                id="project-overview"
              >
                <h2 className="font-display font-bold text-xl text-navy-900 mb-5">
                  Project Overview
                </h2>
                <div className="space-y-4">
                  {project.description.split('\n\n').map((para: string, i: number) => (
                    <p key={i} className="text-gray-600 leading-relaxed text-sm">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div id="key-features">
                <h2 className="font-display font-bold text-xl text-navy-900 mb-5">
                  Key Features
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {keyFeatures.map((feat) => (
                    <div
                      key={feat.title}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3
                                 hover:border-[#00668a]/30 hover:shadow-md transition-all duration-200"
                    >
                      {/* Icon */}
                      <div className="w-8 h-8 rounded-lg bg-[#e6f4f8] flex items-center justify-center text-[#00668a]">
                        {feat.icon}
                      </div>
                      {/* Title */}
                      <h3 className="font-mono font-bold text-sm text-navy-900 tracking-tight">
                        {feat.title}
                      </h3>
                      {/* Description */}
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Technical Specifications ──────────── */}
            <aside
              className="h-fit lg:sticky lg:top-20"
              id="tech-specs"
              aria-label="Technical specifications"
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-display font-bold text-lg text-navy-900 mb-5">
                  Technical Specifications
                </h2>

                <dl className="flex flex-col divide-y divide-gray-100">
                  {Object.entries(techSpecs).map(([label, value]) => (
                    <div key={label} className="py-3.5 first:pt-0 last:pb-0">
                      <dt className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">
                        {label}
                      </dt>
                      <dd className="text-sm font-medium text-navy-900">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* View Full Documentation link */}
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <a
                    href="#"
                    id="view-docs-link"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00668a]
                               hover:text-[#005070] transition-colors"
                  >
                    View Full Documentation
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Back to catalog */}
              <div className="mt-4 text-center">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy-900 transition-colors"
                  id="back-to-catalog"
                >
                  <ArrowLeft size={14} />
                  Back to Catalog
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
