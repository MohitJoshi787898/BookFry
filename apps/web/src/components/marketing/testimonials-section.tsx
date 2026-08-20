'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Sparkles, CheckCircle2 } from 'lucide-react';

export interface TestimonialItem {
  name: string;
  role: string;
  comment: string;
  avatar?: string;
  rating?: number;
}

export interface TestimonialsSectionProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: TestimonialItem[];
}

const defaultTestimonials: TestimonialItem[] = [
  {
    comment:
      'BookFry has completely changed how I buy used books. The condition ratings are honest, shipping is fast, and campus sellers take great care in packaging.',
    name: 'Priya Sharma',
    role: 'IIT Delhi • Computer Science Student',
    rating: 5,
  },
  {
    comment:
      'I sold over 40 textbooks from college in under two weeks. The payout went straight into my UPI account without high marketplace commissions.',
    name: 'Marcus Sterling',
    role: 'DU Alumni • Verified Seller',
    rating: 5,
  },
  {
    comment:
      'Finding rare UPSC and medical preparation books used to be frustrating. Here I found three out-of-print reference guides in pristine condition.',
    name: 'Ananya Roy',
    role: 'AIIMS New Delhi • Medical Scholar',
    rating: 5,
  },
];

export function TestimonialsSection({
  eyebrow = 'Campus Community Reviews',
  title = 'Loved by 50,000+ Readers & Student Sellers',
  subtitle = 'Join thousands of students and book lovers buying and selling quality literature every day across India.',
  items = defaultTestimonials,
}: TestimonialsSectionProps = {}) {
  const testimonialList = items && items.length > 0 ? items : defaultTestimonials;

  return (
    <section
      aria-label={title}
      className="py-12 sm:py-16 lg:py-20 relative bg-background-subtle border-t border-border/80 font-sans transition-colors duration-200 overflow-hidden"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 transition-all space-y-8 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-secondary/10 dark:bg-secondary/20 border border-secondary/20 text-xs font-extrabold uppercase tracking-widest text-secondary">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>{eyebrow}</span>
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-primary dark:text-foreground tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
            {subtitle}
          </p>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-4 lg:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
          {testimonialList.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="w-[280px] sm:w-auto shrink-0 snap-start border border-border/80 bg-card p-5 sm:p-6 rounded-2xl shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <Quote className="h-5 w-5 text-secondary/30" />
                </div>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium italic">
                  &quot;{t.comment}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-extrabold flex items-center justify-center text-xs shrink-0">
                  {t.name ? t.name.charAt(0) : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-serif font-extrabold text-sm text-text-primary flex items-center gap-1">
                    <span>{t.name}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-success inline shrink-0" />
                  </p>
                  <p className="text-[11px] text-text-muted truncate font-medium">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
