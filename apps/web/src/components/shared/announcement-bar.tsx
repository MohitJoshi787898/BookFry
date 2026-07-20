'use client';

import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-brand text-white text-xs font-sans font-medium py-2 px-4 transition-all duration-200 flex items-center justify-between border-b border-brand-hover">
      <div className="mx-auto flex items-center space-x-2 text-center">
        <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
        <span>
          Free shipping on orders over <strong className="font-bold text-accent">$35</strong>! Use code{' '}
          <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[11px]">BOOKWORM</span>
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
