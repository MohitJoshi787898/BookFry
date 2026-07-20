'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        'BookMarket has completely changed how I buy used books. The condition ratings are honest, shipping is fast, and the sellers take great care in packaging.',
      author: 'Eleanor Vance',
      role: 'Avid Collector & Reader',
      rating: 5,
    },
    {
      quote:
        'I sold over 40 textbooks from college in under two weeks. The payout went straight into my account without high marketplace commissions.',
      author: 'Marcus Sterling',
      role: 'Student & Verified Seller',
      rating: 5,
    },
    {
      quote:
        'Finding rare first-edition fiction used to be frustrating. Here I found three out-of-print books in pristine condition from verified sellers.',
      author: 'Sophia Chen',
      role: 'Literary Enthusiast',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 bg-background-subtle border-t border-border font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block">
            Community Feedback
          </span>
          <h2 className="font-serif text-3xl font-bold text-text-primary">
            Loved by Readers & Independent Sellers
          </h2>
          <p className="text-sm text-text-secondary">
            Join thousands of book lovers buying and selling quality literature every day.
          </p>
        </div>

        {/* Quiet 3-up Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="border border-border bg-surface p-6 rounded-lg space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <Quote className="h-6 w-6 text-brand/30" />
                <div className="flex space-x-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans font-medium">
                  &quot;{t.quote}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="font-bold text-sm text-text-primary font-sans">{t.author}</p>
                <p className="text-xs text-text-muted">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
