'use client';

import React from 'react';
import Link from 'next/link';
import { StudentCommunityIllustration } from '@/components/illustrations/book-illustrations';
import { ArrowRight, Sparkles } from 'lucide-react';

export function ReadingJourneyCTA() {
  return (
    <section className="py-16 sm:py-24 bg-surface border-b border-border font-sans relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-2xl bg-gradient-to-r from-brand-hover via-brand to-primary-900 text-white p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-brand-hover">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-accent text-xs font-bold uppercase tracking-wider border border-white/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Join 100,000+ Readers & Students</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Start Your Reading Journey Today.
            </h2>

            <p className="font-serif italic text-accent font-semibold text-lg sm:text-xl">
              &quot;क्योंकि.. पढ़ाई रुकनी नहीं चाहिए&quot;
            </p>

            <p className="text-sm text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Whether you need semester textbooks, competitive exam guides, or timeless fiction, find them all at unbeatable prices on BookFry.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/books"
                className="w-full sm:w-auto px-6 py-3.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-md text-xs uppercase tracking-wider transition-colors shadow flex items-center justify-center space-x-2"
              >
                <span>📚 Explore Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sell"
                className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-md text-xs uppercase tracking-wider transition-colors text-center"
              >
                💰 Sell Your Books
              </Link>
            </div>
          </div>

          {/* Right Vector Illustration */}
          <div className="lg:col-span-5 text-center">
            <div className="w-full max-w-md mx-auto">
              <StudentCommunityIllustration className="w-full h-auto max-h-64 drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReadingJourneyCTA;
