'use client';

import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-brand text-white text-xs font-sans font-medium py-2 px-4 transition-all duration-200 flex items-center justify-between border-b border-brand-hover">
      <div className="mx-auto flex items-center space-x-2 text-center">
        <Sparkles className="h-3.5 w-3.5 text-secondary animate-pulse" />
        <span className="font-serif italic text-accent font-semibold text-xs tracking-wide">
          &quot;क्योंकि.. पढ़ाई रुकनी नहीं चाहिए&quot;
        </span>
        <span className="hidden sm:inline opacity-40">|</span>
        <span className="hidden sm:inline">
          Save up to 80% on pre-owned textbooks • Free shipping on orders over <strong className="font-bold text-accent">₹499</strong>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-white/10 rounded transition-colors text-white/80 hover:text-white"
        aria-label="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default AnnouncementBar;
