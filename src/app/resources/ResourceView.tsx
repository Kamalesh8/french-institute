import React from 'react';
import { getResource } from '@/lib/services/resources';

interface Props {
  category: string;
}

export default async function ResourceView({ category }: Props) {
  const data = await getResource(category);

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No content available yet. Please check back later.
      </div>
    );
  }

  return (
    <article className="prose max-w-none">
      <h1>{data.title}</h1>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: data.content }} />
      {data.updatedAt && (
        <p className="mt-8 text-sm text-muted-foreground">
          Last updated: {new Date(data.updatedAt).toLocaleDateString()}
        </p>
      )}
    </article>
  );
}
