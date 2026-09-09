'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Book } from '@bookmarket/types';
import {
  Star,
  Plus,
  Minus,
  Trash2,
  Heart,
  MapPin,
  Loader2,
  ShoppingBag,
  Layers,
} from 'lucide-react';

import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { useWishlist } from '@/hooks/use-wishlist';
import { toast } from '@/stores/toast.store';
import { cn } from '@/lib/utils';

export interface BookCardProps {
  book: Book;
  compact?: boolean;
}

/* ─── condition config — uses global.css utility classes ─────────────────── */
const COND: Record<string, { label: string; cls: string; dot: string }> = {
  new:        { label: 'New',      cls: 'condition-new',        dot: 'bg-emerald-500' },
  like_new:   { label: 'Like New', cls: 'condition-like-new',   dot: 'bg-cyan-500'    },
  good:       { label: 'Good',     cls: 'condition-good',       dot: 'bg-emerald-400' },
  fair:       { label: 'Fair',     cls: 'condition-fair',       dot: 'bg-amber-500'   },
  acceptable: { label: 'Used',     cls: 'condition-acceptable', dot: 'bg-secondary'   },
};

export function BookCard({ book, compact = false }: BookCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [busy, setBusy]     = useState(false);
  const [imgOk, setImgOk]   = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const wishlisted  = isWishlisted(book.id);
  const cartItem    = items.find((i) => i.listingId === book.id || i.bookId === book.id);
  const qty         = cartItem?.quantity ?? 0;
  const cond        = COND[book.condition] ?? COND.good;
  const outOfStock  = book.stock === 0;
  const isBestseller = book.tags?.includes('bestseller');
  const multiSeller = (book.listingCount ?? 0) > 1;

  const imageUrl = !imgErr
    ? book.images?.[0]?.url ||
      `https://placehold.co/300x400/1A3B5C/F8FAFC?text=${encodeURIComponent(book.title ?? 'Book')}`
    : `https://placehold.co/300x400/1A3B5C/FFFFFF?text=${encodeURIComponent(book.title ?? 'Book')}`;

  /* ─── pricing ──────────────────────────────────────────────────────────── */
  const display  = book.lowestPrice ?? book.price;
  const original = book.discountPrice && book.discountPrice > display
    ? book.discountPrice
    : Math.round(display * 1.38);
  const pctOff   = original > display ? Math.round(((original - display) / original) * 100) : 0;

  /* ─── event helpers ─────────────────────────────────────────────────────── */
  const guard = (fn: () => Promise<void>) =>
    async (e: React.MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
      if (busy) return;
      setBusy(true);
      try { await fn(); } catch { /* handled per-fn */ } finally { setBusy(false); }
    };

  const onAdd = guard(async () => {
    if (outOfStock) return;
    await addItem(isAuthenticated, book, 1);
    toast.success(`"${book.title}" added to cart.`, {
      title: 'Added to Cart',
      action: { label: 'View Cart', href: '/cart' },
    });
  });

  const onInc = guard(async () => {
    if (book.stock !== undefined && qty >= book.stock) return;
    await updateQuantity(isAuthenticated, book.id, qty + 1);
  });

  const onDec = guard(async () => {
    if (qty > 1) {
      await updateQuantity(isAuthenticated, book.id, qty - 1);
    } else {
      await removeItem(isAuthenticated, book.id);
      toast.info(`"${book.title}" removed from cart.`);
    }
  });

  const onWishlist = guard(async () => {
    await toggleWishlist(book.id);
    if (!wishlisted) toast.success(`Saved to wishlist.`, { title: 'Saved' });
    else toast.info('Removed from wishlist.');
  });

  return (
    <article
      className={cn(
        'group relative flex flex-col h-full overflow-hidden select-none',
        /* shape */
        'rounded-2xl border border-border/70 bg-card',
        /* elevation */
        'shadow-sm hover:shadow-md',
        /* motion — native spring lift */
        'transition-all duration-200 ease-out hover:-translate-y-1 hover:border-secondary/40',
        compact && 'max-w-[200px]',
      )}
    >

      {/* ══════════════════════════════════════════
          COVER — compact square-ish (4:5) thumbnail
          Makes cards proportionate at every grid width
          ══════════════════════════════════════════ */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-muted/40 flex-shrink-0">

        {/* Book cover image */}
        <Link
          href={`/books/${book.slug}`}
          className="absolute inset-0 block"
          tabIndex={-1}
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={book.title}
            loading="lazy"
            onLoad={() => setImgOk(true)}
            onError={() => setImgErr(true)}
            className={cn(
              'h-full w-full object-cover',
              'transition-transform duration-400 ease-out group-hover:scale-105',
              imgOk ? 'opacity-100' : 'opacity-0',
            )}
          />
          {!imgOk && <div className="absolute inset-0 bg-muted/60 animate-pulse" />}
        </Link>

        {/* Subtle gradient into card body — seamless merge */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, hsl(var(--card)) 0%, transparent 100%)',
          }}
        />

        {/* ─── Discount ribbon — top-left ─────────────────── */}
        {pctOff > 0 && (
          <span
            aria-label={`${pctOff}% off`}
            className="bookmark-badge absolute top-0 left-3 z-10 inline-flex items-center px-2 pt-1 pb-2.5 text-[10px] font-black uppercase tracking-widest leading-none bg-secondary text-secondary-foreground shadow-md"
          >
            {pctOff}%<br />OFF
          </span>
        )}

        {/* ─── Bestseller pill — top-left below ribbon ────── */}
        {isBestseller && (
          <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary text-primary-foreground shadow-sm">
            <Star className="h-2 w-2 fill-current" />Popular
          </span>
        )}

        {/* ─── Wishlist — top-right ───────────────────────── */}
        <button
          type="button"
          onClick={onWishlist}
          disabled={busy}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className={cn(
            'absolute top-2 right-2 z-10 w-7 h-7 rounded-xl flex items-center justify-center cursor-pointer',
            'glass-surface shadow-sm',
            'transition-all duration-200 active:scale-90',
            wishlisted ? 'text-secondary border-secondary/30' : 'text-muted-foreground hover:text-secondary',
          )}
        >
          <Heart
            className={cn('h-3.5 w-3.5 transition-all duration-150',
              wishlisted ? 'fill-secondary scale-110' : '')}
          />
        </button>

        {/* ─── Multi-seller pill — bottom-left ────────────── */}
        {multiSeller && (
          <span className="absolute bottom-1.5 left-2 z-10 pointer-events-none inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md glass-surface text-[9px] font-semibold text-muted-foreground">
            <Layers className="h-2.5 w-2.5" />{book.listingCount} sellers
          </span>
        )}

        {/* ─── Out-of-stock overlay ───────────────────────── */}
        {outOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/55 backdrop-blur-[2px] pointer-events-none">
            <span className="px-2.5 py-1 rounded-lg glass-surface text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          INFO PANEL — the premium part
          ══════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 px-3 pt-2 pb-2.5 gap-1.5">

        {/* Title — hero element, 2-line clamp */}
        <h3 className="text-[12.5px] sm:text-[13px] font-extrabold text-foreground leading-[1.3] line-clamp-2 min-h-[2.6em] group-hover:text-secondary transition-colors duration-200">
          <Link href={`/books/${book.slug}`} title={book.title}>
            {book.title}
          </Link>
        </h3>

        {/* Author row */}
        <p className="text-[11px] text-muted-foreground leading-none truncate">
          <span className="font-medium text-foreground/70">{book.author}</span>
          {book.edition && (
            <span className="text-muted-foreground/60"> · {book.edition}</span>
          )}
        </p>

        {/* Condition + Rating row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-[2px] rounded-md border text-[10px] font-bold leading-none shrink-0',
              cond.cls,
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', cond.dot)} />
            {cond.label}
          </span>

          {(book.ratingAvg ?? 0) > 0 ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-secondary leading-none">
              <Star className="h-2.5 w-2.5 fill-secondary text-secondary" />
              {(book.ratingAvg ?? 0).toFixed(1)}
              {(book.ratingCount ?? 0) > 0 && (
                <span className="text-muted-foreground font-normal">
                  ({book.ratingCount! > 999 ? `${(book.ratingCount! / 1000).toFixed(1)}k` : book.ratingCount})
                </span>
              )}
            </span>
          ) : null}
        </div>

        {/* ─── Price + location ─────────────────────────────── */}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          <div className="flex items-baseline gap-1">
            <span className="text-sm sm:text-[15px] font-extrabold text-foreground tracking-tight leading-none">
              ₹{display.toFixed(0)}
            </span>
            {pctOff > 0 && (
              <span className="text-[11px] text-muted-foreground line-through font-normal leading-none">
                ₹{original.toFixed(0)}
              </span>
            )}
          </div>

          {(book.campusName ?? book.sellerCity) ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-secondary font-semibold truncate max-w-[80px] shrink-0">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{book.campusName ?? book.sellerCity}</span>
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-success shrink-0">In Stock</span>
          )}
        </div>

        {/* ─── Cart CTA ─────────────────────────────────────── */}
        <div className="pt-1">
          <CartControl
            outOfStock={outOfStock}
            qty={qty}
            busy={busy}
            stock={book.stock}
            condition={book.condition}
            onAdd={onAdd}
            onInc={onInc}
            onDec={onDec}
          />
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CartControl — extracted to keep BookCard under 250 lines
───────────────────────────────────────────────────────────────────────────── */
interface CartControlProps {
  outOfStock: boolean;
  qty: number;
  busy: boolean;
  stock?: number;
  condition: string;
  onAdd: (e: React.MouseEvent) => void;
  onInc: (e: React.MouseEvent) => void;
  onDec: (e: React.MouseEvent) => void;
}

function CartControl({ outOfStock, qty, busy, stock, condition, onAdd, onInc, onDec }: CartControlProps) {
  if (outOfStock) {
    return (
      <div className="w-full h-8 rounded-xl flex items-center justify-center bg-muted/50 border border-border/40 text-[11px] font-bold text-muted-foreground/50 cursor-not-allowed">
        Unavailable
      </div>
    );
  }

  if (qty > 0) {
    return (
      <div
        className="flex items-center justify-between w-full h-8 px-1 rounded-xl bg-secondary/10 border border-secondary/20"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <button
          type="button"
          onClick={onDec}
          disabled={busy}
          aria-label={qty === 1 ? 'Remove from cart' : 'Decrease quantity'}
          className="w-7 h-6 flex items-center justify-center rounded-lg text-secondary hover:bg-secondary/20 active:scale-90 transition-all cursor-pointer disabled:opacity-50"
        >
          {qty === 1
            ? <Trash2 className="h-3 w-3 text-danger" />
            : <Minus className="h-3 w-3 stroke-[2.5]" />}
        </button>

        <span className="text-xs font-black text-secondary min-w-[1.5rem] text-center leading-none">
          {busy ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : qty}
        </span>

        <button
          type="button"
          onClick={onInc}
          disabled={busy || (stock !== undefined && qty >= stock)}
          aria-label="Increase quantity"
          className="w-7 h-6 flex items-center justify-center rounded-lg text-secondary hover:bg-secondary/20 active:scale-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="h-3 w-3 stroke-[2.5]" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={busy}
      className={cn(
        'tap-scale w-full h-8 rounded-xl text-[11px] font-bold',
        'flex items-center justify-center gap-1.5',
        'bg-secondary/10 hover:bg-secondary border border-secondary/20 hover:border-secondary',
        'text-secondary hover:text-secondary-foreground',
        'transition-colors duration-200 cursor-pointer disabled:opacity-60',
      )}
    >
      {busy ? (
        <><Loader2 className="h-3 w-3 animate-spin" /><span>Adding…</span></>
      ) : (
        <>
          <ShoppingBag className="h-3 w-3" />
          <span>{condition === 'new' ? 'Add to Cart' : 'Get Copy'}</span>
        </>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SkeletonBookCard
───────────────────────────────────────────────────────────────────────────── */
export function SkeletonBookCard() {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-border/60 bg-card overflow-hidden animate-pulse shadow-sm">
      <div className="w-full aspect-[4/5] bg-muted/60 flex-shrink-0" />
      <div className="flex flex-col flex-1 px-3 pt-2 pb-2.5 gap-2">
        <div className="space-y-1.5">
          <div className="h-3.5 w-11/12 bg-muted rounded-md" />
          <div className="h-3 w-8/12 bg-muted rounded-md" />
          <div className="h-3 w-6/12 bg-muted rounded-md" />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="h-4 w-12 bg-muted rounded-md" />
          <div className="h-3 w-10 bg-muted rounded-md" />
        </div>
        <div className="flex justify-between items-center pt-0.5">
          <div className="h-4 w-14 bg-muted rounded-md" />
          <div className="h-3 w-12 bg-muted rounded-md" />
        </div>
        <div className="h-8 w-full bg-muted/80 rounded-xl mt-1" />
      </div>
    </div>
  );
}

export default BookCard;
