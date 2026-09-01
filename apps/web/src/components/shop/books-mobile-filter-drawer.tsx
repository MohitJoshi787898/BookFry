'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@bookmarket/types';
import { X, RotateCcw, Check } from 'lucide-react';
import { BooksFilterSidebar } from './books-filter-sidebar';

export interface BooksMobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  category: string;
  setCategory: (v: string) => void;
  conditionType: 'all' | 'new' | 'used';
  setConditionType: (v: 'all' | 'new' | 'used') => void;
  conditions: string[];
  toggleCondition: (v: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  languages: string[];
  toggleLanguage: (v: string) => void;
  handleReset: () => void;
  setPage: (p: number) => void;
  totalResults?: number;
}

export function BooksMobileFilterDrawer({
  isOpen,
  onClose,
  categories,
  category,
  setCategory,
  conditionType,
  setConditionType,
  conditions,
  toggleCondition,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  languages,
  toggleLanguage,
  handleReset,
  setPage,
  totalResults,
}: BooksMobileFilterDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Bottom Sheet Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 max-h-[85vh] flex flex-col rounded-t-[32px] border-t border-border/80 bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-muted/40">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-secondary animate-pulse" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                  Filters &amp; Preferences
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close Filter Sheet"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <BooksFilterSidebar
                categories={categories}
                category={category}
                setCategory={setCategory}
                conditionType={conditionType}
                setConditionType={setConditionType}
                conditions={conditions}
                toggleCondition={toggleCondition}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                languages={languages}
                toggleLanguage={toggleLanguage}
                handleReset={handleReset}
                setPage={setPage}
              />
            </div>

            {/* Sticky Actions Footer */}
            <div className="p-4 border-t border-border/80 bg-card/90 backdrop-blur-md flex items-center gap-3">
              <button
                onClick={() => {
                  handleReset();
                }}
                className="flex-1 py-3 px-4 rounded-2xl border border-border/80 text-foreground hover:bg-muted font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={onClose}
                className="flex-2 py-3 px-4 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-secondary/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Show {totalResults ? `${totalResults} ` : ''}Books</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default BooksMobileFilterDrawer;
