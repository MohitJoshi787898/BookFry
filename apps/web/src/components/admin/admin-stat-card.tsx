'use client';

import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  description?: string;
  accentColor?: 'brand' | 'secondary' | 'accent' | 'success';
}

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
    brand: 'bg-brand/10 text-brand',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
  }[accentColor];

  return (
    <div className="p-5 rounded-md border border-border bg-surface shadow-sm space-y-3 font-sans hover:border-brand/40 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{title}</span>
        <div className={`p-2 rounded-full ${iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-mono">
          {value}
        </span>

        {change && (
          <div
            className={`inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            }`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {description && <p className="text-[11px] text-text-muted font-medium pt-1 border-t border-border/50">{description}</p>}
    </div>
  );
}

export default AdminStatCard;
