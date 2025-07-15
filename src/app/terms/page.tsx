import React from 'react';
import MainLayout from '@/components/layout/main-layout';

export default function TermsPage() {
  return (
    <MainLayout>
      <main className="container mx-auto max-w-3xl py-16 px-4 leading-relaxed">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Terms &amp; Conditions</h1>

        <p className="mb-6">
          Welcome to <span className="font-semibold">L’école Bibliothèque</span>! By accessing our website, enrolling in our courses, or participating in any of our experiences, you agree to abide by the following Terms &amp; Conditions.
        </p>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-bold">1. Usage Guidelines</h2>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>All content, courses, and materials are intended for personal educational use.</li>
            <li>You may not reproduce, distribute, or modify our content without explicit permission.</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-bold">2. Intellectual Property</h2>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>Every design, lesson, and creative concept on this site belongs to L’école Bibliothèque.</li>
            <li>Respect the originality—borrow inspiration, not ownership.</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-bold">3. Payments &amp; Access</h2>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>Fees must be paid in full before access to premium content is granted.</li>
            <li>Refunds are issued under exceptional circumstances and reviewed individually.</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-bold">4. Limitation of Liability</h2>
          <p>While we strive for perfection, we are not liable for temporary disruptions, errors, or third-party links.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">5. Changes</h2>
          <p>Terms may be updated occasionally. Continued use implies acceptance of any changes.</p>
        </section>
      </main>
    </MainLayout>
  );
}
