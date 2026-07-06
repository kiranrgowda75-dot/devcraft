'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Info, CloudUpload, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    shortDesc: '',
    description: '',
    category: '',
    price: '',
    techStack: '',
    thumbnailUrl: '',
    screenshotUrls: '',
    demoVideoUrl: '',
    status: 'DRAFT',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<'DRAFT' | 'ACTIVE' | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/projects/${id}`)
      .then((res) => {
        const p = res.data;
        setFormData({
          title: p.title || '',
          shortDesc: p.shortDesc || '',
          description: p.description || '',
          category: p.category || '',
          price: p.price ? p.price.toString() : '',
          techStack: p.techStack ? p.techStack.join(', ') : '',
          thumbnailUrl: p.thumbnailUrl || '',
          screenshotUrls: p.screenshotUrls ? p.screenshotUrls.join('\n') : '',
          demoVideoUrl: p.demoVideoUrl || '',
          status: p.status || 'DRAFT',
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load project details.');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    api.get('/admin/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Failed to load categories', err))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.category) errs.category = 'Category is required';
    if (!formData.shortDesc.trim()) errs.shortDesc = 'Short description is required';
    if (!formData.thumbnailUrl.trim()) errs.thumbnailUrl = 'Thumbnail URL is required';
    
    if (!formData.price.trim()) {
      errs.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        errs.price = 'Price must be a positive number';
      }
    }
    return errs;
  };

  const buildPayload = (status: 'DRAFT' | 'ACTIVE') => {
    const demoVideoUrl = formData.demoVideoUrl.trim();

    return {
      title: formData.title.trim(),
      shortDesc: formData.shortDesc.trim(),
      description: formData.description.trim(),
      category: formData.category,
      price: Number.parseFloat(formData.price),
      techStack: formData.techStack
        .split(',')
        .map((tech) => tech.trim())
        .filter(Boolean),
      thumbnailUrl: formData.thumbnailUrl.trim(),
      screenshotUrls: formData.screenshotUrls
        .split('\n')
        .map((url) => url.trim())
        .filter(Boolean),
      demoVideoUrl: demoVideoUrl ? `https://${demoVideoUrl.replace(/^https?:\/\//, '')}` : null,
      status,
    };
  };

  const handleUpdate = async (status: 'DRAFT' | 'ACTIVE') => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(status);
    try {
      await api.put(`/admin/projects/${id}`, buildPayload(status));
      router.push('/admin/projects');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to update project. Please check the form and try again.');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f9fb]">
        <Loader2 size={32} className="animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f9fb] p-6 text-center">
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <Link href="/admin/projects" className="btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-[#00668a] hover:text-[#005070] font-medium mb-4 transition-colors">
          <ArrowLeft size={16} />
          Back to Projects
        </Link>
        <h1 className="font-display font-bold text-3xl text-navy-900 mb-2">Edit Project</h1>
        <p className="text-sm text-gray-500">Modify your listed digital craftsmanship codebase.</p>
      </div>

      <div className="space-y-6">
        {/* Card 1: Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Info size={18} className="text-[#00668a]" />
            <h2 className="font-display font-bold text-lg text-navy-900">Project Details</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">Project Title</label>
              <input
                type="text"
                placeholder="e.g. Fintech Mobile App Kit - React Native"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 ${
                  errors.title ? 'border-red-400' : 'border-gray-200 focus:border-[#00668a]'
                }`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">Short Description</label>
              <input
                type="text"
                placeholder="One-line marketplace summary"
                value={formData.shortDesc}
                onChange={(e) => handleFieldChange('shortDesc', e.target.value)}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 ${
                  errors.shortDesc ? 'border-red-400' : 'border-gray-200 focus:border-[#00668a]'
                }`}
              />
              {errors.shortDesc && <p className="text-red-500 text-xs mt-1">{errors.shortDesc}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">Description</label>
              <textarea
                rows={4}
                placeholder="Describe the problem your project solves, the tech stack used, and key features..."
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 resize-y ${
                  errors.description ? 'border-red-400' : 'border-gray-200 focus:border-[#00668a]'
                }`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  disabled={categoriesLoading}
                  className={`w-full px-3.5 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 ${
                    errors.category ? 'border-red-400' : 'border-gray-200 focus:border-[#00668a]'
                  }`}
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories…' : 'Select a category'}
                  </option>
                  {/* Keep the project's current category selectable even if it was
                      since deleted/renamed, so editing doesn't silently wipe it out. */}
                  {formData.category && !categories.some((c) => c.name === formData.category) && (
                    <option value={formData.category}>{formData.category} (no longer listed)</option>
                  )}
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    placeholder="49.00"
                    value={formData.price}
                    onChange={(e) => handleFieldChange('price', e.target.value)}
                    className={`w-full pl-8 pr-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 ${
                      errors.price ? 'border-red-400' : 'border-gray-200 focus:border-[#00668a]'
                    }`}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">Tech Stack</label>
              <input
                type="text"
                placeholder="React, TypeScript, Spring Boot"
                value={formData.techStack}
                onChange={(e) => handleFieldChange('techStack', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 focus:border-[#00668a]"
              />
              <p className="text-[11px] text-gray-500 mt-1">Separate technologies with commas.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">Demo Video URL</label>
              <div className="flex items-stretch rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#00668a]/30 focus-within:border-[#00668a]">
                <span className="flex items-center px-3.5 bg-gray-50 border-r border-gray-200 text-gray-500 text-sm">https://</span>
                <input
                  type="text"
                  placeholder="vimeo.com/your-demo"
                  value={formData.demoVideoUrl}
                  onChange={(e) => handleFieldChange('demoVideoUrl', e.target.value)}
                  className="flex-1 px-3.5 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Screenshots */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <CloudUpload size={18} className="text-[#00668a]" />
            <h2 className="font-display font-bold text-lg text-navy-900">Project Screenshots</h2>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            Upload up to 5 high-resolution screenshots. The first image will be your project thumbnail.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">Thumbnail URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.thumbnailUrl}
                onChange={(e) => handleFieldChange('thumbnailUrl', e.target.value)}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 ${
                  errors.thumbnailUrl ? 'border-red-400' : 'border-gray-200 focus:border-[#00668a]'
                }`}
              />
              {errors.thumbnailUrl && <p className="text-red-500 text-xs mt-1">{errors.thumbnailUrl}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">Screenshot URLs</label>
              <textarea
                rows={4}
                placeholder="One image URL per line"
                value={formData.screenshotUrls}
                onChange={(e) => handleFieldChange('screenshotUrls', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 focus:border-[#00668a] resize-y"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between pt-4 pb-12 gap-4">
          <Link href="/admin/projects" className="text-sm font-semibold text-[#00668a] hover:text-[#005070]">
            Cancel
          </Link>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => handleUpdate('DRAFT')}
              disabled={submitting !== null}
              className="px-6 py-2.5 border border-gray-300 text-navy-900 text-sm font-semibold rounded-lg hover:bg-gray-50 w-full sm:w-auto"
            >
              {submitting === 'DRAFT' ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleUpdate('ACTIVE')}
              disabled={submitting !== null}
              className="px-6 py-2.5 bg-[#00668a] text-white text-sm font-semibold rounded-lg hover:bg-[#005070] shadow-sm w-full sm:w-auto"
            >
              {submitting === 'ACTIVE' ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Publish Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
