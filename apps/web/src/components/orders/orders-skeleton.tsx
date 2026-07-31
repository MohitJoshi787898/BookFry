"use client";

import React from "react";

export function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl bg-card border border-border/80 p-6 space-y-4 animate-pulse shadow-sm"
        >
          <div className="flex justify-between items-center border-b border-border/60 pb-3">
            <div className="h-4 w-32 bg-muted rounded-md" />
            <div className="h-6 w-24 bg-muted rounded-full" />
          </div>
          <div className="flex gap-4 items-center">
            <div className="h-20 w-16 bg-muted rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-3/4 bg-muted rounded-md" />
              <div className="h-4 w-1/2 bg-muted rounded-md" />
            </div>
            <div className="h-8 w-28 bg-muted rounded-2xl hidden sm:block shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
