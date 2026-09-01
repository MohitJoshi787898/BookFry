'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StudentCommunityIllustration } from '@/components/illustrations/book-illustrations';
import { ArrowRight, Sparkles, BookOpen, Tag, ShieldCheck, Zap } from 'lucide-react';

export interface ReadingJourneyCTAProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  slogan?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  image?: string;
  ratingTitle?: string;
  ratingSubtext?: string;
}

export function ReadingJourneyCTA({
  eyebrow = 'Join 100,000+ Readers & Students Across India',
  title = 'Start Your Reading & Learning Journey Today.',
  subtitle = 'Whether you need semester textbooks, competitive exam guides (UPSC, GATE, NEET), or timeless literature, buy and sell verified books at unbeatable campus prices on BookFry.',
  slogan = '“क्योंकि.. पढ़ाई रुकनी नहीं चाहिए”',
  primaryCtaLabel = 'Explore Catalog',
  primaryCtaUrl = '/books',
  secondaryCtaLabel = 'Sell Used Books',
  secondaryCtaUrl = '/sell',
  ratingTitle = '4.9 / 5 Campus Rating',
  ratingSubtext = 'Trusted by IIT, DU & Anna Univ',
}: ReadingJourneyCTAProps = {}) {
  return (
    <section
      aria-labelledby="reading-journey-title"
      className="relative py-14 sm:py-18 lg:py-24 bg-[#151B29] font-sans text-[#F8FAFC] overflow-hidden border-b border-white/10"
    >
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-10 -translate-y-1/2 w-80 h-80 rounded-full bg-[#FF9F2D]/15 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 rounded-full bg-[#1D2535] blur-3xl pointer-events-none"
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#1D2535] via-[#1D2535] to-[#242E40] border border-white/15 p-6 sm:p-10 lg:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9F2D] via-[#FFB347] to-[#E97918]" />

          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FF9F2D]/15 text-[#FF9F2D] border border-[#FF9F2D]/30 text-xs font-black tracking-wide"
            >
              <Sparkles className="h-4 w-4 animate-pulse text-[#FFB347]" />
              <span>{eyebrow}</span>
            </motion.div>

            <motion.h2
              id="reading-journey-title"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F8FAFC] tracking-tight leading-tight"
            >
              {title}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="inline-block"
            >
              <span className="italic text-sm sm:text-lg font-bold text-[#151B29] bg-gradient-to-r from-[#FF9F2D] to-[#FFB347] px-4 py-1.5 rounded-xl shadow-md tracking-wide">
                {slogan}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-xs sm:text-sm md:text-base text-[#AEB7C6] leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium"
            >
              {subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-1 text-[11px] sm:text-xs font-bold text-[#AEB7C6]"
            >
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#151B29] border border-white/10">
                <Tag className="h-3.5 w-3.5 text-[#FF9F2D]" />
                <span>Up to 80% Off</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#151B29] border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verified Sellers</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#151B29] border border-white/10">
                <Zap className="h-3.5 w-3.5 text-[#FFB347]" />
                <span>Instant Escrow Payouts</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-3"
            >
              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href={primaryCtaUrl}
                  className="w-full h-13 px-8 py-3.5 bg-gradient-to-r from-[#FF9F2D] to-[#E97918] hover:from-[#FFB347] hover:to-[#FF9F2D] text-[#151B29] font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(255,159,45,0.35)] flex items-center justify-center space-x-2 active:scale-95"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{primaryCtaLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href={secondaryCtaUrl}
                  className="w-full h-13 px-8 py-3.5 bg-[#151B29] hover:bg-[#242E40] text-[#F8FAFC] border border-white/10 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 text-center active:scale-95 shadow-sm"
                >
                  <span>{secondaryCtaLabel}</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative text-center flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-sm sm:max-w-md mx-auto relative"
            >
              <StudentCommunityIllustration className="w-full h-auto max-h-64 sm:max-h-72 drop-shadow-xl" />

              <div className="absolute -bottom-2 sm:bottom-0 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-4 bg-[#151B29]/95 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl shadow-xl flex items-center space-x-2 text-left shrink-0">
                <div className="h-8 w-8 rounded-full bg-[#FF9F2D]/20 text-[#FF9F2D] flex items-center justify-center font-black text-xs">
                  ★
                </div>
                <div>
                  <p className="text-xs font-bold text-[#F8FAFC]">{ratingTitle}</p>
                  <p className="text-[10px] font-medium text-[#7D8798]">{ratingSubtext}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReadingJourneyCTA;
