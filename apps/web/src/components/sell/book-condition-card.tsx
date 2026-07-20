'use client';

import React from 'react';
import { Sparkles, ThumbsUp, Check, ShieldAlert } from 'lucide-react';

export interface ConditionOption {
  id: 'excellent' | 'good' | 'fair' | 'poor';
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
}

export const conditionOptions: ConditionOption[] = [
  {
    id: 'excellent',
    title: 'Excellent / Like New',
    badge: 'Pristine',
    description: 'Looks unread. No marks, creases, or highlighted text.',
    icon: Sparkles,
  },
  {
    id: 'good',
    title: 'Good Condition',
    badge: 'Popular Choice',
    description: 'Minor cover wear, binding tight, readable clean pages.',
    icon: ThumbsUp,
  },
  {
    id: 'fair',
    title: 'Fair Condition',
    badge: 'Used',
    description: 'Visible shelf wear, moderate highlights or notes inside.',
    icon: Check,
  },
  {
    id: 'poor',
    title: 'Poor / Well Read',
    badge: 'Bargain',
    description: 'Heavily read, worn cover, complete text intact.',
    icon: ShieldAlert,
  },
];

interface BookConditionCardProps {
  value: string;
  onChange: (value: 'excellent' | 'good' | 'fair' | 'poor') => void;
}

export function BookConditionCardGroup({ value, onChange }: BookConditionCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
      {conditionOptions.map((opt) => {
        const IconComp = opt.icon;
        const selected = value === opt.id;
        return (
          <div
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`cursor-pointer rounded-lg border p-4 transition-all duration-150 relative flex flex-col justify-between ${
              selected
                ? 'border-brand bg-brand/5 ring-2 ring-brand/30 shadow-sm'
                : 'border-border bg-surface hover:border-brand/40 hover:bg-background-subtle'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <div
                  className={`p-2 rounded-md ${
                    selected ? 'bg-brand text-white' : 'bg-background-subtle text-brand'
                  }`}
                >
                  <IconComp className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-text-primary">{opt.title}</span>
              </div>

              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  selected
                    ? 'bg-brand text-white'
                    : 'bg-background-subtle text-text-muted border border-border'
                }`}
              >
                {opt.badge}
              </span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed mt-1">{opt.description}</p>
          </div>
        );
      })}
    </div>
  );
}

export default BookConditionCardGroup;
