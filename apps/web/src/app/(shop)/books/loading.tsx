import React from 'react';
import { BookGridSkeleton } from '@/components/shared/skeletons';

export default function BooksLoading() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 space-y-6">
      <div className="h-8 w-48 bg-background-subtle rounded animate-pulse" />
      <BookGridSkeleton count={8} />
    </div>
  );
}
