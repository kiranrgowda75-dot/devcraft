'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Info, CloudUpload, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import ImageKitUpload from '@/components/ImageKitUpload';

export default function NewProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
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
    featured: false,
    screenshots: [] as any[], // Array of File or URL for now
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<'DRAFT' | 'ACTIVE' | null>(null);

  useEffect(() => {
    api.get('/admin/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Failed to load categories', err))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const STEPS = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Media Assets' },
    { num: 3, label: 'Review & Publish' },
  ];

  const handleFieldChange = (field: keyof typeof formData, value: string | boolean) => {
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
      featured: formData.featured,
      status,
    };
  };

  const saveProject = async (status: 'DRAFT' | 'ACTIVE') => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(status);
    try {
      await api.post('/admin/projects', buildPayload(status));
      router.push('/admin/projects');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to save project. Please check the form and try again.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-[#00668a] hover:text-[#005070] font-medium mb-4 transition-colors">
          <ArrowLeft size={16} />
          Back to Projects
        </Link>
        <h1 className="font-display font-bold text-3xl text-navy-900 mb-2">Publish New Project</h1>
        <p className="text-sm text-gray-500">List your digital craftsmanship on the Nexus Marketplace for global reach.</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-10 relative">
        <div className="absolute top-4 left-0 w-full h-px bg-gray-200 -z-10"></div>
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            
            return (
              <div key={step.num} className="flex flex-col items-center gap-2 bg-[#f7f9fb] px-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  isActive ? 'bg-[#00668a] text-white border-[#00668a]' :
                  isCompleted ? 'bg-gray-100 text-gray-400 border-gray-200' :
                  'bg-white text-gray-400 border-gray-200'
                }`}>
                  {step.num}
                </div>
                <span className={`text-xs font-semibold ${isActive ? 'text-[#00668a]' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {isActive && <div className="absolute -bottom-3 w-16 h-0.5 bg-[#00668a] rounded-full"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {currentStep === 1 && (
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
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  {!categoriesLoading && categories.length === 0 && (
                    <p className="text-[11px] text-gray-500 mt-1">
                      No categories yet — add one from{' '}
                      <Link href="/admin/categories" className="text-[#00668a] hover:underline">
                        Categories
                      </Link>.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">Price (Rupees)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
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
              
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleFieldChange('featured', e.target.checked)}
                  className="w-4 h-4 text-[#00668a] bg-white border-gray-300 rounded focus:ring-[#00668a]"
                />
                <label htmlFor="featured-checkbox" className="text-sm font-medium text-navy-900">
                  Feature this project on the home page
                </label>
              </div>
            </div>
          </div>

          {/* Card 2: Screenshots */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <CloudUpload size={18} className="text-[#00668a]" />
              <h2 className="font-display font-bold text-lg text-navy-900">Project Media</h2>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Upload your thumbnail and up to 5 screenshots directly to ImageKit. Images are optimised automatically.
            </p>

            <div className="space-y-6">
              {/* Thumbnail */}
              <ImageKitUpload
                label="Thumbnail Image"
                value={formData.thumbnailUrl}
                onChange={(url) => handleFieldChange('thumbnailUrl', url)}
                folder="/devcraft/thumbnails"
                showPreview
                error={errors.thumbnailUrl}
              />

              {/* Screenshots */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-3">Screenshots (up to 5)</label>
                <div className="space-y-3">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const urls = formData.screenshotUrls
                      ? formData.screenshotUrls.split('\n').map((u) => u.trim())
                      : [];
                    return (
                      <ImageKitUpload
                        key={i}
                        label={`Screenshot ${i + 1}`}
                        value={urls[i] || ''}
                        onChange={(url) => {
                          const arr = formData.screenshotUrls
                            ? formData.screenshotUrls.split('\n').map((u) => u.trim())
                            : [];
                          while (arr.length <= i) arr.push('');
                          arr[i] = url;
                          handleFieldChange('screenshotUrls', arr.filter(Boolean).join('\n'));
                        }}
                        folder="/devcraft/screenshots"
                        showPreview={false}
                      />
                    );
                  })}
                </div>
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
                onClick={() => saveProject('DRAFT')}
                disabled={submitting !== null}
                className="px-6 py-2.5 border border-gray-300 text-navy-900 text-sm font-semibold rounded-lg hover:bg-gray-50 w-full sm:w-auto"
              >
                {submitting === 'DRAFT' ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save Draft'}
              </button>
              <button 
                onClick={() => saveProject('ACTIVE')}
                disabled={submitting !== null}
                className="px-6 py-2.5 bg-[#00668a] text-white text-sm font-semibold rounded-lg hover:bg-[#005070] shadow-sm w-full sm:w-auto"
              >
                {submitting === 'ACTIVE' ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Publish Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && <div>{/* TODO: build in next pass */}</div>}
      {currentStep === 3 && <div>{/* TODO: build in next pass */}</div>}
      
    </div>
  );
}
