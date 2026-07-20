'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, ArrowRight, BookOpen } from 'lucide-react';

import { HeroBookStackIllustration } from '@/components/illustrations/book-illustrations';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';

export function HeroSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/books?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const quickTags = [
    { label: 'Engineering & Tech', href: '/books?category=engineering' },
    { label: 'Exams & Study Prep', href: '/books?category=exams' },
    { label: 'Used Textbooks', href: '/books?condition=good' },
    { label: 'Medical & Science', href: '/books?category=medical' },
  ];

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-background via-background-subtle to-background border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Editorial Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-4 border border-brand/20">
                <BookOpen className="h-4 w-4 text-secondary" />
                <span className="font-serif italic text-secondary tracking-wide text-xs">
                  &quot;क्योंकि.. पढ़ाई रुकनी नहीं चाहिए&quot;
                </span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-[1.1]">
                Discover Your Next Book, <br />
                <span className="text-brand italic font-serif">Exchange Knowledge & Grow.</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-base sm:text-lg text-text-secondary font-sans leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              India&apos;s leading student marketplace for buying, selling, and reusing textbooks. Save up to 80% on college study guides, competitive exam prep, and novels while giving books a second life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 font-sans"
            >
              <Link
                href="/books"
                className="w-full sm:w-auto rounded-md bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-brand-hover transition-all duration-120 flex items-center justify-center space-x-2"
              >
                <span>📚 Buy Books</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sell"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    useAuthModalStore.getState().openModal('login', '/sell');
                  }
                }}
                className="w-full sm:w-auto rounded-md bg-secondary px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-secondary-600 transition-all duration-120 flex items-center justify-center space-x-2"
              >
                <span>💰 Sell Your Books</span>
              </Link>
            </motion.div>

            {/* Impact Stats */}
            <div className="pt-6 border-t border-border/60 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <span className="font-serif text-xl sm:text-2xl font-bold text-brand font-mono">50,000+</span>
                <p className="text-[11px] text-text-muted uppercase font-bold tracking-wider">Books Listed</p>
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl font-bold text-secondary font-mono">₹1.2Cr+</span>
                <p className="text-[11px] text-text-muted uppercase font-bold tracking-wider">Saved by Students</p>
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl font-bold text-brand font-mono">99.4%</span>
                <p className="text-[11px] text-text-muted uppercase font-bold tracking-wider">Verified Quality</p>
              </div>
            </div>
          </div>

          {/* Right Vector Illustration & Search Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Custom Book Stack Illustration */}
            <div className="w-full max-w-md mx-auto">
              <HeroBookStackIllustration className="w-full h-auto max-h-72 drop-shadow-md" />
            </div>

            <div className="rounded-lg border border-border bg-surface p-6 shadow-lg space-y-4 relative overflow-hidden backdrop-blur-sm">
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-text-primary">Instant Catalog Search</h3>
                <p className="text-xs text-text-secondary font-sans">
                  Search by title, author, or 13-digit ISBN to check availability & best prices.
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-3 font-sans">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Engineering Mathematics or 9780143127741"
                    aria-label="Instant catalog search by title, author, or ISBN"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-md text-xs uppercase tracking-wider transition-colors shadow"
                >
                  Search Books
                </button>
              </form>

              {/* Quick Tags */}
              <div className="pt-2 border-t border-border/60">
                <div className="flex flex-wrap gap-2 font-sans">
                  {quickTags.map((tag) => (
                    <Link
                      key={tag.label}
                      href={tag.href}
                      className="px-2.5 py-1 bg-background-subtle hover:bg-brand/10 hover:text-brand border border-border rounded-full text-xs font-medium text-text-secondary transition-colors"
                    >
                      {tag.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
