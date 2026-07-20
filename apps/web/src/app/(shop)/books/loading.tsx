import React from 'react';
import { BookGridSkeleton } from '@/components/shared/skeletons';

export default function BooksLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="h-8 w-48 bg-background-subtle rounded animate-pulse" />
      <BookGridSkeleton count={8} />
    </div>
  );
}
