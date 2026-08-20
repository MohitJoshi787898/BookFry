'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs?: FaqItem[];
}

const defaultFaqs: FaqItem[] = [
  {
    question: 'How does BookFry ensure authentic books?',
    answer:
      'Every listing undergoes strict ISBN & seller rating verification before going live on the marketplace.',
    category: 'Quality',
  },
  {
    question: 'How long does campus book delivery take in India?',
    answer:
      'Orders are dispatched within 24 hours and delivered across Indian cities in 2-4 business days.',
    category: 'Delivery',
  },
  {
    question: 'Can I sell my used college & competitive exam books?',
    answer:
      'Yes! You can list your pre-owned textbooks in under 60 seconds with our ISBN auto-fill system.',
    category: 'Selling',
  },
  {
    question: 'What is the 7-day return policy?',
    answer:
      'If the book condition does not match the seller description, you get a 100% full refund guaranteed.',
    category: 'Returns',
  },
];

export function FAQSection({
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about buying, selling, and shipping on BookFry',
  faqs = defaultFaqs,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const items = faqs.length > 0 ? faqs : defaultFaqs;

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      aria-label={title}
      className="py-12 sm:py-16 bg-background border-b border-border/80 transition-colors duration-200"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Help Center &amp; Support</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-primary dark:text-foreground tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm font-medium text-text-secondary max-w-xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-2xs transition-all duration-200 hover:border-secondary/40"
              >
                <button
                  onClick={() => toggleItem(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center shrink-0">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-text-primary">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-text-muted transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-secondary' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm font-medium text-text-secondary leading-relaxed border-t border-border/40 pl-15">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
