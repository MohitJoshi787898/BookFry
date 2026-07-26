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
    iconBg: 'bg-blue-50 dark:bg-blue-950/20',
    iconColor: 'text-blue-500 dark:text-blue-400',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    badgeColor: 'text-slate-600 dark:text-slate-400',
  },
  {
    id: 'good',
    title: 'Good Condition',
    badge: 'POPULAR CHOICE',
    description: 'Minor cover wear, binding tight, readable clean pages.',
    icon: ThumbsUp,
    iconBg: 'bg-orange-50 dark:bg-orange-950/20',
    iconColor: 'text-[#F26522]',
    badgeBg: 'bg-[#FFF9F6] dark:bg-orange-950/10 text-[#F26522]',
    badgeColor: 'text-[#F26522]',
  },
  {
    id: 'fair',
    title: 'Fair Condition',
    badge: 'USED',
    description: 'Visible shelf wear, moderate highlights or notes inside.',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/20',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400',
    badgeColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'poor',
    title: 'Poor / Well Read',
    badge: 'BARGAIN',
    description: 'Heavily read, worn cover, complete text intact.',
    icon: AlertOctagon,
    iconBg: 'bg-red-50 dark:bg-red-950/20',
    iconColor: 'text-red-500 dark:text-red-400',
    badgeBg: 'bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400',
    badgeColor: 'text-red-600 dark:text-red-400',
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
            className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 relative flex flex-col justify-between h-48 select-none ${
              selected
                ? 'border-[#F26522] bg-[#FFF9F6] dark:bg-orange-950/10 shadow-xs'
                : 'border-border bg-card hover:border-[#F26522]/40 hover:bg-background-subtle'
            }`}
          >
            {/* Top row: Icon and Radio indicator */}
            <div className="flex justify-between items-start">
              <div className={`p-2.5 rounded-xl ${opt.iconBg}`}>
                <IconComp className={`h-5 w-5 ${opt.iconColor}`} />
              </div>
              
              {/* Radio Indicator */}
              <div className="pt-1">
                {selected ? (
                  <div className="h-4 w-4 rounded-full border border-[#F26522] flex items-center justify-center bg-white dark:bg-card">
                    <div className="h-2 w-2 rounded-full bg-[#F26522]" />
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full border border-border bg-white dark:bg-card" />
                )}
              </div>
            </div>

            {/* Middle: Text details */}
            <div className="my-3 space-y-1">
              <span className="font-bold text-xs sm:text-sm text-text-primary block">{opt.title}</span>
              <p className="text-[10px] sm:text-xs text-text-secondary leading-relaxed font-medium">
                {opt.description}
              </p>
            </div>

            {/* Bottom: Badge */}
            <div className="pt-2">
              <span
                className={`text-[9px] font-black tracking-wider px-2.5 py-1 rounded-md ${opt.badgeBg}`}
              >
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
