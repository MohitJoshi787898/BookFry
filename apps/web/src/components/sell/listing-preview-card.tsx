'use client';

import React from 'react';
import { SellBookFormData } from '@/lib/validations/sell-form.schema';
import { Eye, MapPin, CheckCircle2, ShoppingBag, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListingPreviewCardProps {
  formValues: SellBookFormData;
  isAdmin?: boolean;
}

const CONDITION_BADGE: Record<string, { label: string; badgeClass: string }> = {
  new: { label: 'Brand New', badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25' },
  like_new: { label: 'Like New', badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/25' },
  good: { label: 'Good Condition', badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25' },
  fair: { label: 'Fair Condition', badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25' },
};

export function ListingPreviewCard({ formValues, isAdmin = false }: ListingPreviewCardProps) {
  const title = formValues.title?.trim() || 'Book Title will appear here';
  const author = formValues.author?.trim() || 'Author Name';
  const price = Number(formValues.price) || 0;
  const condition = isAdmin ? 'new' : (formValues.condition || 'good');
  const conditionInfo = CONDITION_BADGE[condition] || CONDITION_BADGE.good;
  const location = formValues.city ? `${formValues.city}${formValues.state ? `, ${formValues.state}` : ''}` : 'Location pending';

  let previewImageUrl = '';
  if (formValues.images && formValues.images.length > 0) {
    const firstImg = formValues.images[0];
    if (typeof firstImg === 'string') {
      previewImageUrl = firstImg;
    } else if (typeof firstImg === 'object' && firstImg !== null && 'url' in firstImg && typeof firstImg.url === 'string') {
      previewImageUrl = firstImg.url;
    } else if (firstImg instanceof Blob || firstImg instanceof File) {
      try {
        previewImageUrl = URL.createObjectURL(firstImg);
      } catch {
        previewImageUrl = '';
      }
    }
  }

  return (
    <div className="w-full space-y-2.5 font-sans p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Eye className="h-3.5 w-3.5 text-secondary" />
          <span>Live Storefront Preview</span>
        </div>
        <span className="text-[9px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20">
          BookFry Card
        </span>
      </div>

      {/* Simulated Compact Book Card matching marketplace BookCard */}
      <div className="rounded-xl border border-border/80 bg-background overflow-hidden shadow-2xs max-w-[235px] mx-auto transition-all hover:shadow-sm">
        {/* Aspect 3:4 Cover Container */}
        <div className="relative w-full aspect-[3/4] bg-muted/50 border-b border-border/60 flex items-center justify-center overflow-hidden">
          {previewImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewImageUrl}
              alt={title}
              className="w-full h-full object-cover object-center transition-transform hover:scale-105 duration-300"
            />
          ) : (
            <div className="p-4 text-center text-muted-foreground space-y-2">
              <div className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto text-secondary shadow-2xs">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-foreground">Cover photo preview</p>
                <p className="text-[10px] text-muted-foreground">Upload photo to preview</p>
              </div>
            </div>
          )}

          {/* Condition Ribbon Top Left */}
          <span
            className={cn(
              'absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border shadow-2xs backdrop-blur-md',
              conditionInfo.badgeClass
            )}
          >
            {conditionInfo.label}
          </span>
        </div>

        {/* Card Content Area */}
        <div className="p-3 space-y-2">
          {/* Title & Author */}
          <div>
            <h4 className="font-bold text-xs sm:text-[13px] text-foreground line-clamp-2 leading-snug">
              {title}
            </h4>
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-medium">by {author}</p>
          </div>

          {/* Price & Delivery badge */}
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="font-mono text-sm sm:text-base font-black text-foreground">
              ₹{price > 0 ? price.toFixed(0) : '0'}
            </span>
            {formValues.freeShipping && (
              <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                Free Delivery
              </span>
            )}
          </div>

          {/* Seller location snippet */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1 truncate max-w-[130px]">
              <MapPin className="h-3 w-3 text-secondary shrink-0" />
              <span className="truncate font-medium">{location}</span>
            </span>
            <span className="flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-3 w-3" />
              <span>Verified</span>
            </span>
          </div>

          {/* Simulated Add to Cart Action */}
          <div className="pt-1">
            <div className="w-full py-2 rounded-lg bg-secondary text-secondary-foreground text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs select-none">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Buy This Copy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Confidence Info */}
      <div className="p-2.5 bg-muted/40 border border-border/60 rounded-xl text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-secondary shrink-0" />
        <span>Matches exact buyer view on the BookFry marketplace.</span>
      </div>
    </div>
  );
}

export default ListingPreviewCard;
