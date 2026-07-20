import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | DevCraftPro',
  description: 'Learn how DevCraftPro collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container-main py-16 max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-brand-600 hover:underline">← Back to Home</Link>
        </div>
        <h1 className="text-4xl font-display font-bold text-navy-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: July 2025</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as your name, email address, and any messages you send through our contact form. We may also collect usage data such as pages visited and time spent on our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, respond to your inquiries, and send you updates about projects or orders you have placed with us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">3. Sharing of Information</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our platform, subject to confidentiality agreements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">4. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information at any time. To exercise these rights, please contact us at <a href="mailto:devcraftp@gmail.com" className="text-brand-600 hover:underline">devcraftp@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please reach out to us at <a href="mailto:devcraftp@gmail.com" className="text-brand-600 hover:underline">devcraftp@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
