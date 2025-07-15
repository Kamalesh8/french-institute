"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { saveResource, getResource, Resource } from '@/lib/services/resources';
import { useAuth } from '@/context/auth-context';

export default function EditResourcePage() {
  const { category } = useParams() as { category: string };
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'teacher' && user.role !== 'admin') {
      router.push('/');
      return;
    }

    (async () => {
      const data = await getResource(category);
      if (data) {
        setTitle(data.title);
        setContent(data.content);
      }
      setLoading(false);
    })();
  }, [user, category, router]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: Resource = { title, content };
      await saveResource(category, payload);
      alert('Resource saved successfully');
      setTitle('');
      setContent('');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-8">Loading...</p>;
  }

  return (
    <main className="container mx-auto py-8 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold capitalize">Edit {category} Resource</h1>
      <label className="block space-y-1">
        <span className="font-medium">Title</span>
        <input
          className="w-full border rounded p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="block space-y-1">
        <span className="font-medium">Content (HTML/Markdown)</span>
        <textarea
          className="w-full h-80 border rounded p-2 font-mono"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </label>
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/80 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </main>
  );
}
