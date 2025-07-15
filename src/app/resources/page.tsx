"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function ResourcesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent('/resources')}`);
    }
  }, [loading, user, router]);

  if (!user) {
    return null; // or a spinner while redirecting
  }

  return (
    <main className="container mx-auto py-16">
      <h1 className="text-3xl font-bold">Learning Resources</h1>
      <p className="mt-4 text-muted-foreground">Select a resource category below:</p>
      <ul className="list-disc ml-6 mt-4 space-y-2">
        <li><Link href="/resources/grammar" className="text-primary hover:underline">Grammar</Link></li>
        <li><Link href="/resources/vocabulary" className="text-primary hover:underline">Vocabulary</Link></li>
        <li><Link href="/resources/pronunciation" className="text-primary hover:underline">Pronunciation</Link></li>
        <li><Link href="/resources/exercises" className="text-primary hover:underline">Exercises</Link></li>
        <li><Link href="/resources/blog" className="text-primary hover:underline">Blog</Link></li>
      </ul>
    </main>
  );
}
