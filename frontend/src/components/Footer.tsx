import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white" id="footer">
      <div className="container-main py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" id="footer-logo">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3h4v4H3V3zm6 0h4v4H9V3zm-6 6h4v4H3V9zm6 6h4v-4H9v4z" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <span className="font-display font-semibold text-base text-white tracking-tight">
              DevCraftPro
            </span>
          </Link>

          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cookie Policy', href: '/cookies' },
                { label: 'Support', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-gray-500 text-center md:text-right">
            © {new Date().getFullYear()} DevCraftPro Marketplace.
            <br className="hidden sm:block" />
            <span className="text-gray-600"> Precision Digital Craftsmanship.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
