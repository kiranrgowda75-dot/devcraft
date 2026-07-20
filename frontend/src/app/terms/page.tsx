import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | DevCraftPro',
  description: 'Read the Terms of Service for using the DevCraftPro platform and services.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container-main py-16 max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-brand-600 hover:underline">← Back to Home</Link>
        </div>
        <h1 className="text-4xl font-display font-bold text-navy-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: July 2025</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using DevCraftPro, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">2. Use of Services</h2>
            <p>You agree to use DevCraftPro only for lawful purposes and in accordance with these terms. You must not use our platform to distribute malicious software, infringe intellectual property, or engage in fraudulent activity.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">3. Project Purchases</h2>
            <p>All project purchases on DevCraftPro are for personal or commercial use as described in the individual project listing. Reselling or redistributing purchased projects without written permission is strictly prohibited.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">4. Custom Projects</h2>
            <p>Custom project requests are subject to separate agreements between DevCraftPro and the client. Timelines, deliverables, and payment terms will be outlined in a dedicated project agreement.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">5. Intellectual Property</h2>
            <p>All content, designs, and code on DevCraftPro are the intellectual property of DevCraftPro unless otherwise stated. Purchased project licenses are granted for use only and do not transfer ownership.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">6. Limitation of Liability</h2>
            <p>DevCraftPro shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or purchased projects.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">7. Contact Us</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:devcraftp@gmail.com" className="text-brand-600 hover:underline">devcraftp@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
