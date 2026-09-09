'use client';

import React from 'react';
import { SellBookFormData } from '@/lib/validations/sell-form.schema';
import { Eye, MapPin, CheckCircle2, ShoppingBag, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListingPreviewCardProps {
  formValues: SellBookFormData;
}

const CONDITION_BADGE: Record<string, { label: string; badgeClass: string }> = {
  new: { label: 'Brand New', badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25' },
  like_new: { label: 'Like New', badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/25' },
  good: { label: 'Good Condition', badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25' },
  fair: { label: 'Fair Condition', badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25' },
};

export function ListingPreviewCard({ formValues }: ListingPreviewCardProps) {
  const title = formValues.title?.trim() || 'Book Title will appear here';
  const author = formValues.author?.trim() || 'Author Name';
  const price = Number(formValues.price) || 0;
  const condition = formValues.condition || 'good';
  const conditionInfo = CONDITION_BADGE[condition] || CONDITION_BADGE.good;
  const location = formValues.city ? `${formValues.city}${formValues.state ? `, ${formValues.state}` : ''}` : 'Location pending';

  let previewImageUrl = '';
  if (formValues.images && formValues.images.length > 0) {
    const firstImg = formValues.images[0];
    if (typeof firstImg === 'string') {
      previewImageUrl = firstImg;
    } else if (typeof firstImg === 'object' && 'url' in firstImg) {
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
    <div className="w-full space-y-3 font-sans">
      {/* Header bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Eye className="h-3.5 w-3.5 text-secondary" />
          <span>Live Buyer Storefront Preview</span>
        </div>
        <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20">
          BookFry Card
        </span>
      </div>

      {/* Simulated Book Card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-md max-w-sm mx-auto transition-all">
        {/* Aspect 2:3 Cover Container */}
        <div className="relative w-full aspect-[2/3] bg-muted/60 border-b border-border flex items-center justify-center overflow-hidden">
          {previewImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewImageUrl}
              alt={title}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="p-6 text-center text-muted-foreground space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto text-secondary">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <p className="text-xs font-medium">Cover photo will render here</p>
            </div>
          )}

          {/* Condition Ribbon Top Left */}
          <span
            className={cn(
              'absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-xs backdrop-blur-sm',
              conditionInfo.badgeClass
            )}
          >
            {conditionInfo.label}
          </span>
        </div>

        {/* Card Content Area */}
        <div className="p-4 space-y-2.5">
          {/* Title & Author */}
          <div>
            <h4 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
              {title}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">by {author}</p>
          </div>

          {/* Price & Delivery badge */}
          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground">Price</span>
              <span className="font-mono text-lg font-black text-foreground">
                ₹{price > 0 ? price.toFixed(2) : '0.00'}
              </span>
            </div>
            {formValues.freeShipping && (
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Free Delivery
              </span>
            )}
          </div>

          {/* Seller location snippet */}
          <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1 truncate max-w-[180px]">
              <MapPin className="h-3 w-3 text-secondary shrink-0" />
              <span className="truncate">{location}</span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-3 w-3" />
              <span>Verified</span>
            </span>
          </div>

          {/* Condition Notes excerpt if provided */}
          {formValues.conditionNotes && (
            <p className="text-[11px] text-muted-foreground italic line-clamp-2 bg-muted/40 p-2 rounded-lg border border-border/40">
              &ldquo;{formValues.conditionNotes}&rdquo;
            </p>
          )}

          {/* Simulated Add to Cart Action */}
          <div className="pt-2">
            <div className="w-full py-2.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm opacity-90 select-none">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Buy This Copy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Confidence Info */}
      <div className="p-3.5 bg-muted/30 border border-border rounded-xl text-[11px] text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-secondary shrink-0" />
        <span>Live preview matches exact buyer view on BookFry.</span>
      </div>
    </div>
  );
}

export default ListingPreviewCard;
