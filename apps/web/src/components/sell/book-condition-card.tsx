'use client';

import React from 'react';
import { Sparkles, ThumbsUp, ShieldCheck, AlertOctagon } from 'lucide-react';

export interface ConditionOption {
  id: 'excellent' | 'good' | 'fair' | 'poor';
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
}

export const conditionOptions: ConditionOption[] = [
  {
    id: 'excellent',
    title: 'Excellent / Like New',
    badge: 'PRISTINE',
    description: 'Looks unread. No marks, creases, or highlighted text.',
    icon: Sparkles,
    iconBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
    badgeBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20',
    badgeColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'good',
    title: 'Good Condition',
    badge: 'MOST POPULAR',
    description: 'Minor cover wear, binding tight, readable clean pages.',
    icon: ThumbsUp,
    iconBg: 'bg-secondary/10',
    iconColor: 'text-secondary',
    badgeBg: 'bg-secondary/15 text-secondary border border-secondary/20',
    badgeColor: 'text-secondary',
  },
  {
    id: 'fair',
    title: 'Fair Condition',
    badge: 'USED',
    description: 'Visible shelf wear, moderate highlights or notes inside.',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    badgeColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'poor',
    title: 'Poor / Well Read',
    badge: 'BARGAIN',
    description: 'Heavily read, worn cover, complete text intact.',
    icon: AlertOctagon,
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    badgeColor: 'text-rose-600 dark:text-rose-400',
  },
];

interface BookConditionCardProps {
  value: string;
  onChange: (value: 'excellent' | 'good' | 'fair' | 'poor') => void;
}

export function BookConditionCardGroup({ value, onChange }: BookConditionCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {conditionOptions.map((opt) => {
        const IconComp = opt.icon;
        const selected = value === opt.id;
        return (
          <div
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`cursor-pointer rounded-3xl border p-5 transition-all duration-200 relative flex flex-col justify-between h-48 select-none shadow-xs active:scale-95 ${
              selected
                ? 'border-secondary bg-secondary/10 text-secondary shadow-md shadow-secondary/10'
                : 'border-border/80 bg-card hover:border-secondary/40 hover:bg-muted/40'
            }`}
          >
            {/* Top row: Icon and Radio indicator */}
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${opt.iconBg}`}>
                <IconComp className={`h-5 w-5 ${opt.iconColor}`} />
              </div>

              {/* Radio Indicator */}
              <div className="pt-1">
                {selected ? (
                  <div className="h-5 w-5 rounded-full border-2 border-secondary flex items-center justify-center bg-card">
                    <div className="h-2.5 w-2.5 rounded-full bg-secondary" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border border-border/80 bg-card" />
                )}
              </div>
            </div>

            {/* Middle: Text details */}
            <div className="my-2 space-y-1">
              <span className="font-extrabold text-xs sm:text-sm text-foreground block">{opt.title}</span>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed font-medium">
                {opt.description}
              </p>
            </div>

            {/* Bottom: Badge */}
            <div className="pt-1">
              <span className={`text-[9px] font-black tracking-wider px-2.5 py-1 rounded-full ${opt.badgeBg}`}>
                {opt.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BookConditionCardGroup;
