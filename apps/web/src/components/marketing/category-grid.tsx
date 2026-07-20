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
      title: 'Fiction & Novels',
      subtitle: 'Literary fiction, contemporary, classics',
      icon: Feather,
      href: '/books?category=fiction',
      count: '14,200+ titles',
    },
    {
      title: 'Non-Fiction & Memoir',
      subtitle: 'Biographies, history, self-help',
      icon: Compass,
      href: '/books?category=non-fiction',
      count: '9,800+ titles',
    },
    {
      title: 'Sci-Fi & Fantasy',
      subtitle: 'Space opera, epic fantasy, cyberpunk',
      icon: Sparkles,
      href: '/books?category=sci-fi',
      count: '8,400+ titles',
    },
    {
      title: 'Academic & Exams',
      subtitle: 'Textbooks, test prep, reference guides',
      icon: GraduationCap,
      href: '/books?category=exams',
      count: '11,500+ titles',
    },
    {
      title: 'Mystery & Thriller',
      subtitle: 'Crime, psychological thrillers, suspense',
      icon: Ghost,
      href: '/books?category=mystery',
      count: '7,100+ titles',
    },
    {
      title: 'Romance',
      subtitle: 'Contemporary, historical, rom-coms',
      icon: Heart,
      href: '/books?category=romance',
      count: '6,900+ titles',
    },
    {
      title: 'Manga & Graphic Novels',
      subtitle: 'Shonen, seinen, graphic memoirs',
      icon: Zap,
      href: '/books?category=manga',
      count: '5,300+ titles',
    },
    {
      title: 'Children & YA',
      subtitle: 'Picture books, middle grade, young adult',
      icon: BookOpen,
      href: '/books?category=kids',
      count: '10,100+ titles',
    },
  ];

  return (
    <section className="py-16 bg-background font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block">
            Explore Genres
          </span>
          <h2 className="font-serif text-3xl font-bold text-text-primary">
            Curated Categories for Every Reader
          </h2>
          <p className="text-sm text-text-secondary">
            Find exactly what you are looking for across our catalog taxonomy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const IconComp = cat.icon;
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group p-6 rounded-lg border border-border bg-surface hover:border-brand/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
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
                <span className="text-[11px] font-semibold text-text-muted group-hover:text-brand transition-colors block pt-4">
                  {cat.count} →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;
