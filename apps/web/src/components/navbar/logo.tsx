'use client';

import React from 'react';
import Link from 'next/link';

export function BookFryLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2 shrink-0 select-none group">
      <svg className="h-7 w-7 transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Left Page (Navy) */}
        <path d="M12 21V7a4 4 0 0 0-4-4H2v14h6a3 3 0 0 1 3 3z" stroke="#1A3B5C" fill="#1A3B5C" fillOpacity="0.05" />
        {/* Right Page (Orange) */}
        <path d="M12 21V7a4 4 0 0 1 4-4h6v14h-6a3 3 0 0 0-3 3z" stroke="#F26522" fill="#F26522" fillOpacity="0.1" />
      </svg>
      <span className="font-sans text-xl sm:text-2xl font-black tracking-tight text-[#1A3B5C] dark:text-white">
        Book<span className="text-[#F26522]">Fry</span>
      </span>
    </Link>
  );
}

export default BookFryLogo;
