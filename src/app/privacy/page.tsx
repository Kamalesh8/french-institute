import React from 'react';
import MainLayout from '@/components/layout/main-layout';

export default function PrivacyPolicyPage() {
  return (
    <MainLayout>
      <main className="container mx-auto max-w-3xl py-16 px-4 leading-relaxed">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Privacy Policy</h1>

        <p className="mb-6">
          Your privacy is your power—and we respect it. At <span className="font-semibold">L’école Bibliothèque</span>, protecting your data is as important as nurturing your curiosity.
        </p>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-bold">1. What We Collect</h2>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>Name, email, and details you voluntarily provide during enrollment, quizzes, and feedback.</li>
            <li>Usage data via cookies (see Cookie Policy).</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-bold">2. How We Use It</h2>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>To personalize your learning experience and improve our platform.</li>
            <li>For communication (newsletters, updates, course reminders).</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-bold">3. Sharing of Data</h2>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>We don’t sell your data—ever.</li>
            <li>Data may be shared with trusted service providers who assist our operations, but only as needed.</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-bold">4. Your Rights</h2>
          <p>You can request, modify, or delete your data anytime. Just reach out.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">5. International Compliance</h2>
          <p>We follow global standards like the GDPR to keep your data safe across borders.</p>
        </section>
      </main>
    </MainLayout>
  );
}
