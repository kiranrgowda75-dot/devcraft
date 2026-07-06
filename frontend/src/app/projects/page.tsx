'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, SlidersHorizontal, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import api from '@/lib/api';

const SORT_OPTIONS = [
  { label: 'Newest First',    value: 'newest' },
  { label: 'Price: Low–High', value: 'price-asc' },
  { label: 'Price: High–Low', value: 'price-desc' },
  { label: 'Name: A–Z',       value: 'title-asc' },
];

const PAGE_SIZE = 12;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categoryOptions, setCategoryOptions] = useState<string[]>(['All']);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
  }, [category, sort]);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/projects', {
      params: {
        category: category === 'All' ? undefined : category,
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
        console.error(err);
        setError(err.message || 'Failed to load projects.');
        setLoading(false);
      });
  }, [category, search, sort, page]);

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        const names = res.data.map((c: { name: string }) => c.name);
        setCategoryOptions(['All', ...names]);
      })
      .catch(err => console.error('Failed to load categories', err));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setCategory('All');
    setPage(0);
  }, []);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];
    const set = new Set<number>();
    set.add(0);
    set.add(totalPages - 1);
    for (let p = page - 2; p <= page + 2; p++) {
      if (p >= 0 && p < totalPages) set.add(p);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [page, totalPages]);

  const hasActiveFilters = searchInput || category !== 'All';

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      <section className="bg-white border-b border-gray-100 py-10 lg:py-14" id="catalog-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-navy-900 mb-3">
            All Projects
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Browse our full catalog of production-ready codebases. Filter by category,
            search by tech stack, or sort by price.
          </p>
        </div>
      </section>

      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm" id="filter-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

            <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                id="catalog-search"
                type="search"
                placeholder="Search projects or tech…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white
                           placeholder:text-gray-400 text-navy-900
                           focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 focus:border-[#00668a]"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter by category">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  id={`filter-${cat.toLowerCase().replace(/[^a-z]/g, '-')}`}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                    category === cat
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-pressed={category === cat}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
              <SlidersHorizontal size={13} className="text-gray-400" />
              <select
                id="catalog-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-2
                           bg-white focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12" id="catalog-grid">

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-navy-900">{totalElements}</span>{' '}
            project{totalElements !== 1 ? 's' : ''} found
            {category !== 'All' && (
              <> in <span className="font-medium text-navy-900">{category}</span></>
            )}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearSearch}
              className="inline-flex items-center gap-1 text-xs text-[#00668a] hover:text-[#005070] transition-colors font-medium"
              id="clear-filters-btn"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {error ? (
          <div className="text-center py-24 text-red-500" id="error-state">
            <p className="font-semibold text-lg">Failed to connect to catalog API</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
        ) : loading ? (
          <div className="text-center py-24" id="loading-state">
            <Loader2 size={32} className="animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-500">Loading catalog...</p>
          </div>
        ) : projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10" id="catalog-pagination">
                <p className="text-xs text-gray-500">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-2 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {pageNumbers.map((p, idx) => (
                    <div key={p} className="flex items-center gap-1.5">
                      {idx > 0 && pageNumbers[idx - 1] !== p - 1 && (
                        <span className="text-gray-300 text-xs px-1">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                          p === page
                            ? 'bg-navy-900 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p + 1}
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-2 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24" id="empty-state">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h2 className="font-display font-semibold text-lg text-navy-900 mb-2">
              No projects found
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Try a different search term or category filter.
            </p>
            <button
              onClick={clearSearch}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white
                         text-sm font-medium rounded-lg hover:bg-navy-800 transition-colors"
              id="empty-clear-btn"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
