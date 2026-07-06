'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, Download, Banknote, FolderKanban, MessageSquare,
  ShoppingCart, MessageCircle, Loader2, Inbox
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import api from '@/lib/api';

// Palette for category / status pie & bar charts
const PALETTE = ['#00668a', '#f97316', '#6366f1', '#10b981', '#ef4444', '#eab308', '#8b5cf6', '#14b8a6'];

const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: '#00668a',
  IN_PROGRESS: '#f97316',
  CLOSED: '#94a3b8',
};

const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  CLOSED: 'Closed',
};

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load stats", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  const displayStats = stats || {
    totalProjects: 0, activeProjects: 0, draftProjects: 0, totalLeads: 0, newLeads: 0,
    averagePrice: 0, catalogValue: 0, projectsByCategory: [], leadsByStatus: {},
    leadsByInquiryType: {}, monthlyTrend: [], recentLeads: [],
  };

  const categoryData = (displayStats.projectsByCategory || []).map((c: any) => ({
    name: c.category,
    value: c.count,
  }));

  const leadStatusData = Object.entries(displayStats.leadsByStatus || {}).map(([status, count]) => ({
    name: LEAD_STATUS_LABELS[status] || status,
    key: status,
    value: count as number,
  }));

  const handleExportReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Projects', displayStats.totalProjects ?? 0],
      ['Active Projects', displayStats.activeProjects ?? 0],
      ['Draft Projects', displayStats.draftProjects ?? 0],
      ['Total Leads', displayStats.totalLeads ?? 0],
      ['New Leads', displayStats.newLeads ?? 0],
      ['Average Price', displayStats.averagePrice ?? 0],
      ['Catalog Value (Active Projects)', displayStats.catalogValue ?? 0],
      ...categoryData.map((c: any) => [`Category: ${c.name}`, c.value]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'dashboard_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy-900 leading-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back. Here's what's happening with DevCraft today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled
            title="Time-range filtering isn't available yet — showing all-time data"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            <Calendar size={16} className="text-gray-300" />
            All Time
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#e6f4f8] flex items-center justify-center">
              <Banknote size={20} className="text-[#00668a]" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Catalog Value</p>
          <h2 className="text-3xl font-display font-bold text-navy-900">
            ₹{Number(displayStats.catalogValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-xs text-gray-400 mt-1">Sum of price across active listings</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FolderKanban size={20} className="text-indigo-600" />
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">{displayStats.draftProjects} drafts</span>
          </div>
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Active Projects</p>
          <h2 className="text-3xl font-display font-bold text-navy-900">{displayStats.activeProjects}</h2>
          <p className="text-xs text-gray-400 mt-1">{displayStats.totalProjects} total listings</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <MessageSquare size={20} className="text-orange-500" />
            </div>
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-md">+{displayStats.newLeads} New</span>
          </div>
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Total Inquiries</p>
          <h2 className="text-3xl font-display font-bold text-navy-900">{displayStats.totalLeads}</h2>
          <p className="text-xs text-gray-400 mt-1">{displayStats.newLeads} awaiting response</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
              <ShoppingCart size={20} className="text-teal-600" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Avg. Price</p>
          <h2 className="text-3xl font-display font-bold text-navy-900">
            ₹{Number(displayStats.averagePrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-xs text-gray-400 mt-1">Across all projects</p>
        </div>
      </div>

      {/* Main Content Area — Trend + Lead Status */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-navy-900">Activity — Last 6 Months</h2>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00668a]"></div> New Projects
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div> New Inquiries
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayStats.monthlyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="projects" name="New Projects" fill="#00668a" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="leads" name="New Inquiries" fill="#fb923c" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads by Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <h2 className="font-display font-bold text-lg text-navy-900 mb-4">Leads by Status</h2>
          {displayStats.totalLeads > 0 ? (
            <>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {leadStatusData.map((entry) => (
                        <Cell key={entry.key} fill={LEAD_STATUS_COLORS[entry.key] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {leadStatusData.map((entry) => (
                  <div key={entry.key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LEAD_STATUS_COLORS[entry.key] || '#94a3b8' }} />
                      <span className="text-gray-600">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-navy-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <Inbox size={28} className="text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No leads yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown + Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

        {/* Projects by Category */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-navy-900">Projects by Category</h2>
            <Link href="/admin/categories" className="text-sm font-medium text-[#00668a] hover:text-[#005070]">Manage Categories</Link>
          </div>
          {categoryData.length > 0 ? (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={110} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" name="Projects" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {categoryData.map((_: any, idx: number) => (
                      <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">No categories with projects yet.</div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-navy-900">Recent Inquiries</h2>
            <Link href="/admin/sales" className="text-sm font-medium text-[#00668a] hover:text-[#005070]">View All</Link>
          </div>

          {displayStats.recentLeads && displayStats.recentLeads.length > 0 ? (
            <div className="flex-1 space-y-5">
              {displayStats.recentLeads.map((lead: any) => {
                const Icon = lead.inquiryType === 'WHATSAPP_CLICK' ? MessageCircle : MessageSquare;
                const color = lead.inquiryType === 'WHATSAPP_CLICK' ? 'bg-teal-100 text-teal-600' : 'bg-blue-100 text-blue-600';
                return (
                  <div key={lead.id} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-navy-900 truncate">{lead.customerName || 'Anonymous'}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{lead.projectTitle} &bull; {timeAgo(lead.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <Inbox size={28} className="text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No inquiries yet</p>
            </div>
          )}

          <Link href="/admin/sales" className="w-full mt-6 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 text-center hover:bg-gray-100 transition-colors">
            View All Inquiries
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 border-t border-gray-200 mt-12">
        <p>&copy; {new Date().getFullYear()} DevCraft Marketplace. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-navy-900">Privacy Policy</a>
          <a href="#" className="hover:text-navy-900">Terms of Service</a>
          <a href="#" className="hover:text-navy-900">System Status</a>
        </div>
      </footer>
    </div>
  );
}
