'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AccordionItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function FaqAccordion({ items, className }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className={twMerge('space-y-3 font-sans', className)}>
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="border border-border/80 bg-surface rounded-lg shadow-xs overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => toggleIndex(idx)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-text-primary text-sm hover:bg-muted/30 focus:outline-none focus:bg-muted/50 transition-colors"
            >
              <span>{item.question}</span>
              <ChevronDown
                className={clsx(
                  'h-4 w-4 text-text-secondary transition-transform duration-200 shrink-0 ml-4',
                  isOpen && 'transform rotate-180'
                )}
              />
            </button>
            <div
              className={clsx(
                'transition-all duration-200 ease-in-out',
                isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
              )}
            >
              <div className="p-4 pt-0 text-xs text-text-secondary leading-relaxed border-t border-border/30">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FaqAccordion;
