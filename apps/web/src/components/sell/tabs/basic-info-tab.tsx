'use client';

import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { SellBookFormData } from '@/lib/validations/sell-form.schema';
import { CategorySearchSelect } from '@/components/sell/category-search-select';
import { Search, Loader2, CheckCircle2 } from 'lucide-react';

interface BasicInfoTabProps {
  form: UseFormReturn<SellBookFormData>;
  categories: { id: string; name: string }[];
  isFetchingIsbn: boolean;
  isbnFoundMsg: string | null;
  onFetchIsbn: () => Promise<void>;
}

export function BasicInfoTab({
  form,
  categories,
  isFetchingIsbn,
  isbnFoundMsg,
  onFetchIsbn,
}: BasicInfoTabProps) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;

  const source = watch('source');

  return (
    <div className="space-y-6 font-sans">
      {/* Tab Header */}
      <div className="border-b border-border pb-4">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
          Step 1: Book Information
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Enter bibliographic details. Use ISBN auto-lookup to populate title, author, and publisher instantly.
        </p>
      </div>

      {/* Data Entry Mode Selector */}
      <div className="p-4 sm:p-5 bg-muted/40 border border-border rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">
            Metadata Entry Method:
          </span>
          <div className="flex items-center gap-6 text-sm font-medium">
            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <input
                type="radio"
                value="auto"
                {...register('source')}
                className="accent-secondary"
              />
              <span>Auto Fetch via ISBN</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <input
                type="radio"
                value="manual"
                {...register('source')}
                className="accent-secondary"
              />
              <span>Manual Entry</span>
            </label>
          </div>
        </div>

        {source === 'auto' && (
          <div className="space-y-2 pt-3 border-t border-border/60">
            <label htmlFor="isbn-input" className="text-xs font-semibold text-muted-foreground block">
              10- or 13-Digit ISBN (from back cover barcode)
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                id="isbn-input"
                type="text"
                placeholder="e.g. 9780143127741 or 9788120305960"
                {...register('isbn')}
                className="flex-grow px-3.5 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary font-mono"
              />
              <button
                type="button"
                onClick={onFetchIsbn}
                disabled={isFetchingIsbn}
                className="px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isFetchingIsbn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Fetch Details</span>
                  </>
                )}
              </button>
            </div>
            {isbnFoundMsg && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{isbnFoundMsg}</span>
              </p>
            )}
            {errors.isbn && <p className="text-xs text-rose-500 font-medium">{errors.isbn.message}</p>}
          </div>
        )}
      </div>

      {/* Book Title */}
      <div className="space-y-1.5">
        <label htmlFor="book-title" className="text-sm font-semibold text-foreground flex items-center gap-1">
          Book Title <span className="text-rose-500">*</span>
        </label>
        <input
          id="book-title"
          type="text"
          placeholder="e.g. Engineering Mathematics 3rd Edition (H.K. Dass)"
          {...register('title')}
          className="w-full px-3.5 py-2.5 sm:py-3 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
        />
        {errors.title && <p className="text-xs text-rose-500 font-medium">{errors.title.message}</p>}
      </div>

      {/* Author & Publisher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-1.5">
          <label htmlFor="book-author" className="text-sm font-semibold text-foreground flex items-center gap-1">
            Author / Writer <span className="text-rose-500">*</span>
          </label>
          <input
            id="book-author"
            type="text"
            placeholder="e.g. James Clear or R.S. Aggarwal"
            {...register('author')}
            className="w-full px-3.5 py-2.5 sm:py-3 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          {errors.author && <p className="text-xs text-rose-500 font-medium">{errors.author.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="book-publisher" className="text-sm font-semibold text-foreground block">
            Publisher / Edition (Optional)
          </label>
          <input
            id="book-publisher"
            type="text"
            placeholder="e.g. S. Chand Publishing, 5th Edition"
            {...register('publisher')}
            className="w-full px-3.5 py-2.5 sm:py-3 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
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
