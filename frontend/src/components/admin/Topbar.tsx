'use client';

import { Search, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-6">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-400 hover:text-navy-900 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="hidden sm:flex relative w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search marketplace..."
            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 focus:border-[#00668a] transition-all"
            suppressHydrationWarning={true}
          />
        </div>

        {/* Tabs */}
        <div className="hidden lg:flex items-center gap-6">
          <Link
            href="/admin/dashboard"
            className={`text-sm font-medium py-5 border-b-2 transition-colors ${
              isActive('/admin/dashboard') ? 'text-navy-900 border-navy-900' : 'text-gray-500 border-transparent hover:text-navy-900'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/sales"
            className={`text-sm font-medium py-5 border-b-2 transition-colors ${
              isActive('/admin/sales') ? 'text-navy-900 border-navy-900' : 'text-gray-500 border-transparent hover:text-navy-900'
            }`}
          >
            Analytics
          </Link>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-navy-900 leading-tight">Admin Profile</p>
            <p className="text-[10px] text-gray-500 font-medium">Super Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
            <Image
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
              alt="Admin avatar"
              width={36}
              height={36}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
