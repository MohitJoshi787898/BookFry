'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StudentCommunityIllustration } from '@/components/illustrations/book-illustrations';
import { ArrowRight, Sparkles, BookOpen, Tag, ShieldCheck, Zap } from 'lucide-react';

export function ReadingJourneyCTA() {
  return (
    <section
      aria-labelledby="reading-journey-title"
      className="relative py-12 sm:py-16 lg:py-24 bg-background font-sans overflow-hidden transition-colors duration-200"
    >
      {/* Decorative ambient background glows for Light & Dark mode */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-10 -translate-y-1/2 w-72 h-72 rounded-full bg-secondary/15 dark:bg-secondary/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-10 -translate-y-1/2 w-80 h-80 rounded-full bg-brand/10 dark:bg-primary/20 blur-3xl pointer-events-none"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Card Shell - Mobile App-like Ergonomics */}
        <div className="relative rounded-3xl bg-gradient-to-br from-card via-card to-background-subtle dark:from-card dark:via-background-subtle dark:to-primary-950/20 border border-border p-6 sm:p-10 lg:p-14 shadow-xl dark:shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Top Decorative Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-secondary to-accent" />

          {/* Left Content Area (Mobile First Stacked Column) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            {/* Audience Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-secondary/10 dark:bg-secondary/20 text-secondary border border-secondary/20 text-xs font-extrabold tracking-wide"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>Join 100,000+ Readers & Students Across India</span>
            </motion.div>

            {/* Main Editorial Title */}
            <motion.h2
              id="reading-journey-title"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight leading-tight"
            >
              Start Your Reading & Learning Journey Today.
            </motion.h2>

            {/* Brand Slogan Ribbon Callout */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="inline-block"
            >
              <span className="font-serif italic text-sm sm:text-lg font-bold text-secondary-foreground bg-secondary px-4 py-1.5 rounded-xl shadow-sm tracking-wide">
                &quot;क्योंकि.. पढ़ाई रुकनी नहीं चाहिए&quot;
              </span>
            </motion.div>

            {/* Description Text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-xs sm:text-sm md:text-base text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium"
            >
              Whether you need semester textbooks, competitive exam guides (UPSC, GATE, NEET), or timeless literature, buy and sell verified books at unbeatable campus prices on BookFry.
            </motion.p>

            {/* Micro Stats / Trust Chips (App-like ergonomics) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-1 text-[11px] sm:text-xs font-bold text-text-secondary"
            >
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-background-subtle border border-border">
                <Tag className="h-3.5 w-3.5 text-secondary" />
                <span>Up to 80% Off</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-background-subtle border border-border">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                <span>Verified Sellers</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-background-subtle border border-border">
                <Zap className="h-3.5 w-3.5 text-accent" />
                <span>Instant Escrow Payouts</span>
              </div>
            </motion.div>

            {/* Action Buttons (Touch-Optimized for Mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-3"
            >
              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/books"
                  className="w-full h-12 sm:h-11 px-7 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold rounded-2xl sm:rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 active:scale-95"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Explore Catalog</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/sell"
                  className="w-full h-12 sm:h-11 px-7 bg-background-subtle hover:bg-border/60 text-text-primary border border-border font-extrabold rounded-2xl sm:rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 text-center active:scale-95"
                >
                  <span>Sell Used Books</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Vector Illustration & Floating Campus Rating Badge */}
          <div className="lg:col-span-5 relative text-center flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-sm sm:max-w-md mx-auto relative"
            >
              <StudentCommunityIllustration className="w-full h-auto max-h-64 sm:max-h-72 drop-shadow-md" />

              {/* Floating Mobile Glass Badge */}
              <div className="absolute -bottom-2 sm:bottom-0 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-4 bg-card/90 dark:bg-card/95 backdrop-blur-md border border-border px-4 py-2 rounded-2xl shadow-lg flex items-center space-x-2 text-left shrink-0">
                <div className="h-8 w-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-black text-xs">
                  ★
                </div>
                <div>
                  <p className="text-xs font-extrabold text-text-primary">4.9 / 5 Campus Rating</p>
                  <p className="text-[10px] font-medium text-text-muted">Trusted by IIT, DU & Anna Univ</p>
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
