'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Award,
  BookOpen,
  School,
  ChevronDown,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface CategoryColumn {
  title: string;
  icon: React.ElementType;
  items: { name: string; href: string; badge?: string }[];
}

const CATEGORY_COLUMNS: CategoryColumn[] = [
  {
    title: 'Higher Education & Tech',
    icon: GraduationCap,
    items: [
      { name: 'Computer Science & IT', href: '/books?category=computer-science' },
      { name: 'Engineering & Technology', href: '/books?category=engineering' },
      { name: 'Medical & Healthcare', href: '/books?category=medical' },
      { name: 'Commerce & Accounting (CA/CS)', href: '/books?category=commerce' },
      { name: 'Law & Judicial Studies', href: '/books?category=law' },
    ],
  },
  {
    title: 'Competitive Exams',
    icon: Award,
    items: [
      { name: 'JEE Main & Advanced', href: '/books?category=jee', badge: 'Popular' },
      { name: 'NEET UG & Medical Entrance', href: '/books?category=neet' },
      { name: 'UPSC Civil Services (IAS)', href: '/books?category=upsc' },
      { name: 'Banking & SSC Prep', href: '/books?category=banking' },
      { name: 'GATE & PSUs Guides', href: '/books?category=gate' },
    ],
  },
  {
    title: 'Literature & General',
    icon: BookOpen,
    items: [
      { name: 'Fiction & Contemporary', href: '/books?category=fiction' },
      { name: 'Non-Fiction & Thought', href: '/books?category=non-fiction' },
      { name: 'Self-Help & Mindset', href: '/books?category=self-help' },
      { name: 'Biographies & Memoirs', href: '/books?category=biography' },
      { name: 'Young Adult & Fantasy', href: '/books?category=teens-ya' },
    ],
  },
  {
    title: 'School & Foundation',
    icon: School,
    items: [
      { name: 'CBSE Classes 9–12', href: '/books?category=cbse', badge: 'Hot' },
      { name: 'ICSE & ISC Board', href: '/books?category=icse' },
      { name: 'NCERT Standard Editions', href: '/books?category=ncert' },
      { name: 'State Board Textbooks', href: '/books?category=state-boards' },
      { name: 'Olympiads & NTSE', href: '/books?category=olympiad' },
    ],
  },
];

interface NavbarCategoryMegaMenuProps {
  className?: string;
}

export function NavbarCategoryMegaMenu({ className = '' }: NavbarCategoryMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
          isOpen
            ? 'bg-secondary text-secondary-foreground shadow-sm'
            : 'text-foreground hover:text-secondary hover:bg-muted/80'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Browse Categories</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[840px] xl:w-[940px] rounded-2xl bg-card border border-border shadow-2xl overflow-hidden z-50 p-6 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Top 4-Column Grid */}
          <div className="grid grid-cols-4 gap-6 pb-6 border-b border-border/80">
            {CATEGORY_COLUMNS.map((col) => {
              const Icon = col.icon;
              return (
                <div key={col.title} className="space-y-3">
                  <div className="flex items-center gap-2 text-foreground font-extrabold text-xs tracking-tight">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span>{col.title}</span>
                  </div>

                  <ul className="space-y-1.5">
                    {col.items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all py-0.5"
                        >
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-secondary/15 text-secondary shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Bottom Circular Promo Bar */}
          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-secondary/15 text-secondary shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-foreground">
                  Circular Campus Exchange — Sell Your Finished Books
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  List syllabus textbooks in 2 minutes. Get paid securely via direct student escrow.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/books"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                All 50,000+ Books
              </Link>
              <Link
                href="/sell"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-extrabold hover:bg-secondary/90 transition-all shadow-xs"
              >
                <span>Sell a Book</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavbarCategoryMegaMenu;
