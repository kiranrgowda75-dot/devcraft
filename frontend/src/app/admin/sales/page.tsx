'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Download, Filter, Mail, MessageSquare, MoreVertical, 
  TrendingUp, TrendingDown, Clock, Search, CircleDashed,
  CheckCircle2, Sparkles, Plus, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';

export default function SalesLog() {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/leads')
      .then(res => {
        setLeads(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch leads", err);
        setLoading(false);
      });
  }, []);

  // --- Derived Stats ---
  const totalLeads24h = leads.length; 
  const whatsappClicks = leads.filter(l => l.inquiryType === 'WHATSAPP_CLICK').length;
  const pendingFollowUps = leads.filter(l => l.status !== 'CLOSED').length;

  // --- Filtering ---
  const filteredLeads = useMemo(() => {
    let list = leads;

    if (statusFilter !== 'ALL') {
      list = list.filter(l => l.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        (l.customerName || '').toLowerCase().includes(q) ||
        (l.projectTitle || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [leads, search, statusFilter]);

  const handleExportCSV = () => {
    // Helper: wrap value in quotes and escape internal quotes
    const escapeCSV = (val: unknown): string => {
      const str = val == null ? '' : String(val);
      // Wrap in double quotes and escape any internal double quotes
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = ['Date', 'Customer Name', 'Email', 'Mobile Number', 'Project', 'Inquiry Type', 'Status'];
    const rows = filteredLeads.map(l => [
      new Date(l.createdAt).toLocaleString(),
      l.customerName || '',
      l.customerEmail || '',
      l.customerPhone || '',
      l.projectTitle || '',
      l.inquiryType?.replace(/_/g, ' ') || '',
      l.status?.replace(/_/g, ' ') || '',
    ]);

    const csvLines = [
      headers.map(escapeCSV).join(','),
      ...rows.map(r => r.map(escapeCSV).join(',')),
    ].join('\r\n');

    // UTF-8 BOM ensures Excel opens the file with correct encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvLines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/admin/leads/${id}/status`, { status: newStatus });
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
      setOpenMenuId(null);
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-teal-100 text-teal-700', 'bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-24 relative">
      
      {/* Search injected via Topbar mentally (we can't actually inject it into Topbar from here without context, so we'll put a local search bar for the table) */}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy-900 leading-tight">Sales & Inquiries Log</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time tracker for customer leads and purchase intents.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={16} className="text-gray-400" />
            Export CSV
          </button>
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(v => !v)}
              className="flex items-center gap-2 bg-[#00668a] hover:bg-[#005070] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Filter size={16} />
              {statusFilter === 'ALL' ? 'Filters' : `Status: ${statusFilter.replace('_', ' ')}`}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-11 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                {['ALL', 'NEW', 'IN_PROGRESS', 'CLOSED'].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      statusFilter === s ? 'text-[#00668a] font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Total Leads (24H)</p>
          <div className="flex items-end gap-3">
            <h2 className="text-3xl font-display font-bold text-navy-900">{totalLeads24h}</h2>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#00668a] mb-1.5">
              <TrendingUp size={14} /> +12%
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">WhatsApp Clicks</p>
          <div className="flex items-end gap-3">
            <h2 className="text-3xl font-display font-bold text-navy-900">{whatsappClicks}</h2>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#00668a] mb-1.5">
              <TrendingUp size={14} /> +5%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Conversion Rate</p>
          <div className="flex items-end gap-3">
            {/* Fake data for demo flavor as there is no real "sale" concept yet */}
            <h2 className="text-3xl font-display font-bold text-navy-900">4.2%</h2>
            <div className="flex items-center gap-1 text-xs font-semibold text-red-500 mb-1.5">
              <TrendingDown size={14} /> -1%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 border-l-4 border-l-orange-400">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Pending Follow-Ups</p>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-display font-bold text-navy-900">{pendingFollowUps}</h2>
            <Clock size={20} className="text-gray-300" />
          </div>
        </div>
      </div>

      {/* Local Search (since topbar search isn't wired to local state) */}
      <div className="relative w-full max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by customer name or project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 focus:border-[#00668a]"
        />
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 tracking-widest uppercase">
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Mobile Number</th>
                <th className="px-6 py-4">Project Interest</th>
                <th className="px-6 py-4">Inquiry Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map(lead => {
                const date = new Date(lead.createdAt);
                const isContactForm = lead.inquiryType === 'CONTACT_FORM';
                const isViewDetails = lead.inquiryType === 'VIEW_DETAILS';
                
                return (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-navy-900">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(lead.customerName || 'A')}`}>
                          {lead.customerName ? getInitials(lead.customerName) : '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy-900">{lead.customerName || <span className="text-gray-400 font-normal">Anonymous</span>}</p>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">{lead.customerEmail || '—'}</p>
                        </div>
                      </div>
                    </td>
                    {/* Mobile Number */}
                    <td className="px-6 py-4">
                      {lead.customerPhone ? (
                        <a
                          href={`tel:${lead.customerPhone}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00668a] hover:underline"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {lead.customerPhone}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-navy-900">
                      {lead.projectTitle}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide ${
                        isContactForm ? 'bg-gray-100 text-gray-600' 
                        : isViewDetails ? 'bg-blue-50 text-blue-600'
                        : 'bg-green-100 text-green-700'
                      }`}>
                        {isContactForm ? <Mail size={12} /> : isViewDetails ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg> : <MessageSquare size={12} />}
                        {isContactForm ? 'Contact Form' : isViewDetails ? 'View Details' : 'WhatsApp Click'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                        lead.status === 'NEW' ? 'bg-red-100 text-red-700' :
                        lead.status === 'IN_PROGRESS' ? 'bg-gray-200 text-gray-700' :
                        'bg-[#e6f4f8] text-[#00668a]'
                      }`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === lead.id ? null : lead.id)}
                        className="p-1.5 text-gray-400 hover:text-navy-900 rounded hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === lead.id && (
                        <div className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1 text-left">
                          <button 
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => handleStatusChange(lead.id, 'IN_PROGRESS')}
                          >
                            <CircleDashed size={14} className="text-orange-500" />
                            Mark as In Progress
                          </button>
                          <button 
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => handleStatusChange(lead.id, 'CLOSED')}
                          >
                            <CheckCircle2 size={14} className="text-gray-400" />
                            Mark as Closed
                          </button>
                          <div className="h-px bg-gray-100 my-1"></div>
                          <button onClick={() => setOpenMenuId(null)} className="w-full px-4 py-2 text-xs font-medium text-[#00668a] hover:bg-gray-50 text-left">
                            View Details
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination — dataset is loaded in full client-side, so this is a single page for now */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">Showing {filteredLeads.length} of {leads.length} results</p>
          <div className="flex items-center gap-1.5">
            <button disabled className="p-1.5 border border-gray-200 bg-white rounded text-gray-300 cursor-not-allowed"><ChevronLeft size={14} /></button>
            <span className="w-7 h-7 flex items-center justify-center bg-[#00668a] text-white rounded text-xs font-bold">1</span>
            <button disabled className="p-1.5 border border-gray-200 bg-white rounded text-gray-300 cursor-not-allowed"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-[#1a1f36] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md border border-[#2a2f46]">
        <div>
          <h3 className="font-display font-bold text-lg text-white mb-1.5">Optimize Lead Response</h3>
          <p className="text-sm text-gray-400 max-w-xl">
            Market data suggests leads contacted within 5 minutes are 9x more likely to convert. 
            Automated email templates are on our roadmap — for now, use the contact details above to follow up directly.
          </p>
        </div>
        <button disabled className="flex items-center justify-center gap-2 bg-white/50 text-[#1a1f36]/50 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed w-full sm:w-auto flex-shrink-0">
          <Sparkles size={16} />
          Coming Soon
        </button>
      </div>

      {/* Floating Action Button — jumps to creating a new project */}
      <Link
        href="/admin/projects/new"
        aria-label="Add new project"
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#00668a] hover:bg-[#005070] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50"
      >
        <Plus size={24} />
      </Link>

    </div>
  );
}
