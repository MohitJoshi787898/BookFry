'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  BookText, 
  GraduationCap, 
  Wrench, 
  Stethoscope, 
  Briefcase, 
  Baby, 
  Backpack 
} from 'lucide-react';

export function CategoryGrid() {
  const categories = [
    {
      title: 'Fiction',
      icon: BookOpen,
      href: '/books?category=fiction',
    },
    {
      title: 'Non-Fiction',
      icon: BookText,
      href: '/books?category=non-fiction',
    },
    {
      title: 'Exam Prep',
      icon: GraduationCap,
      href: '/books?category=exams',
    },
    {
      title: 'Engineering',
      icon: Wrench,
      href: '/books?category=engineering',
    },
    {
      title: 'Medical',
      icon: Stethoscope,
      href: '/books?category=medical',
    },
    {
      title: 'Management',
      icon: Briefcase,
      href: '/books?category=management',
    },
    {
      title: 'Kids',
      icon: Baby,
      href: '/books?category=kids',
    },
    {
      title: 'Teens & YA',
      icon: Backpack,
      href: '/books?category=teens-ya',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-background font-sans border-b border-border transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Centered Heading with orange accent line */}
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary dark:text-foreground">
            Explore By Category
          </h2>
          <div className="w-8 h-1 bg-secondary mx-auto rounded-full" />
        </div>

        {/* 8-Column Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:border-secondary/50 hover:shadow-md transition-all duration-200 hover-page-turn text-center"
              >
                <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/15 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform mb-2">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-text-primary group-hover:text-secondary transition-colors">
                  {cat.title}
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
