'use client';

import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { SellBookFormData } from '@/lib/validations/sell-form.schema';
import { BookConditionCardGroup } from '@/components/sell/book-condition-card';

interface ConditionTabProps {
  form: UseFormReturn<SellBookFormData>;
}

export function ConditionTab({ form }: ConditionTabProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
          Step 2: Book Condition Assessment
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Accurately grade your book. Honest ratings ensure trusted buyer reviews and eliminate return disputes.
        </p>
      </div>

      {/* 4 Canonical Condition Cards */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1">
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
          <p className="text-xs text-rose-500 font-medium">{errors.condition.message}</p>
        )}
      </div>

      {/* Seller Condition Notes */}
      <div className="space-y-1.5 pt-2">
        <label htmlFor="condition-notes" className="text-sm font-semibold text-foreground block">
          Seller Condition Notes &amp; Highlights (Optional)
        </label>
        <textarea
          id="condition-notes"
          rows={3}
          placeholder="Mention specific details: e.g., 'First 2 chapters highlighted with yellow marker; corners slightly rounded; binding solid; name written inside cover.'"
          {...register('conditionNotes')}
          className="w-full px-3.5 py-2.5 sm:py-3 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary leading-relaxed"
        />
        <p className="text-xs text-muted-foreground">
          Buyers appreciate transparent condition notes. This text will be shown directly on your listing offer.
        </p>
        {errors.conditionNotes && (
          <p className="text-xs text-rose-500 font-medium">{errors.conditionNotes.message}</p>
        )}
      </div>
    </div>
  );
}

export default ConditionTab;
