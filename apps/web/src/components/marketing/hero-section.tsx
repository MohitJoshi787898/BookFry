'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, ArrowRight, BookOpen, Tag } from 'lucide-react';

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/books?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const quickTags = [
    { label: 'Bestsellers', href: '/books?filter=bestseller' },
    { label: 'Fiction', href: '/books?category=fiction' },
    { label: 'Used Books', href: '/books?condition=good' },
    { label: 'Exams & Study', href: '/books?category=exams' },
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
              <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-4 border border-brand/20">
                <BookOpen className="h-3.5 w-3.5" />
                <span>The Premier Book Marketplace</span>
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-[1.1]">
                Find your next story, <br />
                <span className="text-brand italic font-serif">or sell your last.</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-base sm:text-lg text-text-secondary font-sans leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Discover hundreds of thousands of new and gently used books from certified sellers and fellow readers. Fast shipping, guaranteed condition, fair payouts.
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
                className="w-full sm:w-auto rounded-md bg-secondary px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-secondary-600 transition-all duration-120 flex items-center justify-center space-x-2"
              >
                <span>💰 Sell Your Books</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Floating Search & ISBN Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="rounded-lg border border-border bg-surface p-6 shadow-lg space-y-6 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-text-primary">Instant Catalog Search</h3>
                <p className="text-xs text-text-secondary font-sans">
                  Enter book title, author, or 13-digit ISBN to check live availability & price.
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-3 font-sans">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. 9780143127741 or Atomic Habits"
                    aria-label="Instant catalog search by title, author, or ISBN"
                    className="w-full pl-10 pr-4 py-3 text-sm bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-brand hover:bg-brand-hover text-white font-bold rounded-md text-xs uppercase tracking-wider transition-colors shadow"
                >
                  Search Books
                </button>
              </form>

              {/* Quick Tags */}
              <div className="pt-2 border-t border-border/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-2 font-sans flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Quick Filter Topics:
                </span>
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
