'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PhonePopupModalProps {
  projectId: number;
  projectTitle: string;
  onClose: () => void;
}

export default function PhonePopupModal({ projectId, projectTitle, onClose }: PhonePopupModalProps) {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const proceed = async (withPhone: boolean) => {
    setSubmitting(true);
    try {
      // Use plain fetch (NOT the api axios instance) so the 401/403
      // response interceptor in api.ts doesn't redirect the user to /admin/login
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          customerPhone: withPhone && phone.trim() ? phone.trim() : null,
          inquiryType: 'WHATSAPP_CLICK',
        }),
      });
    } catch {
      // silently ignore — don't block the user
    } finally {
      onClose();
      router.push(`/projects/${projectId}`);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) { onClose(); router.push(`/projects/${projectId}`); } }}
    >
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-up">

        {/* Close button */}
        <button
          onClick={() => { onClose(); router.push(`/projects/${projectId}`); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" d="M4 4l12 12M16 4L4 16" />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-5 mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00668a" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="font-display font-bold text-2xl text-navy-900 text-center mb-2">
          Get Expert Help
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed">
          Leave your number and we'll reach out to help you with{' '}
          <span className="font-semibold text-navy-900">{projectTitle}</span>.
          <br />
          <span className="text-xs text-gray-400">This is completely optional — you can skip anytime.</span>
        </p>

        {/* Phone Input */}
        <div className="mb-4">
          <label htmlFor="popup-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
            Mobile Number <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">+91</span>
            <input
              id="popup-phone"
              type="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => proceed(true)}
            disabled={submitting}
            id="popup-submit-btn"
            className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            Submit & View Project
          </button>

          <button
            onClick={() => proceed(false)}
            disabled={submitting}
            id="popup-skip-btn"
            className="w-full py-3 border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors"
          >
            Skip, just show me the project
          </button>
        </div>

        {/* Privacy note */}
        <p className="text-[11px] text-gray-400 text-center mt-4">
          🔒 Your number is kept private and only used to contact you about this project.
        </p>
      </div>
    </div>
  );
}
