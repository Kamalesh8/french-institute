import React from 'react';
import MainLayout from '@/components/layout/main-layout';

export default function CookiesPage() {
  return (
    <MainLayout>
      <main className="container mx-auto max-w-3xl py-16 px-4 leading-relaxed">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Cookie Policy</h1>

        <p className="mb-6">
          Cookies ≠ snacks—but they’re still useful! Our site uses cookies to give you the smoothest, most personalized experience possible.
        </p>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-bold">1. What Are Cookies?</h2>
          <p>Small text files stored on your device to remember preferences and activity.</p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-bold">2. Types We Use</h2>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li><strong>Essential cookies</strong>: Help the website run and keep you logged in.</li>
            <li><strong>Performance cookies</strong>: Track site usage to improve user experience.</li>
            <li><strong>Functional cookies</strong>: Remember your preferences, like language or layout.</li>
            <li><strong>Analytics cookies</strong>: Help us understand what's working (or not).</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-bold">3. Consent</h2>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>You’ll be asked to accept cookies when you first visit.</li>
            <li>You can update or withdraw consent via browser settings at any time.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">4. Third-Party Tools</h2>
          <p>Some cookies may come from services like Google Analytics or embedded media. We ensure these tools comply with privacy regulations.</p>
        </section>
      </main>
    </MainLayout>
  );
}
