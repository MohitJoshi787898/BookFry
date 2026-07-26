'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  description?: string;
  accentColor?: 'brand' | 'secondary' | 'accent' | 'success';
}

const sparklineWaves = {
  brand: 'M0 25 C20 10, 40 40, 60 15 C80 5, 100 35, 120 20 C140 10, 160 30, 180 15 C200 5, 220 25, 240 18',
  success: 'M0 35 C20 30, 40 45, 60 20 C80 10, 100 35, 120 25 C140 20, 160 10, 180 30 C200 20, 220 5, 240 22',
  accent: 'M0 25 C20 30, 40 15, 60 35 C80 40, 100 20, 120 30 C140 35, 160 15, 180 25 C200 30, 220 10, 240 15',
  secondary: 'M0 30 C20 40, 40 20, 60 35 C80 45, 100 15, 120 25 C140 30, 160 20, 180 10, 200 35, 240 18',
};

const waveColors = {
  brand: '#F26522',
  success: '#10B981',
  accent: '#F59E0B',
  secondary: '#8B5CF6',
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
    brand: 'bg-[#FFF9F6] text-[#F26522]',
    secondary: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
    accent: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
    success: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
  }[accentColor];

  const strokeColor = waveColors[accentColor];
  const sparklineD = sparklineWaves[accentColor];

  return (
    <div className="p-5 rounded-2xl border border-border/85 bg-card shadow-xs space-y-4 font-sans hover:border-[#F26522]/30 transition-all duration-200">
      
      {/* Top row: Icon, title, and Trend Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${iconBg}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary">
            {title}
          </span>
        </div>

        {change && (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            {isPositive ? '↗ ' : '↘ '}
            {change}
          </span>
        )}
      </div>

      {/* Large telemetry figure */}
      <div>
        <span className="text-2xl sm:text-3xl font-bold font-serif text-text-primary tracking-tight">
          {value}
        </span>
      </div>

      {/* Inline Sparkline SVG path */}
      <div className="h-10 w-full overflow-hidden flex items-end">
        <svg className="w-full h-8 overflow-visible" viewBox="0 0 240 50" preserveAspectRatio="none">
          <path
            d={sparklineD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-75"
          />
        </svg>
      </div>

      {/* Footer description details */}
      {description && (
        <p className="text-[10px] text-text-muted font-bold leading-normal border-t border-border/40 pt-2.5">
          {description}
        </p>
      )}
    </div>
  );
}

export default AdminStatCard;
