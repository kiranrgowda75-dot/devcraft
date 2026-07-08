'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Tag, TrendingUp, Settings, Plus, HelpCircle, LogOut } from 'lucide-react';
import Cookies from 'js-cookie';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Sales', href: '/admin/sales', icon: TrendingUp },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleSignOut = () => {
    Cookies.remove('token');
    Cookies.remove('username');
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full hidden md:flex flex-shrink-0" id="admin-sidebar">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div>
          <h1 className="font-display font-bold text-lg text-navy-900 leading-tight">Nexus Admin</h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-wide uppercase">Project Marketplace</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-gray-100 text-navy-900' : 'text-gray-500 hover:bg-gray-50 hover:text-navy-900'
              }`}
            >
              <Icon size={18} className={active ? 'text-navy-900' : 'text-gray-400'} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-gray-100 space-y-4">
        <Link
          href="/admin/projects/new"
          className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Project
        </Link>
        
        <div className="space-y-1">
          <Link href="/contact" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 hover:text-navy-900 transition-colors">
            <HelpCircle size={18} className="text-gray-400" />
            Support
          </Link>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
            suppressHydrationWarning={true}
          >
            <LogOut size={18} className="text-gray-400" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
