'use client';

import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { SellBookFormData } from '@/lib/validations/sell-form.schema';
import { BookConditionCardGroup } from '@/components/sell/book-condition-card';

interface ConditionTabProps {
  form: UseFormReturn<SellBookFormData>;
  stepNumber?: number;
}

export function ConditionTab({ form, stepNumber = 2 }: ConditionTabProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4 sm:space-y-5 font-sans">
      {/* Header */}
      <div className="border-b border-border/80 pb-3">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">
          Step {stepNumber}: Book Condition Assessment
        </h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
          Accurately grade your book. Honest ratings ensure trusted buyer reviews and eliminate return disputes.
        </p>
      </div>

      {/* 4 Canonical Condition Cards */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground flex items-center gap-1">
          Physical Condition Tier <span className="text-rose-500">*</span>
        </label>
        <Controller
          name="condition"
          control={control}
          render={({ field }) => (
            <BookConditionCardGroup value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.condition && (
          <p className="text-[11px] text-rose-500 font-medium">{errors.condition.message}</p>
        )}
      </div>

      {/* Seller Condition Notes */}
      <div className="space-y-1.5 pt-1">
        <label htmlFor="condition-notes" className="text-xs font-bold text-foreground block">
          Seller Condition Notes &amp; Highlights (Optional)
        </label>
        <textarea
          id="condition-notes"
          rows={2}
          placeholder="Mention specific details: e.g., 'First 2 chapters highlighted with yellow marker; corners slightly rounded; binding solid.'"
          {...register('conditionNotes')}
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary leading-relaxed placeholder:text-muted-foreground"
        />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Buyers appreciate transparent condition notes. Shown directly on your listing offer.
        </p>
        {errors.conditionNotes && (
          <p className="text-[11px] text-rose-500 font-medium">{errors.conditionNotes.message}</p>
        )}
      </div>
    </div>
  );
}

export default ConditionTab;
