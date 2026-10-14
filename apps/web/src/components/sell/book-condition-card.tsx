'use client';

import React from 'react';
import { Sparkles, BookCheck, ThumbsUp, BookmarkCheck } from 'lucide-react';
import { BookCondition } from '@bookmarket/types';

export interface ConditionOption {
  id: BookCondition;
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
}

export const conditionOptions: ConditionOption[] = [
  {
    id: 'new',
    title: 'Brand New',
    badge: 'UNREAD • FACTORY FRESH',
    description: 'Factory fresh copy. Unread, uncreased spine, pristine cover with no marks.',
    icon: Sparkles,
  },
  {
    id: 'like_new',
    title: 'Like New',
    badge: 'PRISTINE COPY',
    description: 'Opened or read once. Spine tight and intact, zero highlights, pen notes, or page creases.',
    icon: BookCheck,
  },
  {
    id: 'good',
    title: 'Good Condition',
    badge: 'MOST POPULAR',
    description: 'Minor exterior shelf wear, solid binding, clean pages with full legibility.',
    icon: ThumbsUp,
  },
  {
    id: 'fair',
    title: 'Fair Condition',
    badge: 'STUDENT SYLLABUS COPY',
    description: 'Visible shelf wear, moderate study notes or highlights, 100% complete pages.',
    icon: BookmarkCheck,
  },
];

interface BookConditionCardProps {
  value: BookCondition;
  onChange: (value: BookCondition) => void;
}

export function BookConditionCardGroup({ value, onChange }: BookConditionCardProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 font-sans">
      {conditionOptions.map((opt) => {
        const IconComp = opt.icon;
        const selected = value === opt.id;
        return (
          <div
            key={opt.id}
            onClick={() => onChange(opt.id)}
            role="radio"
            aria-checked={selected}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                onChange(opt.id);
              }
            }}
            className={`cursor-pointer rounded-xl border p-3 sm:p-3.5 transition-all duration-200 relative flex flex-col justify-between select-none shadow-2xs active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-secondary ${
              selected
                ? 'border-secondary bg-secondary/10 shadow-xs'
                : 'border-border/80 bg-card hover:border-secondary/40 hover:bg-muted/40'
            }`}
          >
            {/* Header: Icon and Radio */}
            <div className="flex justify-between items-start">
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  selected
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <IconComp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>

              {/* Radio Indicator */}
              <div
                className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  selected
                    ? 'border-secondary bg-secondary'
                    : 'border-border bg-background'
                }`}
              >
                {selected && <div className="h-1.5 w-1.5 rounded-full bg-secondary-foreground" />}
              </div>
            </div>

            {/* Body Info */}
            <div className="my-2 space-y-0.5">
              <span className="font-bold text-xs sm:text-[13px] text-foreground block leading-snug">
                {opt.title}
              </span>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug line-clamp-2 sm:line-clamp-3">
                {opt.description}
              </p>
            </div>

            {/* Bottom Tag */}
            <div>
              <span
                className={`inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border truncate max-w-full ${
                  selected
                    ? 'bg-secondary/20 text-secondary border-secondary/30'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
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
