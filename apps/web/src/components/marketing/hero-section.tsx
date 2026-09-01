'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Tag,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { StatItem } from '../shared/stat-item';
import { HeroSceneLayered } from './hero-scene-layered';
import { MascotScrollChoreography } from './mascot-scroll-choreography';
import { FloatingStars } from './floating-stars';

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

export function HeroSection({
  eyebrow = 'क्योंकि.. पढ़ाई रुकनी नहीं चाहिए',
  title = 'Books you love.',
  highlightText = "Deals you'll adore.",
  subtitle = 'Discover stories you’ll love, find your next great read, and give books a new chapter. Verified textbooks at unbeatable prices across India.',
  primaryCtaLabel = 'Browse Books',
  primaryCtaUrl = '/books',
  secondaryCtaLabel = 'Sell Your Books',
  secondaryCtaUrl = '/sell',
  escrowBadge = 'Direct Peer-to-Peer Campus Escrow',
  stats = [
    { value: '50,000+', label: 'Books listed' },
    { value: '₹1.2Cr+', label: 'Student savings' },
    { value: '99.4%',   label: 'Quality verified' },
  ],
}: HeroSectionProps = {}) {
  const { isAuthenticated } = useAuthStore();
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const referenceHeadline = (title.split('.')[0] || 'Books you love').trim();
  const headlineWords = referenceHeadline.split(/\s+/);
  const headlineAccent = highlightText || headlineWords.pop() || 'love';
  const headlineLead = highlightText ? referenceHeadline : headlineWords.join(' ');

  const reveal = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: EASE },
        };

  return (
    <section
      ref={heroRef}
      className="dark-section relative overflow-hidden bg-[#151B29] border-b border-white/10 py-10 sm:py-14 lg:py-20 text-[#F8FAFC]"
    >
      {/* Background Floating Stars and Ambient Lighting */}
      <FloatingStars />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-[550px] w-[900px] rounded-full bg-secondary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-10 h-72 w-72 rounded-full bg-primary/40 blur-2xl"
      />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        
        {/* ── Top Grid: Editorial Left (7 cols) + Multi-Layer Scene Right (5 cols) ── */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">

          {/* Left Column: Headline, Description, CTAs, Live Stats */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <motion.div {...reveal(0)}>
              {/* Brand Motto Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-secondary shadow-[0_2px_12px_rgba(255,159,45,0.2)]">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>{eyebrow}</span>
                <Sparkles className="h-4 w-4 animate-pulse text-secondary" aria-hidden="true" />
              </div>

              {/* Large Bold Hero Headline */}
              <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.06] tracking-tight text-white">
                {headlineLead}{' '}
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-secondary via-amber-300 to-secondary">
                  {headlineAccent}
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-secondary/60"
                    height="12"
                    viewBox="0 0 120 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 7.5C32 2.5 88 2.5 118 7.5"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
            </motion.div>

            {/* Subtitle Description */}
            <motion.p
              {...reveal(0.08)}
              className="mx-auto lg:mx-0 max-w-xl text-sm sm:text-base font-normal leading-relaxed text-slate-300"
            >
              {subtitle}
            </motion.p>

            {/* Premium Action Buttons */}
            <motion.div
              {...reveal(0.16)}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1"
            >
              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href={primaryCtaUrl}
                  className="group w-full h-13 px-8 py-3.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black rounded-2xl text-sm sm:text-base transition-all shadow-[0_4px_24px_rgba(255,159,45,0.35)] hover:shadow-[0_8px_32px_rgba(255,159,45,0.5)] flex items-center justify-center gap-2 active:scale-95"
                >
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span>{primaryCtaLabel}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
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
                  className="group w-full h-13 px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-secondary/50 text-white font-bold rounded-2xl text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95 backdrop-blur-sm"
                >
                  <Store className="h-4 w-4 text-secondary" aria-hidden="true" />
                  <span>{secondaryCtaLabel}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Live Stats Bar */}
            <motion.div
              {...reveal(0.24)}
              className="grid grid-cols-3 gap-2 sm:gap-3 border-t border-white/10 pt-5 mt-2"
            >
              {stats.map((st, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/5 border border-white/10 p-3 shadow-md backdrop-blur-md transition-transform hover:-translate-y-1"
                >
                  <StatItem
                    icon={idx === 0 ? BookOpen : idx === 1 ? Tag : ShieldCheck}
                    value={st.value}
                    label={st.label}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Multi-Layer Parallax Illustrated Scene */}
          <motion.div
            {...reveal(0.12)}
            className="relative flex flex-col items-center justify-center lg:col-span-5 order-first lg:order-none"
          >
            <HeroSceneLayered heroRef={heroRef} escrowBadge={escrowBadge} />
          </motion.div>
        </div>

      </div>

      {/* Mascot Scroll Choreography Companion that follows down page */}
      <MascotScrollChoreography />
    </section>
  );
}

export default HeroSection;
