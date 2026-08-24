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

const categories = [
  { name: 'All Categories', href: '/books', icon: 'grid', isPrimary: true },
  { name: 'Fiction', href: '/books?category=fiction', icon: 'book' },
  { name: 'Non-Fiction', href: '/books?category=non-fiction', icon: 'globe' },
  { name: 'Teens & YA', href: '/books?category=teens-ya', icon: 'sparkles' },
  { name: 'Kids', href: '/books?category=kids', icon: 'smile' },
  { name: 'Exam Prep', href: '/books?category=exams', icon: 'file' },
  { name: 'Engineering', href: '/books?category=engineering', icon: 'settings' },
  { name: 'Medical', href: '/books?category=medical', icon: 'heart' },
];

interface CategoryScrollProps {
  screen: 'tablet' | 'mobile';
  className?: string;
}

export function CategoryScroll({ screen, className }: CategoryScrollProps) {
  if (screen === 'tablet') {
    return (
      <div className={cn('flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-6 font-sans w-full bg-background border-b border-border/70', className)}>
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon as keyof typeof iconMap];
          return (
            <Link
              key={cat.name}
              href={cat.href}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95 duration-150',
                cat.isPrimary
                  ? 'border border-secondary/30 bg-secondary/10 text-secondary font-bold'
                  : 'bg-muted/60 hover:bg-muted text-text-secondary hover:text-text-primary border border-border/50'
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              <span>{cat.name}</span>
            </Link>
          );
        })}
        <Link href="/books" className="flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-secondary shrink-0 ml-2 transition-colors">
          <span>More</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  // Mobile Screen view
  return (
    <div className={cn('flex items-center justify-between gap-3.5 overflow-x-auto no-scrollbar py-2.5 px-4 font-sans bg-background border-b border-border/80 w-full', className)}>
      {categories.map((cat) => {
        const Icon = iconMap[cat.icon as keyof typeof iconMap];
        return (
          <Link
            key={cat.name}
            href={cat.href}
            className="flex flex-col items-center space-y-1 shrink-0 select-none group"
          >
            <div
              className={cn(
                'h-11 w-11 rounded-full flex items-center justify-center transition-all group-active:scale-95 duration-150 shadow-2xs border',
                cat.isPrimary
                  ? 'bg-secondary/10 border-secondary/30 text-secondary'
                  : 'bg-muted/80 border-border text-text-secondary group-hover:text-secondary group-hover:border-secondary/40 group-hover:bg-secondary/10'
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
            </div>
            <span className="text-[11px] font-semibold text-text-secondary group-hover:text-secondary whitespace-nowrap truncate max-w-[68px] text-center">
              {cat.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
