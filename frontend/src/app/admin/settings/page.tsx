'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, CheckCircle2, AlertCircle, ImageIcon } from 'lucide-react';
import api from '@/lib/api';

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [heroTitle, setHeroTitle] = useState('');
  const [heroHighlight, setHeroHighlight] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');

  useEffect(() => {
    api.get('/admin/settings')
      .then((res) => {
        setHeroTitle(res.data.heroTitle || '');
        setHeroHighlight(res.data.heroHighlight || '');
        setHeroDescription(res.data.heroDescription || '');
        setHeroImageUrl(res.data.heroImageUrl || '');
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load current settings.');
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      await api.put('/admin/settings', {
        heroTitle,
        heroHighlight,
        heroDescription,
        heroImageUrl,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-navy-900 leading-tight">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit the homepage hero — the photo, title, and description update live on the public site as soon as you save.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

        {/* Form */}
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Headline
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="Precision Digital Craftsmanship."
              required
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 focus:border-[#00668a]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Highlighted phrase <span className="text-gray-400 normal-case font-normal">(shown in accent color, e.g. "Ready to Deploy.")</span>
            </label>
            <input
              type="text"
              value={heroHighlight}
              onChange={(e) => setHeroHighlight(e.target.value)}
              placeholder="Ready to Deploy."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 focus:border-[#00668a]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Description
            </label>
            <textarea
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              required
              rows={4}
              placeholder="A short paragraph introducing your marketplace..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 focus:border-[#00668a] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Hero photo URL
            </label>
            <input
              type="url"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              required
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-navy-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 focus:border-[#00668a]"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Paste a direct image link (Unsplash, Cloudinary, or any public image URL).
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle2 size={16} /> Saved!</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </form>

        {/* Live preview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:sticky lg:top-20">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Preview</p>
          <div className="rounded-lg overflow-hidden border border-gray-100">
            <div className="relative w-full aspect-[4/3] bg-gray-100">
              {heroImageUrl ? (
                <img
                  src={heroImageUrl}
                  alt="Hero preview"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-display font-bold text-sm text-navy-900 leading-snug">
                {heroTitle || 'Your headline...'}{' '}
                <span className="text-brand-600">{heroHighlight}</span>
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-4">
                {heroDescription || 'Your description will appear here...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
