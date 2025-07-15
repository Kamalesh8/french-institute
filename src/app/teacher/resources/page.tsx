"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

const categories = [
  'vocabulary',
  'grammar',
  'pronunciation',
  'exercises',
  'blog',
];

export default function TeacherResourcesHome() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;
  if (user.role !== 'teacher' && user.role !== 'admin') {
    router.push('/');
    return null;
  }

  return (
    <main className="container mx-auto py-16">
      <h1 className="text-3xl font-bold mb-6">Edit Resources</h1>
      <ul className="space-y-3">
        {categories.map((c) => (
          <li key={c}>
            <Link
              href={`/teacher/resources/${c}`}
              className="text-primary hover:underline capitalize"
            >
              {c}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
