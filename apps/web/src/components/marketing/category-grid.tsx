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

export interface CategoryItem {
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  gradient?: string;
  borderColor?: string;
}

export interface CategoryGridProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  seeAllLabel?: string;
  seeAllUrl?: string;
  categories?: CategoryItem[];
}

const defaultCategories: CategoryItem[] = [
  {
    title: 'Engineering',
    subtitle: 'B.Tech, M.Tech, GATE & CS',
    href: '/books?category=engineering',
    badge: '12.4k+ Books',
    gradient: 'from-blue-500/20 to-indigo-500/20 text-blue-400',
    borderColor: 'group-hover:border-blue-500/50',
  },
  {
    title: 'Medical & Dental',
    subtitle: 'MBBS, BDS, NEET PG & Nursing',
    href: '/books?category=medical',
    badge: '8.1k+ Books',
    gradient: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
    borderColor: 'group-hover:border-emerald-500/50',
  },
  {
    title: 'Exam Prep & UPSC',
    subtitle: 'UPSC, SSC, Banking, JEE & NEET',
    href: '/books?category=exams',
    badge: '15.9k+ Books',
    gradient: 'from-amber-500/20 to-orange-500/20 text-secondary',
    borderColor: 'group-hover:border-secondary/50',
  },
  {
    title: 'Management & Commerce',
    subtitle: 'MBA, CA, CS, B.Com & Economics',
    href: '/books?category=management',
    badge: '9.3k+ Books',
    gradient: 'from-purple-500/20 to-pink-500/20 text-purple-400',
    borderColor: 'group-hover:border-purple-500/50',
  },
  {
    title: 'Fiction & Bestsellers',
    subtitle: 'Thrillers, Romance & Classics',
    href: '/books?category=fiction',
    badge: '18.2k+ Books',
    gradient: 'from-rose-500/20 to-red-500/20 text-rose-400',
    borderColor: 'group-hover:border-rose-500/50',
  },
  {
    title: 'Non-Fiction & Self-Help',
    subtitle: 'Biography, Startup & Mindset',
    href: '/books?category=non-fiction',
    badge: '11.5k+ Books',
    gradient: 'from-cyan-500/20 to-sky-500/20 text-cyan-400',
    borderColor: 'group-hover:border-cyan-500/50',
  },
  {
    title: 'Teens & Young Adult',
    subtitle: 'Comics, Manga, Fantasy & Sci-Fi',
    href: '/books?category=teens-ya',
    badge: '6.4k+ Books',
    gradient: 'from-violet-500/20 to-fuchsia-500/20 text-violet-400',
    borderColor: 'group-hover:border-violet-500/50',
  },
  {
    title: 'School & K-12',
    subtitle: 'NCERT, CBSE, ICSE Textbooks',
    href: '/books?category=kids',
    badge: '14.0k+ Books',
    gradient: 'from-lime-500/20 to-green-500/20 text-lime-400',
    borderColor: 'group-hover:border-lime-500/50',
  },
];

const ICONS = [Wrench, Stethoscope, GraduationCap, Briefcase, BookOpen, BookText, Backpack, Baby];

export function CategoryGrid({
  eyebrow = 'Academic & General Bookshelves',
  title = 'Explore Every Subject',
  seeAllLabel = 'Browse All Categories',
  seeAllUrl = '/books',
  categories = defaultCategories,
}: CategoryGridProps = {}) {
  const categoryList = categories && categories.length > 0 ? categories : defaultCategories;

  return (
    <section aria-label={title} className="py-16 sm:py-20 bg-background font-sans border-b border-border text-foreground">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-secondary">
              <Compass className="h-4 w-4" />
              <span>{eyebrow}</span>
            </div>
            <h2 className="font-sans text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {title}
            </h2>
          </div>

          <Link
            href={seeAllUrl}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-secondary hover:text-secondary/80 group transition-colors"
          >
            <span>{seeAllLabel}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {categoryList.map((cat, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            const grad = cat.gradient || 'from-blue-500/20 to-indigo-500/20 text-blue-400';
            const bColor = cat.borderColor || 'group-hover:border-blue-500/50';

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Link
                  href={cat.href || '/books'}
                  className={`group relative flex flex-col justify-between p-5 sm:p-6 h-44 rounded-2xl border border-border bg-card hover:bg-muted hover:shadow-lg transition-all duration-300 ${bColor} overflow-hidden`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${grad} group-hover:scale-110 transition-transform duration-300 border border-border/40`}>
                      <Icon className="h-6 w-6 stroke-[2.2]" />
                    </div>

                    {cat.badge && (
                      <span className="px-2.5 py-1 bg-muted border border-border rounded-full text-[10px] font-bold text-muted-foreground">
                        {cat.badge}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground group-hover:text-secondary transition-colors flex items-center justify-between">
                      <span>{cat.title}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-secondary" />
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground line-clamp-1">
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
