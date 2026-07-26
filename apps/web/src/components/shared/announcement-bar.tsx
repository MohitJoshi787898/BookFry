'use client';

import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#0B1320] text-white text-xs font-sans py-2 px-4 sm:px-6 lg:px-8 transition-all duration-200 flex items-center justify-between z-50">
      {/* Left side text */}
      <div className="flex-1 flex items-center justify-center lg:justify-start space-x-2 text-center lg:text-left">
        <Sparkles className="h-3.5 w-3.5 text-[#F26522] animate-pulse shrink-0" />
        <span className="font-medium tracking-wide text-[11px] sm:text-xs text-slate-200">
          <span className="font-bold text-[#F26522] font-sans">पढ़िए, बचाइए और बेचिए</span>
          <span className="mx-2 opacity-30">|</span>
          Save up to 80% on pre-owned textbooks • Free shipping on orders over <strong className="font-bold text-white">₹499</strong>
        </span>
      </div>
      
      {/* Right side items */}
      <div className="hidden lg:flex items-center space-x-4 shrink-0">
        <Link
          href="/about"
          className="px-3 py-1 border border-white/20 hover:border-white hover:bg-white/10 text-white text-[10px] font-bold rounded-full transition-all tracking-wider"
        >
          Learn More
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
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
