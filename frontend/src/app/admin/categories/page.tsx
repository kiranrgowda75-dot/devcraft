'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Tag, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface Category {
  id: number;
  name: string;
  projectCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: number; message: string } | null>(null);

  const loadCategories = () => {
    setLoading(true);
    api.get('/admin/categories')
      .then((res) => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load categories.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setCreating(true);
    setCreateError('');
    try {
      const res = await api.post('/admin/categories', { name });
      setCategories((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
    } catch (err: any) {
      console.error(err);
      setCreateError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete category "${category.name}"?`)) return;

    setDeletingId(category.id);
    setDeleteError(null);
    try {
      await api.delete(`/admin/categories/${category.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
    } catch (err: any) {
      console.error(err);
      setDeleteError({
        id: category.id,
        message: err.response?.data?.message || 'Failed to delete category.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-navy-900 mb-2">Categories</h1>
        <p className="text-sm text-gray-500">
          Manage the categories available when publishing a project. They also power the
          category filter on the public marketplace.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Add category */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6"
      >
        <label className="block text-xs font-bold text-navy-900 mb-1.5">Add a new category</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Browser Extension"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              if (createError) setCreateError('');
            }}
            className={`flex-1 px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 ${
              createError ? 'border-red-400' : 'border-gray-200 focus:border-[#00668a]'
            }`}
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add Category
          </button>
        </div>
        {createError && <p className="text-red-500 text-xs mt-2">{createError}</p>}
      </form>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No categories yet — add one above.
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="p-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#00668a]/10 flex items-center justify-center flex-shrink-0">
                    <Tag size={16} className="text-[#00668a]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-900 truncate">{cat.name}</p>
                    <p className="text-xs text-gray-500">
                      {cat.projectCount} project{cat.projectCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cat)}
                  disabled={deletingId === cat.id}
                  title={cat.projectCount > 0 ? 'Delete is blocked while projects use this category' : 'Delete category'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {deletingId === cat.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete
                </button>
              </div>
              {deleteError?.id === cat.id && (
                <p className="text-red-500 text-xs mt-2">{deleteError.message}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
