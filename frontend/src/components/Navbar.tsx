'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="container-main">
        <nav className="flex items-center justify-between h-16" role="navigation" aria-label="Main navigation">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" id="nav-logo">
            <div className="w-7 h-7 bg-navy-900 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3h4v4H3V3zm6 0h4v4H9V3zm-6 6h4v4H3V9zm6 6h4v-4H9v4z" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <span className="font-display font-700 text-lg text-navy-900 tracking-tight">
              DevCraftPro
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-8" id="nav-links">
            {[
              { label: 'Home',     href: '/' },
              { label: 'Projects', href: '/projects' },
              { label: 'Contact',  href: '/contact' },
            ].map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`text-sm font-medium transition-colors relative ${
                    isActive(href)
                      ? 'text-navy-900'
                      : 'text-gray-500 hover:text-navy-900'
                  }`}
                  id={`nav-${label.toLowerCase()}`}
                >
                  {label}
                  {isActive(href) && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-navy-900 rounded-full" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA button */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/projects" className="btn-primary btn-sm" id="nav-cta">
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            id="nav-mobile-toggle"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? (
                <path strokeLinecap="round" d="M4 4l12 12M16 4L4 16" />
              ) : (
                <>
                  <path strokeLinecap="round" d="M3 5h14M3 10h14M3 15h14" />
                </>
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-1 animate-fade-in" id="nav-mobile-menu">
            <Link href="/" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-navy-900 bg-gray-50">
              Home
            </Link>
            <Link href="/projects" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              Projects
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              Contact
            </Link>
            <div className="pt-2 border-t border-gray-100">
              <Link href="/projects" onClick={() => setMobileOpen(false)}
                className="btn-primary w-full text-center mt-2">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
