'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Compass,
  GraduationCap,
  Heart,
  Sparkles,
  Zap,
  Ghost,
  Feather,
} from 'lucide-react';

export function CategoryGrid() {
  const categories = [
    {
      title: 'Engineering & Tech',
      subtitle: 'Computer Science, Electrical, Mechanical, Civil',
      icon: GraduationCap,
      href: '/books?category=engineering',
      count: '14,200+ books',
    },
    {
      title: 'Exams & Study Prep',
      subtitle: 'JEE, NEET, UPSC, GATE, CAT, Bank PO',
      icon: Sparkles,
      href: '/books?category=exams',
      count: '11,500+ books',
    },
    {
      title: 'Medical & Healthcare',
      subtitle: 'MBBS, BDS, Nursing, Pharmacy, Anatomy',
      icon: Compass,
      href: '/books?category=medical',
      count: '9,800+ books',
    },
    {
      title: 'Fiction & Novels',
      subtitle: 'Literary fiction, Indian contemporary, classics',
      icon: Feather,
      href: '/books?category=fiction',
      count: '18,400+ books',
    },
    {
      title: 'School K-12 Textbooks',
      subtitle: 'NCERT, CBSE, ICSE, State Boards',
      icon: BookOpen,
      href: '/books?category=school',
      count: '12,100+ books',
    },
    {
      title: 'Commerce & CA',
      subtitle: 'Accountancy, Finance, Economics, Business',
      icon: Zap,
      href: '/books?category=commerce',
      count: '7,900+ books',
    },
    {
      title: 'Programming & CS',
      subtitle: 'Python, Java, AI/ML, Web Dev, Algorithms',
      icon: Ghost,
      href: '/books?category=programming',
      count: '6,300+ books',
    },
    {
      title: 'Award Winners & Rare',
      subtitle: 'Booker Prize, Pulitzer, Out of Print Literature',
      icon: Heart,
      href: '/books?category=award-winners',
      count: '5,100+ books',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background font-sans border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary block">
            Explore Every Subject
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">
            Digital Bookshelves by Category
          </h2>
          <p className="text-sm text-text-secondary">
            Find required semester courseware, competitive test prep, and leisure literature.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const IconComp = cat.icon;
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group p-6 rounded-lg border border-border bg-surface hover:border-brand hover-page-turn flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-md bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-text-primary group-hover:text-brand transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{cat.subtitle}</p>
                </div>
                <div className="pt-4 mt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-brand uppercase tracking-wider">
                    {cat.count}
                  </span>
                  <span className="text-xs font-bold text-text-muted group-hover:text-brand transition-colors">
                    Browse →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;
