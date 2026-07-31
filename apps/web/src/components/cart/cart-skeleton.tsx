'use client';

import React from 'react';

export function CartSkeleton() {
  return (
    <div className="space-y-8 animate-pulse font-sans">
      {/* Header Skeleton */}
      <div className="h-44 w-full rounded-3xl bg-muted/60 border border-border/60" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="h-24 w-full rounded-3xl bg-muted/60 border border-border/60" />
          <div className="h-16 w-full rounded-3xl bg-muted/60 border border-border/60" />
          <div className="space-y-3">
            <div className="h-36 w-full rounded-3xl bg-muted/60 border border-border/60" />
            <div className="h-36 w-full rounded-3xl bg-muted/60 border border-border/60" />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="h-24 w-full rounded-3xl bg-muted/60 border border-border/60" />
          <div className="h-80 w-full rounded-3xl bg-muted/60 border border-border/60" />
        </div>
      </div>
    </div>
  );
}
