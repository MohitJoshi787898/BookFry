'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Truck, ShieldCheck, RotateCcw } from 'lucide-react';

export interface FeatureItem {
  title: string;
  description: string;
  badge?: string;
  gradient?: string;
}

export interface FeaturesBarProps {
  title?: string;
  subtitle?: string;
  items?: FeatureItem[];
}

const defaultFeatures: FeatureItem[] = [
  {
    title: 'Up to 80% Off',
    description: 'On New & Verified Used Textbooks',
    gradient: 'from-orange-500/10 via-secondary/15 to-amber-500/10 text-secondary',
    badge: 'Best Value',
  },
  {
    title: 'Express Delivery',
    description: 'Free Shipping across India over ₹499',
    gradient: 'from-blue-500/10 via-brand/15 to-indigo-500/10 text-brand dark:text-primary',
    badge: 'Pan-India',
  },
  {
    title: '100% Quality Checked',
    description: 'Verified Sellers & Escrow Guarantee',
    gradient: 'from-emerald-500/10 via-success/15 to-teal-500/10 text-success',
    badge: 'Student Safe',
  },
  {
    title: '7-Day Easy Returns',
    description: 'Instant Refunds & Replacement Support',
    gradient: 'from-purple-500/10 via-accent/15 to-pink-500/10 text-accent',
    badge: 'Hassle-Free',
  },
];

const ICONS = [Tag, Truck, ShieldCheck, RotateCcw];

export function FeaturesBar({
  title = 'BookFry Value Propositions',
  subtitle,
  items = defaultFeatures,
}: FeaturesBarProps = {}) {
  const featureList = items && items.length > 0 ? items : defaultFeatures;

  return (
    <section
      aria-label={title}
      className="relative py-8 bg-background-subtle border-y border-border/80 overflow-hidden"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-4 font-sans">
        {subtitle && (
          <div className="text-center">
            <h2 className="text-sm sm:text-base font-extrabold text-text-primary">{title}</h2>
            <p className="text-xs text-text-muted">{subtitle}</p>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featureList.map((item, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            const grad = item.gradient || 'from-orange-500/10 via-secondary/15 to-amber-500/10 text-secondary';
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="group relative p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-2xs hover:shadow-md transition-all duration-300 flex items-center gap-4 overflow-hidden"
              >
                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${grad} shrink-0 transition-transform duration-300 group-hover:scale-110`}>
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
