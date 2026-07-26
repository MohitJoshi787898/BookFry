import React from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn('flex items-center space-x-1.5 text-[10px] text-text-muted font-sans font-semibold tracking-wide uppercase', className)} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="h-3 w-3 text-text-muted/60 shrink-0" />}
            {isLast || !item.href ? (
              <span className="text-text-secondary select-none font-bold">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-secondary transition-colors">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export interface TabsProps {
  tabs: {
    id: string;
    label: React.ReactNode;
    count?: number;
  }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('border-b border-border w-full flex font-sans text-xs font-bold text-text-muted select-none overflow-x-auto no-scrollbar', className)}>
      <div className="flex space-x-6">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'py-3 border-b-2 transition-all relative flex items-center gap-1.5 focus:outline-none shrink-0',
                isActive
                  ? 'border-secondary text-secondary font-black'
                  : 'border-transparent hover:text-text-primary hover:border-border/60'
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded-full shrink-0 font-bold font-mono',
                    isActive ? 'bg-secondary/10 text-secondary' : 'bg-muted text-text-muted'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const delta = 1; // Number of pages to show before and after current

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== 'ellipsis') {
        pages.push('ellipsis');
      }
    }

    return pages.map((page, index) => {
      if (page === 'ellipsis') {
        return (
          <span key={`ellipsis-${index}`} className="px-2.5 py-1.5 text-text-muted flex items-end">
            <MoreHorizontal className="h-3 w-3" />
          </span>
        );
      }

      const isCurrent = page === currentPage;
      return (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page as number)}
          className={cn(
            'px-3 py-1.5 rounded-md border text-xs font-bold transition-all focus-ring shrink-0',
            isCurrent
              ? 'bg-primary border-primary text-white'
              : 'border-border bg-card text-text-secondary hover:bg-muted'
          )}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <nav className={cn('flex items-center justify-between py-4 border-t border-border/40 font-sans', className)} aria-label="Pagination">
      {/* Prev Button */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-xs font-bold text-text-secondary hover:bg-muted disabled:opacity-50 disabled:pointer-events-none focus-ring shrink-0"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span>Prev</span>
      </button>

      {/* Pages List */}
      <div className="hidden sm:flex items-center space-x-1.5">
        {renderPageNumbers()}
      </div>

      {/* Current Page info for mobile */}
      <div className="flex sm:hidden text-xs text-text-muted font-bold font-mono">
        Page {currentPage} of {totalPages}
      </div>

      {/* Next Button */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-xs font-bold text-text-secondary hover:bg-muted disabled:opacity-50 disabled:pointer-events-none focus-ring shrink-0"
      >
        <span>Next</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}
export default Breadcrumbs;
