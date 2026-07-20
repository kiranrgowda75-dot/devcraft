import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy | DevCraftPro',
  description: 'Understand how DevCraftPro uses cookies and similar tracking technologies.',
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container-main py-16 max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-brand-600 hover:underline">← Back to Home</Link>
        </div>
        <h1 className="text-4xl font-display font-bold text-navy-900 mb-4">Cookie Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: July 2025</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">1. What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">2. How We Use Cookies</h2>
            <p>DevCraftPro uses cookies to keep you logged in, remember your preferences, understand how you use our platform, and improve our services over time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">3. Types of Cookies We Use</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the platform to function correctly (e.g., session cookies).</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our platform.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences for a better experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">4. Managing Cookies</h2>
            <p>You can control and delete cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">5. Third-Party Cookies</h2>
            <p>We may use third-party services such as analytics providers that set their own cookies. We do not control these cookies and recommend reviewing the privacy policies of those providers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">6. Contact Us</h2>
            <p>If you have questions about our Cookie Policy, please contact us at <a href="mailto:devcraftp@gmail.com" className="text-brand-600 hover:underline">devcraftp@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
