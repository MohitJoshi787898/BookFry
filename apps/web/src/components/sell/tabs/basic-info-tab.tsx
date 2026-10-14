'use client';

import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { SellBookFormData } from '@/lib/validations/sell-form.schema';
import { CategorySearchSelect } from '@/components/sell/category-search-select';
import { Search, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

interface BasicInfoTabProps {
  form: UseFormReturn<SellBookFormData>;
  categories: { id: string; name: string }[];
  isFetchingIsbn: boolean;
  isbnFoundMsg: string | null;
  onFetchIsbn: () => Promise<void>;
  isAdmin?: boolean;
  stepNumber?: number;
}

export function BasicInfoTab({
  form,
  categories,
  isFetchingIsbn,
  isbnFoundMsg,
  onFetchIsbn,
  isAdmin = false,
  stepNumber = 1,
}: BasicInfoTabProps) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;

  const source = watch('source');

  return (
    <div className="space-y-4 sm:space-y-5 font-sans">
      {/* Tab Header */}
      <div className="border-b border-border/80 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">
            Step {stepNumber}: Book Information
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            Enter bibliographic details. Use ISBN auto-lookup to populate title, author, and publisher instantly.
          </p>
        </div>
        {isAdmin && (
          <span className="inline-flex items-center gap-1 self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Sparkles className="h-3 w-3" />
            <span>Condition: Brand New (Default)</span>
          </span>
        )}
      </div>

      {/* Data Entry Mode Selector */}
      <div className="p-3 sm:p-4 bg-muted/40 border border-border/80 rounded-xl space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-foreground">
            Metadata Entry Method:
          </span>
          <div className="flex items-center gap-4 text-xs font-medium">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-foreground">
              <input
                type="radio"
                value="auto"
                {...register('source')}
                className="accent-secondary h-3.5 w-3.5"
              />
              <span>Auto Fetch via ISBN</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-foreground">
              <input
                type="radio"
                value="manual"
                {...register('source')}
                className="accent-secondary h-3.5 w-3.5"
              />
              <span>Manual Entry</span>
            </label>
          </div>
        </div>

        {source === 'auto' && (
          <div className="space-y-1.5 pt-2.5 border-t border-border/60">
            <label htmlFor="isbn-input" className="text-[11px] sm:text-xs font-semibold text-muted-foreground block">
              10- or 13-Digit ISBN (from back cover barcode)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="isbn-input"
                type="text"
                placeholder="e.g. 978-0-14-312774-1 or 9780132350884"
                {...register('isbn')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onFetchIsbn();
                  }
                }}
                className="flex-grow h-10 px-3.5 text-xs sm:text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary font-mono"
              />
              <button
                type="button"
                onClick={onFetchIsbn}
                disabled={isFetchingIsbn}
                className="h-10 px-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isFetchingIsbn ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" />
                    <span>Fetch Details</span>
                  </>
                )}
              </button>
            </div>
            {isbnFoundMsg && (
              <p className="text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{isbnFoundMsg}</span>
              </p>
            )}
            {errors.isbn && <p className="text-[11px] text-rose-500 font-medium">{errors.isbn.message}</p>}
          </div>
        )}
      </div>

      {/* Book Title */}
      <div className="space-y-1.5">
        <label htmlFor="book-title" className="text-xs font-bold text-foreground flex items-center gap-1">
          Book Title <span className="text-rose-500">*</span>
        </label>
        <input
          id="book-title"
          type="text"
          placeholder="e.g. Engineering Mathematics 3rd Edition (H.K. Dass)"
          {...register('title')}
          className="w-full h-10 px-3.5 text-xs sm:text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
        />
        {errors.title && <p className="text-[11px] text-rose-500 font-medium">{errors.title.message}</p>}
      </div>

      {/* Author & Publisher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        <div className="space-y-1.5">
          <label htmlFor="book-author" className="text-xs font-bold text-foreground flex items-center gap-1">
            Author / Writer <span className="text-rose-500">*</span>
          </label>
          <input
            id="book-author"
            type="text"
            placeholder="e.g. James Clear or R.S. Aggarwal"
            {...register('author')}
            className="w-full h-10 px-3.5 text-xs sm:text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          {errors.author && <p className="text-[11px] text-rose-500 font-medium">{errors.author.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="book-publisher" className="text-xs font-bold text-foreground block">
            Publisher / Edition (Optional)
          </label>
          <input
            id="book-publisher"
            type="text"
            placeholder="e.g. S. Chand Publishing, 5th Edition"
            {...register('publisher')}
            className="w-full h-10 px-3.5 text-xs sm:text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      {/* Searchable Category Select */}
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <CategorySearchSelect
            categories={categories}
            value={field.value}
            onChange={field.onChange}
            error={errors.category?.message}
          />
        )}
      />
    </div>
  );
}

export default BasicInfoTab;
