'use client';

import React from 'react';

interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * 1. Hero Floating Book Stack & Flame Illustration
 */
export function HeroBookStackIllustration({ className = 'w-full h-auto', ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 500 420" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {/* Background Soft Knowledge Glow */}
      <circle cx="250" cy="210" r="180" fill="url(#hero-glow)" opacity="0.4" />

      {/* Floating Sparkles & Stars */}
      <path d="M120 80L124 92L136 96L124 100L120 112L116 100L104 96L116 92L120 80Z" fill="#F26522" opacity="0.8" />
      <path d="M380 60L383 70L393 73L383 76L380 86L377 76L367 73L377 70L380 60Z" fill="#FF9900" opacity="0.9" />
      <path d="M420 280L423 288L431 291L423 294L420 302L417 294L409 291L417 288L420 280Z" fill="#1A3B5C" opacity="0.6" />

      {/* Base Platform / Bookshelf Surface */}
      <ellipse cx="250" cy="360" rx="200" ry="24" fill="#E2E8F0" opacity="0.6" />

      {/* Bottom Large Textbook (Deep Navy) */}
      <rect x="110" y="300" width="280" height="40" rx="6" fill="#1A3B5C" />
      <rect x="130" y="306" width="250" height="28" fill="#F8FAFC" rx="3" />
      <path d="M110 300L120 340H110V300Z" fill="#142F4A" />
      {/* Ribbon Bookmark */}
      <path d="M320 300V348L330 340L340 348V300H320Z" fill="#F26522" />

      {/* Middle Textbook (Fiery Orange) */}
      <g transform="rotate(-3 250 270)">
        <rect x="130" y="255" width="240" height="38" rx="6" fill="#F26522" />
        <rect x="150" y="261" width="210" height="26" fill="#FFFFFF" rx="3" />
        <path d="M300 255V300L308 293L316 300V255H300Z" fill="#1A3B5C" />
      </g>

      {/* Top Open Book (Knowledge Exchange) */}
      <g transform="translate(130, 110)">
        {/* Left Page */}
        <path
          d="M120 120C80 100 30 105 10 115V35C30 25 80 20 120 40V120Z"
          fill="#FFFFFF"
          stroke="#1A3B5C"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Right Page */}
        <path
          d="M120 120C160 100 210 105 230 115V35C210 25 160 20 120 40V120Z"
          fill="#F8FAFC"
          stroke="#1A3B5C"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Book Spine Center */}
        <path d="M120 40V120" stroke="#F26522" strokeWidth="4" />

        {/* Text / Reading Lines */}
        <path d="M30 50H95M30 65H90M30 80H75" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
        <path d="M145 50H210M145 65H205M145 80H190" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />

        {/* BookFry Knowledge Flame Symbol Floating Above Open Book */}
        <path
          d="M120 15C120 15 135 -5 135 -20C135 -35 120 -45 120 -45C120 -45 105 -35 105 -20C105 -5 120 15 120 15Z"
          fill="url(#flame-gradient)"
        />
      </g>

      <defs>
        <radialGradient id="hero-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(250 210) scale(180)">
          <stop stopColor="#F26522" stopOpacity="0.3" />
          <stop offset="1" stopColor="#1A3B5C" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="flame-gradient" x1="105" y1="-45" x2="135" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F26522" />
          <stop offset="1" stopColor="#FF9900" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * 2. Exchange Knowledge / Student Peer Marketplace Illustration
 */
export function ExchangeKnowledgeIllustration({ className = 'w-full h-auto', ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 450 320" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <rect x="20" y="250" width="410" height="12" rx="6" fill="#CBD5E1" />

      {/* Student Seller (Left) */}
      <g transform="translate(50, 80)">
        <circle cx="50" cy="40" r="28" fill="#1A3B5C" />
        <path d="M20 130C20 95 35 80 50 80C65 80 80 95 80 130H20Z" fill="#1A3B5C" />
        {/* Holding Book */}
        <rect x="55" y="85" width="45" height="60" rx="4" fill="#F26522" transform="rotate(12 55 85)" />
        <path d="M60 90L95 97" stroke="#FFFFFF" strokeWidth="3" />
      </g>

      {/* Transfer Arrows / Knowledge Flow */}
      <g transform="translate(180, 110)">
        <path d="M10 20C40 -10 60 -10 90 20" stroke="#F26522" strokeWidth="4" strokeDasharray="6 6" strokeLinecap="round" />
        <path d="M85 22L95 20L90 10" fill="#F26522" />
        <path d="M90 60C60 90 40 90 10 60" stroke="#1A3B5C" strokeWidth="4" strokeDasharray="6 6" strokeLinecap="round" />
        <path d="M15 58L5 60L10 70" fill="#1A3B5C" />
      </g>

      {/* Student Buyer (Right) */}
      <g transform="translate(300, 80)">
        <circle cx="50" cy="40" r="28" fill="#F26522" />
        <path d="M20 130C20 95 35 80 50 80C65 80 80 95 80 130H20Z" fill="#F26522" />
        {/* Receiving Book */}
        <rect x="0" y="85" width="45" height="60" rx="4" fill="#1A3B5C" transform="rotate(-10 0 85)" />
        <path d="M5 90L40 84" stroke="#FFFFFF" strokeWidth="3" />
      </g>
    </svg>
  );
}

/**
 * 3. Eco-Book Sprouting Plant (Save Trees & Money) Illustration
 */
export function EcoBookIllustration({ className = 'w-full h-auto', ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {/* Soft Green Eco Glow */}
      <circle cx="200" cy="150" r="120" fill="#10B981" opacity="0.12" />

      {/* Open Book Base */}
      <g transform="translate(80, 140)">
        <path d="M120 100C80 85 30 90 10 100V30C30 20 80 15 120 30V100Z" fill="#FFFFFF" stroke="#1A3B5C" strokeWidth="4" />
        <path d="M120 100C160 85 210 90 230 100V30C210 20 160 15 120 30V100Z" fill="#F8FAFC" stroke="#1A3B5C" strokeWidth="4" />
        <path d="M120 30V100" stroke="#F26522" strokeWidth="4" />
      </g>

      {/* Sprouting Plant from Center */}
      <g transform="translate(180, 40)">
        <path d="M20 130Q20 70 20 30" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
        {/* Left Leaf */}
        <path d="M20 70C-10 60 -15 30 20 40Z" fill="#10B981" />
        {/* Right Leaf */}
        <path d="M20 50C50 40 55 10 20 20Z" fill="#059669" />
        {/* Glowing Sun Sparkle */}
        <circle cx="20" cy="10" r="8" fill="#FBBF24" />
      </g>
    </svg>
  );
}

/**
 * 4. Bookshelf & Categories Graphic Illustration
 */
export function BookshelfIllustration({ className = 'w-full h-auto', ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {/* Wooden Bookshelf Frame */}
      <rect x="20" y="230" width="360" height="16" rx="4" fill="#B45309" />

      {/* Spines of Books Stacked Vertically */}
      <rect x="40" y="90" width="32" height="140" rx="3" fill="#1A3B5C" />
      <rect x="44" y="100" width="24" height="6" fill="#F26522" />

      <rect x="76" y="70" width="40" height="160" rx="3" fill="#F26522" />
      <rect x="82" y="85" width="28" height="8" fill="#FFFFFF" />

      <rect x="120" y="110" width="28" height="120" rx="3" fill="#059669" />

      <rect x="152" y="80" width="36" height="150" rx="3" fill="#D97706" />
      <rect x="158" y="100" width="24" height="6" fill="#FFFFFF" />

      {/* Leaning Books */}
      <g transform="rotate(15 220 230)">
        <rect x="200" y="90" width="30" height="140" rx="3" fill="#2563EB" />
      </g>
      <g transform="rotate(18 250 230)">
        <rect x="230" y="95" width="34" height="135" rx="3" fill="#7C3AED" />
      </g>

      {/* Bookmark Ribbon Hanging */}
      <path d="M90 70V130L97 122L104 130V70H90Z" fill="#FBBF24" />
    </svg>
  );
}

/**
 * 5. Student Campus & Community Learning Illustration
 */
export function StudentCommunityIllustration({ className = 'w-full h-auto', ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 480 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <ellipse cx="240" cy="250" rx="200" ry="20" fill="#E2E8F0" opacity="0.6" />

      {/* Graduation / Student Cap floating */}
      <g transform="translate(200, 30)">
        <path d="M40 10L80 28L40 46L0 28L40 10Z" fill="#1A3B5C" />
        <rect x="25" y="36" width="30" height="16" fill="#142F4A" rx="2" />
        <path d="M80 28V60" stroke="#F26522" strokeWidth="3" />
        <circle cx="80" cy="62" r="4" fill="#F26522" />
      </g>

      {/* Group of Open Textbooks */}
      <g transform="translate(100, 120)">
        <rect x="20" y="60" width="120" height="80" rx="6" fill="#1A3B5C" />
        <rect x="160" y="40" width="140" height="100" rx="6" fill="#F26522" />
        <rect x="180" y="55" width="100" height="70" fill="#FFFFFF" rx="3" />
      </g>
    </svg>
  );
}

/**
 * 6. Empty State Bookshelf Graphic
 */
export function EmptyBookshelfIllustration({ className = 'w-full h-auto', ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <rect x="20" y="180" width="280" height="12" rx="4" fill="#CBD5E1" />
      {/* Reading Glasses on Empty Shelf */}
      <circle cx="120" cy="160" r="18" stroke="#1A3B5C" strokeWidth="4" />
      <circle cx="170" cy="160" r="18" stroke="#1A3B5C" strokeWidth="4" />
      <path d="M138 160H152" stroke="#1A3B5C" strokeWidth="4" />
      <path d="M102 160L85 150" stroke="#1A3B5C" strokeWidth="3" strokeLinecap="round" />
      <path d="M188 160L205 150" stroke="#1A3B5C" strokeWidth="3" strokeLinecap="round" />
      {/* Lone Bookmark */}
      <path d="M220 120V180L230 172L240 180V120H220Z" fill="#F26522" />
    </svg>
  );
}
