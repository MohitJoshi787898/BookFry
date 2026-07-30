'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  BookText,
  GraduationCap,
  Wrench,
  Stethoscope,
  Briefcase,
  Baby,
  Backpack,
  ArrowRight,
  Compass,
} from 'lucide-react';

export function CategoryGrid() {
  const categories = [
    {
      title: 'Engineering',
      subtitle: 'B.Tech, M.Tech, GATE & CS',
      icon: Wrench,
      href: '/books?category=engineering',
      badge: '12.4k+ Books',
      gradient: 'from-blue-500/10 to-indigo-500/10 text-brand dark:text-primary',
      borderColor: 'group-hover:border-blue-500/50',
    },
    {
      title: 'Medical & Dental',
      subtitle: 'MBBS, BDS, NEET PG & Nursing',
      icon: Stethoscope,
      href: '/books?category=medical',
      badge: '8.1k+ Books',
      gradient: 'from-emerald-500/10 to-teal-500/10 text-success',
      borderColor: 'group-hover:border-emerald-500/50',
    },
    {
      title: 'Exam Prep & UPSC',
      subtitle: 'UPSC, SSC, Banking, JEE & NEET',
      icon: GraduationCap,
      href: '/books?category=exams',
      badge: '15.9k+ Books',
      gradient: 'from-amber-500/10 to-orange-500/10 text-secondary',
      borderColor: 'group-hover:border-amber-500/50',
    },
    {
      title: 'Management & Commerce',
      subtitle: 'MBA, CA, CS, B.Com & Economics',
      icon: Briefcase,
      href: '/books?category=management',
      badge: '9.3k+ Books',
      gradient: 'from-purple-500/10 to-pink-500/10 text-accent',
      borderColor: 'group-hover:border-purple-500/50',
    },
    {
      title: 'Fiction & Bestsellers',
      subtitle: 'Thrillers, Romance & Classics',
      icon: BookOpen,
      href: '/books?category=fiction',
      badge: '18.2k+ Books',
      gradient: 'from-rose-500/10 to-red-500/10 text-rose-500',
      borderColor: 'group-hover:border-rose-500/50',
    },
    {
      title: 'Non-Fiction & Self-Help',
      subtitle: 'Biography, Startup & Mindset',
      icon: BookText,
      href: '/books?category=non-fiction',
      badge: '11.5k+ Books',
      gradient: 'from-cyan-500/10 to-sky-500/10 text-cyan-600 dark:text-cyan-400',
      borderColor: 'group-hover:border-cyan-500/50',
    },
    {
      title: 'Teens & Young Adult',
      subtitle: 'Comics, Manga, Fantasy & Sci-Fi',
      icon: Backpack,
      href: '/books?category=teens-ya',
      badge: '6.4k+ Books',
      gradient: 'from-violet-500/10 to-fuchsia-500/10 text-violet-500',
      borderColor: 'group-hover:border-violet-500/50',
    },
    {
      title: 'School & K-12',
      subtitle: 'NCERT, CBSE, ICSE Textbooks',
      icon: Baby,
      href: '/books?category=kids',
      badge: '14.0k+ Books',
      gradient: 'from-lime-500/10 to-green-500/10 text-lime-600 dark:text-lime-400',
      borderColor: 'group-hover:border-lime-500/50',
    },
  ];

  return (
    <section aria-label="Book Categories" className="py-16 sm:py-20 bg-background font-sans border-b border-border transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-secondary">
              <Compass className="h-4 w-4" />
              <span>Academic & General Bookshelves</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-primary dark:text-foreground tracking-tight">
              Explore Every Subject
            </h2>
          </div>

          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-secondary hover:text-secondary-600 group transition-colors"
          >
            <span>Browse All Categories</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid - 2 columns on mobile for native app feel */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Link
                  href={cat.href}
                  className={`group relative flex flex-col justify-between p-5 sm:p-6 h-44 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 ${cat.borderColor} overflow-hidden`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${cat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 stroke-[2.2]" />
                    </div>

                    <span className="px-2.5 py-1 bg-background-subtle border border-border rounded-full text-[10px] font-bold text-text-muted">
                      {cat.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-text-primary group-hover:text-secondary transition-colors flex items-center justify-between">
                      <span>{cat.title}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-secondary" />
                    </h3>
                    <p className="text-xs font-medium text-text-muted line-clamp-1">
                      {cat.subtitle}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;
