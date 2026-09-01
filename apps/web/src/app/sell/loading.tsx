import React from 'react';

export default function SellLoading() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 space-y-6">
      <div className="h-8 w-64 bg-background-subtle rounded animate-pulse" />
      <div className="p-8 rounded-md border border-border bg-surface space-y-6 animate-pulse">
        <div className="h-6 w-40 bg-background-subtle rounded" />
        <div className="space-y-4">
          <div className="h-10 w-full bg-background-subtle rounded" />
          <div className="h-10 w-full bg-background-subtle rounded" />
          <div className="h-24 w-full bg-background-subtle rounded" />
        </div>
      </div>
    </div>
  );
}
