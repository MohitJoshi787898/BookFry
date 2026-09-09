'use client';

import React from 'react';
import Link from 'next/link';

interface BookFryLogoProps {
  className?: string;
  showTagline?: boolean;
}

export function BookFryLogo({ className = '', showTagline = false }: BookFryLogoProps) {
  return (
    <Link
      href="/"
      aria-label="BookFry Home"
      className={`group inline-flex items-center gap-2.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-xl transition-transform active:scale-95 ${className}`}
    >
      {/* Brand Icon Mark */}
      <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary via-primary/95 to-primary text-primary-foreground shadow-sm group-hover:shadow-md transition-all duration-200 border border-primary/20 shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:scale-105"
          aria-hidden="true"
        >
          {/* Left Book Page (Trust Blue) */}
          <path
            d="M12 21V7.5A3.5 3.5 0 0 0 8.5 4H2.5v13h6A3.5 3.5 0 0 1 12 21z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Book Page (Open Knowledge) */}
          <path
            d="M12 21V7.5A3.5 3.5 0 0 1 15.5 4h6v13h-6A3.5 3.5 0 0 0 12 21z"
            fill="var(--color-accent, #F26522)"
            fillOpacity="0.3"
            stroke="var(--color-accent, #F26522)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Central Circular Flame / Bookmark dot */}
          <circle cx="12" cy="7" r="1.5" fill="var(--color-accent, #F26522)" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <span className="font-serif text-xl sm:text-2xl font-black tracking-tight text-foreground">
          Book<span className="text-secondary font-sans font-extrabold tracking-normal">Fry</span>
        </span>
        {showTagline && (
          <span className="text-[9px] font-semibold text-muted-foreground tracking-wider uppercase mt-0.5">
            Book Marketplace
          </span>
        )}
      </div>
    </Link>
  );
}

export default BookFryLogo;
