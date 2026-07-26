'use client';

import React from 'react';
import { CategoryCard } from '../shared/category-card';

export function CategoryGrid() {
  const categories = [
    {
      title: 'Fiction',
      graphic: '📚',
      href: '/books?category=fiction',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Non-Fiction',
      graphic: '📖',
      href: '/books?category=non-fiction',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Exam Prep',
      graphic: '🎓',
      href: '/books?category=exams',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Engineering',
      graphic: '⚙️',
      href: '/books?category=engineering',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Medical',
      graphic: '🩺',
      href: '/books?category=medical',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Management',
      graphic: '💼',
      href: '/books?category=management',
      bgColor: 'bg-slate-50',
    },
    {
      title: 'Kids',
      graphic: '🧸',
      href: '/books?category=kids',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Teens & YA',
      graphic: '🎒',
      href: '/books?category=teens-ya',
      bgColor: 'bg-rose-50',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-background font-sans border-b border-border transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Centered Heading with orange accent line */}
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A3B5C] dark:text-foreground">
            Explore By Category
          </h2>
          <div className="w-8 h-1 bg-secondary mx-auto rounded-full" />
        </div>

        {/* 8-Column Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.title}
              title={cat.title}
              graphic={cat.graphic}
              href={cat.href}
              bgColor={cat.bgColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;
