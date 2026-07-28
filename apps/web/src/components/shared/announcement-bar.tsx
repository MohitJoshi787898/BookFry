'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { X, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface CmsPublicData {
  announcementText?: string;
  announcementEnabled?: boolean;
  announcementLink?: string;
}

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  const { data: cms } = useQuery<CmsPublicData>({
    queryKey: ['public-cms'],
    queryFn: () => apiClient('/contact/cms'),
    staleTime: 5 * 60 * 1000,
  });

  if (dismissed || cms?.announcementEnabled === false) return null;

  const text = cms?.announcementText || 'Save up to 80% on pre-owned textbooks • Free shipping on orders over ₹499';

  return (
    <div className="bg-primary text-primary-foreground text-xs font-sans py-2 px-4 sm:px-6 lg:px-8 transition-all duration-200 flex items-center justify-between z-50 shadow-sm border-b border-primary/20">
      {/* Left side text */}
      <div className="flex-1 flex items-center justify-center lg:justify-start space-x-2 text-center lg:text-left">
        <Sparkles className="h-3.5 w-3.5 text-secondary animate-pulse shrink-0" />
        <span className="font-medium tracking-wide text-[11px] sm:text-xs text-primary-foreground/90">
          <span className="font-bold text-secondary font-sans">क्योंकि.. पढ़ाई रुकनी नहीं चाहिए</span>
          <span className="mx-2 opacity-30">|</span>
          {text}
        </span>
      </div>
      
      {/* Right side items */}
      <div className="hidden lg:flex items-center space-x-4 shrink-0">
        <Link
          href="/books?discount=30"
          className="px-3 py-1 border border-primary-foreground/20 hover:border-primary-foreground hover:bg-primary-foreground/10 text-primary-foreground text-[10px] font-bold rounded-full transition-all tracking-wider"
        >
          Explore Deals
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-primary-foreground/10 rounded transition-colors text-primary-foreground/60 hover:text-primary-foreground"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Mobile close button */}
      <button
        onClick={() => setDismissed(true)}
        className="lg:hidden p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white ml-2 shrink-0"
        aria-label="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default AnnouncementBar;
