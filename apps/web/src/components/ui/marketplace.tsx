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
    sm: 'text-xs sm:text-sm font-black',
    md: 'text-base sm:text-lg font-black',
    lg: 'text-xl sm:text-2xl font-black',
  };

  const crossedSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  // Calculate discount percentage
  let discountPercentage = 0;
  if (originalPrice && originalPrice > price) {
    discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  return (
    <div className={cn('flex items-baseline gap-1.5 font-sans', className)}>
      <span className={cn('text-text-primary font-mono', sizes[size])}>₹{price.toFixed(0)}</span>
      {originalPrice && originalPrice > price && (
        <>
          <span className={cn('text-text-muted line-through font-mono', crossedSizes[size])}>
            ₹{originalPrice.toFixed(0)}
          </span>
          <span className={cn('text-emerald-600 font-bold', crossedSizes[size])}>
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
    new: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    like_new: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    good: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    fair: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    acceptable: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  }[condition] || 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider font-sans select-none',
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
    <div className={cn('flex items-center space-x-1 text-[10px] text-text-secondary font-sans font-bold select-none', className)}>
      <div className="flex text-amber-400">
        <Star className="h-3 w-3 fill-current text-amber-400 shrink-0" />
      </div>
      <span className="font-mono">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-text-muted font-normal">({count.toLocaleString()})</span>}
    </div>
  );
}

export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 3;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider select-none border font-sans',
        isOutOfStock
          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800'
          : isLowStock
            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
        className
      )}
    >
      {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${stock} Left` : 'In Stock'}
    </span>
  );
}

export function SellerCard({ name, rating, isVerified = true, className }: { name: string; rating?: number; isVerified?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-1.5 text-[9px] sm:text-[10px] text-text-muted font-sans font-medium', className)}>
      <span>Seller:</span>
      <span className="text-text-secondary font-bold truncate max-w-[100px]">{name}</span>
      {isVerified && (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 fill-emerald-50 dark:fill-emerald-900/30 shrink-0" />
      )}
      {rating !== undefined && (
        <span className="flex items-center gap-0.5 ml-1 font-bold text-text-secondary">
          <Star className="h-2.5 w-2.5 fill-current text-amber-400" />
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
export default PriceTag;
