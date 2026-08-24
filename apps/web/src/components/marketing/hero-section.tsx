'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Search,
  ArrowRight,
  BookOpen,
  Tag,
  ShieldCheck,
  Bookmark,
  Sparkles,
  Zap,
  Flame,
  Store,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { StatItem } from '../shared/stat-item';
import { SearchPillChip } from '../shared/search-pill-chip';

export interface HeroSectionProps {
  eyebrow?: string;
  title?: string;
  highlightText?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  image?: string;
  escrowBadge?: string;
  searchHeading?: string;
  searchSubheading?: string;
  searchPlaceholder?: string;
  searchButtonLabel?: string;
  discountBadge?: string;
  popularSearchesLabel?: string;
  quickTags?: { label: string; href: string }[];
  stats?: { value: string; label: string }[];
}
const EASE = [0.22, 1, 0.36, 1] as const;

const defaultQuickTags = [
  { label: 'Engineering', href: '/books?category=engineering' },
  { label: 'NEET Books', href: '/books?search=NEET' },
  { label: 'JEE Main', href: '/books?search=JEE' },
  { label: 'Class 12', href: '/books?search=Class+12' },
  { label: 'CA Books', href: '/books?search=CA' },
  { label: 'UPSC', href: '/books?search=UPSC' },
  { label: 'Novels', href: '/books?category=fiction' },
  { label: 'B.Sc. Books', href: '/books?search=B.Sc' },
];

export function HeroSection({
  eyebrow = 'क्योंकि.. पढ़ाई रुकनी नहीं चाहिए',
  title = 'Books you love. Deals you\'ll',
  highlightText = 'adore.',
  subtitle = 'Buy, sell, and discover verified new & used textbooks at unbeatable prices across India. Read more, spend less, and make every page count.',
  primaryCtaLabel = 'Buy Books',
  primaryCtaUrl = '/books',
  secondaryCtaLabel = 'Sell Your Books',
  secondaryCtaUrl = '/sell',
  image = '/fox_reading_178491148655455.png',
  escrowBadge = 'Direct Peer-to-Peer Campus Escrow',
  searchHeading = 'Search Millions of Verified Textbooks & Novels',
  searchSubheading = 'Instant Book Finder',
  searchPlaceholder = 'Search Engineering, NEET, UPSC, Novels, or ISBN...',
  searchButtonLabel = 'Search Catalog',
  discountBadge = 'Up to 80% Off Retail Prices',
  popularSearchesLabel = 'Popular Searches:',
  quickTags = defaultQuickTags,
  stats = [
    { value: '50,000+', label: 'Books listed' },
    { value: '₹1.2Cr+', label: 'Student savings' },
    { value: '99.4%', label: 'Quality verified' },
  ],
}: HeroSectionProps = {}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState('');
  const prefersReducedMotion = useReducedMotion();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/books?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const reveal = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden border-b border-border bg-background transition-colors duration-200 py-8 sm:py-12 lg:py-16">
      {/* Decorative ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-secondary/15 dark:bg-secondary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-4 h-80 w-80 rounded-full bg-primary/10 dark:bg-primary/25 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        
        {/* Top Grid Row: Editorial Left + Large Mascot Right */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          
          {/* Left Editorial Text (7 Columns on Desktop) */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-5">
            <motion.div {...reveal(0)}>
              {/* Brand Motto Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 dark:bg-secondary/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-secondary shadow-xs">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>{eyebrow}</span>
                <Sparkles className="h-4 w-4 animate-pulse text-amber-500" />
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-primary dark:text-foreground">
                {title}{' '}
                <span className="relative inline-block text-secondary">
                  {highlightText}
                  <svg
                    className="absolute -bottom-1.5 left-0 w-full text-secondary/40"
                    height="10"
                    viewBox="0 0 120 10"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6.5C30 1.5 90 1.5 118 6.5"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
            </motion.div>

            {/* Sub-description */}
            <motion.p
              {...reveal(0.08)}
              className="mx-auto lg:mx-0 max-w-xl text-sm sm:text-base font-normal leading-relaxed text-text-secondary"
            >
              {subtitle}
            </motion.p>

            {/* Action Buttons Stack (Touch-First App Ergonomics) */}
            <motion.div
              {...reveal(0.16)}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1"
            >
              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href={primaryCtaUrl}
                  className="w-full h-12 sm:h-12 px-8 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 active:scale-95"
                >
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span>{primaryCtaLabel}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href={secondaryCtaUrl}
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      useAuthModalStore
                        .getState()
                        .openModal('seller_signup', '/seller/dashboard');
                    }
                  }}
                  className="w-full h-12 sm:h-12 px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-xl text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-center active:scale-95"
                >
                  <Store className="h-4 w-4" aria-hidden="true" />
                  <span>{secondaryCtaLabel}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Live Stats Bar */}
            <motion.div
              {...reveal(0.24)}
              className="grid grid-cols-3 gap-2 sm:gap-3 border-t border-border/80 pt-5 mt-5"
            >
              {stats.map((st: { value: string; label: string }, idx: number) => (
                <div key={idx} className="hover-page-turn rounded-2xl bg-card border border-border/60 p-3 shadow-2xs">
                  <StatItem icon={idx === 0 ? BookOpen : idx === 1 ? Tag : ShieldCheck} value={st.value} label={st.label} />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: LARGE Mascot Fox Illustration (5 Columns on Desktop) */}
          <motion.div
            {...reveal(0.1)}
            className="relative flex flex-col items-center justify-center lg:col-span-5 order-first lg:order-none"
          >
            {/* Soft Ambient Radial Back-Aura */}
            <div
              className="pointer-events-none absolute h-80 w-80 rounded-full bg-secondary/20 dark:bg-secondary/15 blur-3xl"
              aria-hidden="true"
            />

            {/* Prominent Large Mascot Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="BookFry mascot"
              className="relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[460px] select-none object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-300"
            />

            {/* Floating Escrow Chip */}
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/90 border border-border backdrop-blur-md shadow-md text-xs font-extrabold text-text-primary">
              <Zap className="h-4 w-4 text-secondary animate-bounce" />
              <span>{escrowBadge}</span>
            </div>
          </motion.div>

        </div>

        {/* Bottom Full-Width Mobile-First Search Panel */}
        <motion.div
          {...reveal(0.28)}
          className="mt-8 sm:mt-12 rounded-3xl bg-gradient-to-r from-card via-card to-background-subtle border border-border/90 p-4 sm:p-6 shadow-xl dark:shadow-2xl font-sans"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/60 pb-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-secondary uppercase tracking-wider">
                <Flame className="h-4 w-4 text-secondary fill-secondary" />
                <span>{searchSubheading}</span>
              </div>
              <h2 className="text-base sm:text-xl font-serif font-extrabold text-text-primary">
                {searchHeading}
              </h2>
            </div>

            <div className="inline-flex items-center gap-1 bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full text-xs font-bold shrink-0">
              <Bookmark className="h-3.5 w-3.5 fill-secondary" />
              <span>{discountBadge}</span>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <label htmlFor="hero-search-input" className="sr-only">
                {searchPlaceholder}
              </label>
              <input
                id="hero-search-input"
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="focus-ring w-full h-12 rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-xs sm:text-sm font-bold text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand"
              />
            </div>
            <button
              type="submit"
              className="h-12 px-8 rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-extrabold uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 shrink-0"
            >
              <Search className="h-4 w-4" />
              <span>{searchButtonLabel}</span>
            </button>
          </form>

          {/* Quick Filter Tags (Horizontal Scrollable Mobile Bar) */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted shrink-0 pr-1">
              {popularSearchesLabel}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {quickTags.map((tag) => (
                <SearchPillChip
                  key={tag.label}
                  label={tag.label}
                  href={tag.href}
                />
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default HeroSection;
