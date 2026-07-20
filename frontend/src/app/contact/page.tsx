'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  Mail,
  MessageCircle,
  MapPin,
  ArrowUpRight,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormFields {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  agreed: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  subject?: string;
  message?: string;
  agreed?: string;
}

const INITIAL_FORM: FormFields = {
  fullName: '',
  email: '',
  subject: 'General Inquiry',
  message: '',
  agreed: false,
};

const SUBJECT_OPTIONS = [
  'General Inquiry',
  'Technical Support',
  'Project Purchase',
  'Billing',
  'Other',
];

// ─── Info Card Data ───────────────────────────────────────────────────────────
const INFO_CARDS = [
  {
    id: 'email-card',
    icon: Mail,
    title: 'Email Us',
    desc: 'For general inquiries and project support.',
    link: { label: 'devcraftp@gmail.com', href: 'mailto:devcraftp@gmail.com' },
  },
  {
    id: 'whatsapp-card',
    icon: MessageCircle,
    title: 'WhatsApp',
    desc: 'For quick chats and urgent technical queries.',
    link: { label: '+91 77600 60026', href: 'https://wa.me/917760060026' },
  },
  {
    id: 'hq-card',
    icon: MapPin,
    title: 'Headquarters',
    desc: 'Rajarajeshwari Nagar\nBengaluru',
    link: null,
  },
];

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(form: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!form.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!form.subject) errors.subject = 'Please select a subject.';
  if (!form.message.trim()) errors.message = 'Message is required.';
  else if (form.message.trim().length < 10)
    errors.message = 'Message must be at least 10 characters.';
  if (!form.agreed) errors.agreed = 'You must agree to the Privacy Policy.';
  return errors;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [form, setForm]         = useState<FormFields>(INITIAL_FORM);
  const [errors, setErrors]     = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Field helpers ──────────────────────────────────────────────────────────
  function setField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error for field as user types
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const payload = {
      customerName:  form.fullName,
      customerEmail: form.email,
      subject:       form.subject,
      message:       form.message,
      inquiryType:   'CONTACT_FORM',
    };

    try {
      await api.post('/leads', payload);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 429) {
        setSubmitError("You've sent a few messages already — please wait a minute and try again.");
      } else {
        setSubmitError('Something went wrong sending your message. Please try again shortly.');
      }
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSuccess(true);
    setForm(INITIAL_FORM);
    setErrors({});
  }

  // ── Shared input classes ───────────────────────────────────────────────────
  const inputBase =
    'w-full px-3.5 py-2.5 text-sm text-navy-900 bg-white rounded-lg border transition-all duration-150 ' +
    'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00668a]/30 focus:border-[#00668a]';
  const inputNormal = `${inputBase} border-gray-200`;
  const inputError  = `${inputBase} border-red-400 focus:ring-red-200`;

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* ══════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════ */}
      <section
        className="py-14 lg:py-20 text-center"
        id="contact-header"
        aria-label="Contact page header"
      >
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-navy-900 mb-4 leading-tight">
            Let&apos;s Connect
          </h1>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed">
            Whether you have a question about our projects, need technical support, or
            just want to discuss digital craftsmanship, our team is ready to assist you.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT — Info cards + Form
      ══════════════════════════════════════════════════════ */}
      <section
        className="pb-20 lg:pb-28"
        id="contact-main"
        aria-label="Contact information and form"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] gap-6">

            {/* ── Left: Info cards ───────────────────────────── */}
            <div className="flex flex-col gap-4" id="contact-info">
              {INFO_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    id={card.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3
                               hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Icon + title row */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#e6f4f8] flex items-center justify-center flex-shrink-0">
                        <Icon size={17} className="text-[#00668a]" strokeWidth={1.8} />
                      </div>
                      <h2 className="font-display font-semibold text-base text-navy-900">
                        {card.title}
                      </h2>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                      {card.desc}
                    </p>

                    {/* Link */}
                    {card.link && (
                      <a
                        href={card.link.href}
                        target={card.link.href.startsWith('http') ? '_blank' : undefined}
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#00668a]
                                   hover:text-[#005070] transition-colors"
                      >
                        {card.link.label}
                        <ArrowUpRight size={13} strokeWidth={2} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Right: Contact form ────────────────────────── */}
            <div
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8"
              id="contact-form-card"
            >
              <h2 className="font-display font-bold text-2xl text-navy-900 mb-7">
                Send a Message
              </h2>

              {/* ── Success state ── */}
              {success && (
                <div
                  className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6 animate-fade-in"
                  role="alert"
                  id="success-message"
                >
                  <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Message sent!</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Error state ── */}
              {submitError && (
                <div
                  className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 animate-fade-in"
                  role="alert"
                >
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-red-700">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate id="contact-form">

                {/* ── Row 1: Full Name + Email ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Jane Doe"
                      value={form.fullName}
                      onChange={(e) => setField('fullName', e.target.value)}
                      className={errors.fullName ? inputError : inputNormal}
                      aria-invalid={!!errors.fullName}
                      aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    />
                    {errors.fullName && (
                      <p id="fullName-error" className="mt-1.5 text-xs text-red-500">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      className={errors.email ? inputError : inputNormal}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1.5 text-xs text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* ── Row 2: Subject ── */}
                <div className="mb-5">
                  <label
                    htmlFor="subject"
                    className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5"
                  >
                    Subject
                  </label>
                  <div className="relative">
                    <select
                      id="subject"
                      value={form.subject}
                      onChange={(e) => setField('subject', e.target.value)}
                      className={`${errors.subject ? inputError : inputNormal} appearance-none pr-10 cursor-pointer`}
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? 'subject-error' : undefined}
                    >
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {/* Custom chevron */}
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                  {errors.subject && (
                    <p id="subject-error" className="mt-1.5 text-xs text-red-500">
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* ── Row 3: Message ── */}
                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="How can we help you build better?"
                    value={form.message}
                    onChange={(e) => setField('message', e.target.value)}
                    className={`${errors.message ? inputError : inputNormal} resize-y min-h-[120px]`}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && (
                    <p id="message-error" className="mt-1.5 text-xs text-red-500">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* ── Row 4: Checkbox + Submit ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                  {/* Checkbox */}
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        id="agreed"
                        type="checkbox"
                        checked={form.agreed}
                        onChange={(e) => setField('agreed', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#00668a] cursor-pointer
                                   focus:ring-2 focus:ring-[#00668a]/30 focus:ring-offset-1"
                        aria-invalid={!!errors.agreed}
                        aria-describedby={errors.agreed ? 'agreed-error' : undefined}
                      />
                      <span className="text-sm text-gray-500 select-none">
                        I agree to the{' '}
                        <Link
                          href="/privacy"
                          className="text-[#00668a] hover:text-[#005070] underline underline-offset-2 transition-colors"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                    {errors.agreed && (
                      <p id="agreed-error" className="text-xs text-red-500 ml-6">
                        {errors.agreed}
                      </p>
                    )}
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    id="submit-btn"
                    disabled={submitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl
                               bg-[#00668a] hover:bg-[#005070] active:bg-[#004060]
                               text-white font-semibold text-sm
                               transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0
                               disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
                               focus:outline-none focus:ring-2 focus:ring-[#00668a] focus:ring-offset-2"
                    aria-busy={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send size={15} strokeWidth={2} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
