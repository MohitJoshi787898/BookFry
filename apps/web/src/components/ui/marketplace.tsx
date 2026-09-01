import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PriceTagProps {
  price: number;
  originalPrice?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceTag({ price, originalPrice, className, size = 'sm' }: PriceTagProps) {
  const sizes = {
    sm: 'text-sm sm:text-base font-black',
    md: 'text-base sm:text-xl font-black',
    lg: 'text-xl sm:text-2xl font-black',
  };

  const crossedSizes = {
    sm: 'text-xs',
    md: 'text-xs sm:text-sm',
    lg: 'text-sm sm:text-base',
  };

  // Calculate discount percentage
  let discountPercentage = 0;
  if (originalPrice && originalPrice > price) {
    discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  return (
    <div className={cn('flex items-baseline gap-2 font-sans', className)}>
      <span className={cn('text-foreground font-mono', sizes[size])}>₹{price.toFixed(0)}</span>
      {originalPrice && originalPrice > price && (
        <>
          <span className={cn('text-muted-foreground line-through font-mono', crossedSizes[size])}>
            ₹{originalPrice.toFixed(0)}
          </span>
          <span className={cn('text-emerald-600 dark:text-emerald-400 font-bold', crossedSizes[size])}>
            {discountPercentage}% OFF
          </span>
        </>
      )}
    </div>
  );
}

export type BookCondition = 'new' | 'like_new' | 'good' | 'fair' | 'acceptable';

export function ConditionBadge({ condition, className }: { condition: BookCondition; className?: string }) {
  const displayCondition = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    acceptable: 'Acceptable',
  }[condition] || 'Good';

  const conditionColors = {
    new: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    like_new: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    good: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    fair: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    acceptable: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
  }[condition] || 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold uppercase tracking-wider font-sans select-none',
        conditionColors,
        className
      )}
    >
      {displayCondition}
    </span>
  );
}

export function Rating({ rating, count, className }: { rating: number; count?: number; className?: string }) {
  return (
    <div className={cn('flex items-center space-x-1.5 text-xs text-foreground font-sans font-bold select-none', className)}>
      <div className="flex text-amber-400">
        <Star className="h-3.5 w-3.5 fill-current text-amber-400 shrink-0" />
      </div>
      <span className="font-mono">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted-foreground font-normal">({count.toLocaleString()})</span>}
    </div>
  );
}

export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 3;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider select-none border font-sans',
        isOutOfStock
          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
          : isLowStock
            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        className
      )}
    >
      {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${stock} Left` : 'In Stock'}
    </span>
  );
}

export function SellerCard({ name, rating, isVerified = true, className }: { name: string; rating?: number; isVerified?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-xs text-muted-foreground font-sans font-medium', className)}>
      <span>Seller:</span>
      <span className="text-foreground font-bold truncate max-w-[120px]">{name}</span>
      {isVerified && (
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
      )}
      {rating !== undefined && (
        <span className="flex items-center gap-1 ml-1 font-bold text-foreground">
          <Star className="h-3 w-3 fill-current text-amber-400" />
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
export default PriceTag;
