'use client';

import React from 'react';
import { SkeletonBookCard } from './book-card';

interface SkeletonGridProps {
  count?: number;
}

export function BookGridSkeleton({ count = 8 }: SkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBookCard key={i} />
      ))}
    </div>
  );
}

export function BookCarouselSkeleton({ count = 4 }: SkeletonGridProps) {
  return (
    <div className="w-full space-y-4">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end pb-2 border-b border-border/60">
        <div className="space-y-1">
          <div className="h-3 w-28 bg-background-subtle rounded animate-pulse" />
          <div className="h-6 w-48 bg-background-subtle rounded animate-pulse" />
        </div>
        <div className="flex space-x-2">
          <div className="h-8 w-8 rounded-full bg-background-subtle animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-background-subtle animate-pulse" />
        </div>
      </div>

      {/* Grid skeleton matching carousel dimensions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonBookCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function CategoryGridSkeleton({ count = 6 }: SkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-md border border-border bg-surface p-4 flex flex-col justify-between animate-pulse"
        >
          <div className="h-8 w-8 rounded bg-background-subtle" />
          <div className="space-y-1">
            <div className="h-4 w-20 bg-background-subtle rounded" />
            <div className="h-3 w-12 bg-background-subtle rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookDetailsSkeleton() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 space-y-12">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-64 bg-background-subtle rounded animate-pulse" />

      {/* Main 2-Column Detail Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Cover Image Skeleton (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="w-full aspect-[2/3] rounded-lg bg-background-subtle border border-border animate-pulse" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded bg-background-subtle animate-pulse" />
            ))}
          </div>
        </div>

        {/* Right Product Details Skeleton (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-background-subtle rounded-full animate-pulse" />
            <div className="h-8 w-3/4 bg-background-subtle rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-background-subtle rounded animate-pulse" />
          </div>

          <div className="h-8 w-32 bg-background-subtle rounded animate-pulse" />

          {/* Key Book Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-16 bg-background-subtle rounded animate-pulse" />
                <div className="h-4 w-20 bg-background-subtle rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-background-subtle rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-background-subtle rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-background-subtle rounded animate-pulse" />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <div className="h-12 flex-1 bg-background-subtle rounded-md animate-pulse" />
            <div className="h-12 w-14 bg-background-subtle rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 space-y-8">
      <div className="h-8 w-48 bg-background-subtle rounded animate-pulse" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-md border border-border bg-surface flex items-center space-x-4 animate-pulse"
            >
              <div className="w-16 h-24 bg-background-subtle rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-background-subtle rounded" />
                <div className="h-3 w-1/3 bg-background-subtle rounded" />
                <div className="h-4 w-20 bg-background-subtle rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card (4 cols) */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-md border border-border bg-surface space-y-4 animate-pulse">
            <div className="h-6 w-36 bg-background-subtle rounded" />
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-background-subtle rounded" />
                <div className="h-4 w-12 bg-background-subtle rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-background-subtle rounded" />
                <div className="h-4 w-12 bg-background-subtle rounded" />
              </div>
            </div>
            <div className="h-10 w-full bg-background-subtle rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SellerDashboardSkeleton() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 space-y-8">
      <div className="h-8 w-64 bg-background-subtle rounded animate-pulse" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-md border border-border bg-surface space-y-2 animate-pulse">
            <div className="h-3 w-20 bg-background-subtle rounded" />
            <div className="h-8 w-28 bg-background-subtle rounded" />
          </div>
        ))}
      </div>

      {/* Listings Table Skeleton */}
      <div className="p-6 rounded-md border border-border bg-surface space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-background-subtle rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-background-subtle rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
