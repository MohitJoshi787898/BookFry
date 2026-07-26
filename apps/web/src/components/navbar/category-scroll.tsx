'use client';

import React from 'react';
import Link from 'next/link';
import {
  Grid,
  BookOpen,
  Globe,
  Sparkles,
  Smile,
  FileText,
  Settings,
  ChevronDown,
  Activity,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Icons mapping matching the branding style of BookFry
const iconMap = {
  grid: Grid,
  book: BookOpen,
  globe: Globe,
  sparkles: Sparkles,
  smile: Smile,
  file: FileText,
  settings: Settings,
  chevron: ChevronDown,
  activity: Activity,
  heart: Heart,
  trending: TrendingUp,
};

const tabletCategories = [
  { name: 'All Categories', href: '/books', icon: 'grid', colorClass: 'border border-[#F26522] bg-[#FEF8F3] text-[#F26522]' },
  { name: 'Fiction', href: '/books?category=fiction', icon: 'book', colorClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300 border border-purple-100/50' },
  { name: 'Non-Fiction', href: '/books?category=non-fiction', icon: 'globe', colorClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-300 border border-teal-100/50' },
  { name: 'Teens & YA', href: '/books?category=teens-ya', icon: 'sparkles', colorClass: 'bg-pink-50 text-pink-700 dark:bg-pink-950/20 dark:text-pink-300 border border-pink-100/50' },
  { name: 'Kids', href: '/books?category=kids', icon: 'smile', colorClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300 border border-blue-100/50' },
  { name: 'Exam Prep', href: '/books?category=exams', icon: 'file', colorClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300 border border-amber-100/50' },
  { name: 'Engineering', href: '/books?category=engineering', icon: 'settings', colorClass: 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300 border border-green-100/50' },
  { name: 'Medical', href: '/books?category=medical', icon: 'heart', colorClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/20 dark:text-cyan-300 border border-cyan-100/50' },
];

const mobileCategories = [
  { name: 'All Categories', href: '/books', icon: 'grid', bg: 'bg-[#FEF8F3] text-[#F26522] border border-[#F26522]/20' },
  { name: 'Fiction', href: '/books?category=fiction', icon: 'book', bg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/25 dark:text-purple-400' },
  { name: 'Non-Fiction', href: '/books?category=non-fiction', icon: 'globe', bg: 'bg-teal-50 text-teal-600 dark:bg-teal-950/25 dark:text-teal-400' },
  { name: 'Teens & YA', href: '/books?category=teens-ya', icon: 'sparkles', bg: 'bg-pink-50 text-pink-600 dark:bg-pink-950/25 dark:text-pink-400' },
  { name: 'Kids', href: '/books?category=kids', icon: 'smile', bg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/25 dark:text-blue-400' },
  { name: 'Exam Prep', href: '/books?category=exams', icon: 'file', bg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/25 dark:text-amber-400' },
  { name: 'Engineering', href: '/books?category=engineering', icon: 'settings', bg: 'bg-green-50 text-green-600 dark:bg-green-950/25 dark:text-green-400' },
  { name: 'More', href: '#', icon: 'chevron', bg: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-350' },
];

interface CategoryScrollProps {
  screen: 'tablet' | 'mobile';
  className?: string;
}

export function CategoryScroll({ screen, className }: CategoryScrollProps) {
  if (screen === 'tablet') {
    return (
      <div className={cn('flex items-center gap-3 overflow-x-auto no-scrollbar py-2.5 px-6 font-sans w-full bg-slate-50/40 dark:bg-card/20 border-b border-border/75', className)}>
        {tabletCategories.map((cat) => {
          const Icon = iconMap[cat.icon as keyof typeof iconMap];
          return (
            <Link
              key={cat.name}
              href={cat.href}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-transform active:scale-95 duration-100',
                cat.colorClass
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              <span>{cat.name}</span>
            </Link>
          );
        })}
        <button className="flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-[#F26522] shrink-0 ml-2 transition-colors">
          <span>More</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  // Mobile Screen view
  return (
    <div className={cn('flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-3 px-4 font-sans bg-white dark:bg-[#0B1320] border-b border-border/80 w-full', className)}>
      {mobileCategories.map((cat) => {
        const Icon = iconMap[cat.icon as keyof typeof iconMap];
        return (
          <Link
            key={cat.name}
            href={cat.href}
            className="flex flex-col items-center space-y-1.5 shrink-0 select-none group"
          >
            <div
              className={cn(
                'h-11 w-11 rounded-full flex items-center justify-center transition-transform group-active:scale-95 duration-100 shadow-3xs',
                cat.bg
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
            </div>
            <span className="text-[10px] font-bold text-text-secondary group-hover:text-secondary whitespace-nowrap truncate max-w-[64px] text-center">
              {cat.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
