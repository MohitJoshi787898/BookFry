'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export interface AdminStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  description?: string;
  accentColor?: 'brand' | 'secondary' | 'accent' | 'success' | 'danger';
}

const sparklineWaves = {
  brand: 'M0 25 C20 10, 40 40, 60 15 C80 5, 100 35, 120 20 C140 10, 160 30, 180 15 C200 5, 220 25, 240 18',
  success: 'M0 35 C20 30, 40 45, 60 20 C80 10, 100 35, 120 25 C140 20, 160 10, 180 30 C200 20, 220 5, 240 22',
  accent: 'M0 25 C20 30, 40 15, 60 35 C80 40, 100 20, 120 30 C140 35, 160 15, 180 25 C200 30, 220 10, 240 15',
  secondary: 'M0 30 C20 40, 40 20, 60 35 C80 45, 100 15, 120 25 C140 30, 160 20, 180 10, 200 35, 240 18',
  danger: 'M0 15 C20 25, 40 10, 60 30 C80 20, 100 40, 120 15 C140 35, 160 25, 180 40 C200 15, 220 35, 240 28',
};

const waveColors = {
  brand: '#F26522',
  success: '#10B981',
  accent: '#F59E0B',
  secondary: '#FF9F2D',
  danger: '#EF4444',
};

export function AdminStatCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  description,
  accentColor = 'brand',
}: AdminStatCardProps) {
  const iconBg = {
    brand: 'bg-secondary/15 text-secondary',
    secondary: 'bg-primary/10 text-primary dark:text-amber-400',
    accent: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  }[accentColor];

  const strokeColor = waveColors[accentColor];
  const sparklineD = sparklineWaves[accentColor];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-xs space-y-3 font-sans transition-all hover:border-secondary/40 relative overflow-hidden"
    >
      {/* Top row: Icon, title, and Trend Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className={`p-2 rounded-lg ${iconBg} shrink-0`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
            {title}
          </span>
        </div>

        {change && (
          <span
            className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full shrink-0 ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}
          >
            {isPositive ? '↗ ' : '↘ '}
            {change}
          </span>
        )}
      </div>

      {/* Large Figure */}
      <div>
        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tracking-tight">
          {value}
        </span>
      </div>

      {/* Inline Sparkline SVG path */}
      <div className="h-8 w-full overflow-hidden flex items-end opacity-80">
        <svg
          className="w-full h-7 overflow-visible"
          viewBox="0 0 240 50"
          preserveAspectRatio="none"
        >
          <path
            d={sparklineD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Footer description */}
      {description && (
        <p className="text-[10px] text-muted-foreground font-semibold leading-normal border-t border-border/50 pt-2 truncate">
          {description}
        </p>
      )}
    </motion.div>
  );
}

export default AdminStatCard;
