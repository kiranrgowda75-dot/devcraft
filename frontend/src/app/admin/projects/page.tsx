'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus, Search, CheckCircle2, FileEdit, DollarSign,
  ChevronDown, ChevronUp, Pencil, Trash2, ChevronLeft, ChevronRight, TrendingUp,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';

const PAGE_SIZE = 10;

export default function ProjectManagement() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);

  // -- Filters & Sorting State --
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
  const [page, setPage] = useState(0);

  // -- Pagination metadata --
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // -- Headline stats (independent of the current page/filter, from /admin/stats) --
  const [stats, setStats] = useState({ totalProjects: 0, activeProjects: 0, draftProjects: 0, averagePrice: 0 });

  // Debounce the search box
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // Reset to page 0 whenever filters/sort change
  useEffect(() => {
    setPage(0);
  }, [categoryFilter, statusFilter, sortOrder]);

  const fetchProjects = useCallback(() => {
    setLoading(true);
    const sort = sortOrder === 'asc' ? 'title-asc' : sortOrder === 'desc' ? 'title-desc' : 'newest';
    api.get('/admin/projects', {
      params: {
        category: categoryFilter === 'All Categories' ? undefined : categoryFilter,
        status: statusFilter === 'Active' ? 'ACTIVE' : statusFilter === 'Draft' ? 'DRAFT' : undefined,
        search: search || undefined,
        sort,
        page,
        size: PAGE_SIZE,
      },
    })
      .then(res => {
        setProjects(res.data.items);
        setTotalElements(res.data.totalElements);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch projects", err);
        setLoading(false);
      });
  }, [categoryFilter, statusFilter, search, sortOrder, page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    api.get('/admin/categories')
      .then(res => setCategoryOptions(res.data.map((c: { name: string }) => c.name)))
      .catch(err => console.error('Failed to load categories', err));
  }, []);

  const fetchStats = useCallback(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Failed to load stats', err));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const toggleStatus = async (id: number) => {
    try {
      const res = await api.patch(`/admin/projects/${id}/toggle-status`);
      setProjects(projects.map(p => p.id === id ? res.data : p));
      fetchStats();
    } catch (e) {
      console.error(e);
      alert("Failed to toggle status");
    }
  };

  const deleteProject = async (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/admin/projects/${id}`);
        fetchProjects();
        fetchStats();
      } catch (e) {
        console.error(e);
        alert("Failed to delete project");
      }
    }
  };

  const toggleSort = () => {
    if (sortOrder === 'none') setSortOrder('asc');
    else if (sortOrder === 'asc') setSortOrder('desc');
    else setSortOrder('none');
  };

  const startIdx = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const endIdx = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy-900 leading-tight">Project Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage your marketplace project listings.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center justify-center gap-2 bg-[#00668a] hover:bg-[#005070] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add New Project
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Total Projects</p>
          <h2 className="text-3xl font-display font-bold text-navy-900 mb-2">{stats.totalProjects}</h2>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#00668a]">
            <TrendingUp size={14} /> Across all categories
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Active Listings</p>
          <h2 className="text-3xl font-display font-bold text-navy-900 mb-2">{stats.activeProjects}</h2>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <CheckCircle2 size={14} className="text-[#00668a]" /> Live on Marketplace
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Drafts</p>
          <h2 className="text-3xl font-display font-bold text-navy-900 mb-2">{stats.draftProjects}</h2>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FileEdit size={14} className="text-gray-400" /> Pending completion
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Avg. Price</p>
          <h2 className="text-3xl font-display font-bold text-navy-900 mb-2">₹{Number(stats.averagePrice || 0).toFixed(2)}</h2>
          <div className="flex items-center gap-1.5 text-xs text-[#00668a]">
            <DollarSign size={14} /> Premium Tier
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">

        {/* Filter Row */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50 rounded-t-xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search by title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                           placeholder:text-gray-400 text-navy-900
                           focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 focus:border-[#00668a]"
              />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white border border-gray-200 text-sm text-navy-900 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 cursor-pointer"
              >
                <option>All Categories</option>
                {categoryOptions.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white border border-gray-200 text-sm text-navy-900 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 cursor-pointer"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Draft</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <span className="text-xs text-gray-500">
              {totalElements === 0 ? 'No results' : `Showing ${startIdx}-${endIdx} of ${totalElements}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : (
        <>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-xs font-bold text-gray-500 tracking-widest uppercase">
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 select-none" onClick={toggleSort}>
                  <div className="flex items-center gap-2">
                    Project Name
                    {sortOrder === 'asc' ? <ChevronUp size={14} /> : sortOrder === 'desc' ? <ChevronDown size={14} /> : <div className="flex flex-col"><ChevronUp size={10} className="-mb-1"/><ChevronDown size={10}/></div>}
                  </div>
                </th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map(proj => (
                <tr key={proj.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded-md border border-gray-200 overflow-hidden relative flex-shrink-0">
                        <Image src={proj.thumbnailUrl} alt={proj.title} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-900 flex items-center gap-2">
                          {proj.title}
                          {proj.featured && <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">Featured</span>}
                        </p>
                        <p className="text-[11px] text-gray-500">Updated {new Date(proj.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{proj.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-navy-900 font-mono">₹{Number(proj.price).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleStatus(proj.id)} className="flex items-center gap-1.5" title="Click to toggle status">
                      <div className={`w-2 h-2 rounded-full ${proj.status === 'ACTIVE' ? 'bg-[#00668a]' : 'bg-gray-400'}`}></div>
                      <span className={`text-sm font-medium ${proj.status === 'ACTIVE' ? 'text-[#00668a]' : 'text-gray-500'}`}>
                        {proj.status === 'ACTIVE' ? 'Active' : 'Draft'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/projects/${proj.id}/edit`} className="p-1.5 text-gray-400 hover:text-[#00668a] hover:bg-[#e6f4f8] rounded transition-colors" aria-label="Edit">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => deleteProject(proj.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    No projects match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card-List View */}
        <div className="md:hidden divide-y divide-gray-100">
          {projects.map(proj => (
            <div key={proj.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-14 h-10 rounded-md border border-gray-200 overflow-hidden relative flex-shrink-0">
                  <Image src={proj.thumbnailUrl} alt={proj.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-900 truncate flex items-center gap-2">
                    {proj.title}
                    {proj.featured && <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold flex-shrink-0">Featured</span>}
                  </p>
                  <p className="text-xs text-gray-500">Updated {new Date(proj.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/projects/${proj.id}/edit`} className="p-1.5 text-gray-400 hover:text-[#00668a] bg-gray-50 rounded">
                    <Pencil size={14} />
                  </Link>
                  <button onClick={() => deleteProject(proj.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{proj.category}</span>
                <span className="text-sm font-bold text-navy-900 font-mono">₹{Number(proj.price).toFixed(2)}</span>
                <button onClick={() => toggleStatus(proj.id)} className="flex items-center gap-1.5 ml-auto">
                  <div className={`w-1.5 h-1.5 rounded-full ${proj.status === 'ACTIVE' ? 'bg-[#00668a]' : 'bg-gray-400'}`}></div>
                  <span className={`text-xs font-medium ${proj.status === 'ACTIVE' ? 'text-[#00668a]' : 'text-gray-500'}`}>
                    {proj.status === 'ACTIVE' ? 'Active' : 'Draft'}
                  </span>
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-gray-500">No projects match your filters.</div>
          )}
        </div>
        </>
        )}

      </div>

      {/* Pagination Below Table */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-gray-500">Showing {startIdx}-{endIdx} of {totalElements} projects</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 border border-gray-200 bg-white rounded text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="w-8 h-8 flex items-center justify-center bg-navy-900 text-white rounded text-xs font-bold">{page + 1}</span>
            <span className="text-xs text-gray-400">of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 border border-gray-200 bg-white rounded text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
