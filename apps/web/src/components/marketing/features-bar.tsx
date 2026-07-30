'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Truck, ShieldCheck, RotateCcw } from 'lucide-react';

const features = [
  {
    icon: Tag,
    title: 'Up to 80% Off',
    description: 'On New & Verified Used Textbooks',
    gradient: 'from-orange-500/10 via-secondary/15 to-amber-500/10 text-secondary',
    badge: 'Best Value',
  },
  {
    icon: Truck,
    title: 'Express Delivery',
    description: 'Free Shipping across India over ₹499',
    gradient: 'from-blue-500/10 via-brand/15 to-indigo-500/10 text-brand dark:text-primary',
    badge: 'Pan-India',
  },
  {
    icon: ShieldCheck,
    title: '100% Quality Checked',
    description: 'Verified Sellers & Escrow Guarantee',
    gradient: 'from-emerald-500/10 via-success/15 to-teal-500/10 text-success',
    badge: 'Student Safe',
  },
  {
    icon: RotateCcw,
    title: '7-Day Easy Returns',
    description: 'Instant Refunds & Replacement Support',
    gradient: 'from-purple-500/10 via-accent/15 to-pink-500/10 text-accent',
    badge: 'Hassle-Free',
  },
];

export function FeaturesBar() {
  return (
    <section aria-label="BookFry Value Propositions" className="relative py-8 bg-background-subtle border-y border-border/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="group relative p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-2xs hover:shadow-md transition-all duration-300 flex items-center gap-4 overflow-hidden"
              >
                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${item.gradient} shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-6 w-6 stroke-[2.2]" />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-extrabold text-text-primary group-hover:text-secondary transition-colors truncate">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-[11px] font-medium text-text-muted leading-tight line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesBar;
