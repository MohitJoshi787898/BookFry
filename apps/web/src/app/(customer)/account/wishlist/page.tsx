'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { Book } from '@bookmarket/types';
import { ShoppingBag, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function CustomerWishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const queryClient = useQueryClient();

  const { data: wishlistRaw, isError, refetch } = useQuery<{ books?: Book[] } | Book[]>({
    queryKey: ['buyer-wishlist'],
    queryFn: () => apiClient('/wishlist'),
    enabled: isAuthenticated,
  });

  const books: Book[] = Array.isArray(wishlistRaw)
    ? wishlistRaw
    : wishlistRaw?.books || [];

  const removeMutation = useMutation({
    mutationFn: (bookId: string) =>
      apiClient(`/wishlist/${bookId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-wishlist'] });
    },
  });

  if (!isAuthenticated) {
    return (
      <RoleEmptyState
        title="Sign In to Access Your Saved Books"
        description="Keep track of price drops and semester reading lists across BookFry."
        mascotVariant="reading"
      />
    );
  }

  return (
    <div className="space-y-6">
        <RoleHero
          title="Saved Books &amp; Wishlist"
          subtitle="Keep track of textbooks you want to buy, get instant in-stock notifications, and move items to your cart with 1 click."
          badgeText="Student Reading Wishlist"
          showMascot={true}
          mascotPose="reading"
          stats={[
            { label: 'Saved Titles', value: books.length, badge: 'Wishlist', isPositive: true },
            { label: 'In Stock', value: books.filter((b) => (b.stock || 1) > 0).length, badge: 'Available', isPositive: true },
            { label: 'Price Drops', value: 'Active', badge: 'Alerts On', isPositive: true },
            { label: 'Discount Est.', value: 'Up to 60%', badge: 'Savings', isPositive: true },
          ]}
        />

        {isError ? (
          <RoleEmptyState
            title="Wishlist Fetch Issue"
            description="Failed to load your saved books."
            mascotVariant="pointing"
            action={{ label: 'Retry Fetch', onClick: () => refetch() }}
          />
        ) : books.length === 0 ? (
          <RoleEmptyState
            title="Your Wishlist is Empty"
            description="Explore verified textbooks and save your favorite titles for quick purchase later!"
            mascotVariant="searching"
            action={{
              label: 'Browse Book Marketplace',
              onClick: () => window.location.assign('/books'),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="p-5 rounded-3xl border border-border/80 bg-card hover:border-secondary/40 transition-all shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/20">
                      {book.condition?.replace('_', ' ') || 'Good'}
                    </span>
                    <button
                      onClick={() => removeMutation.mutate(book.id)}
                      className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Remove from saved items"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <Link
                      href={`/books/${book.slug}`}
                      className="font-serif text-base font-bold text-foreground hover:text-secondary line-clamp-1 transition-colors"
                    >
                      {book.title}
                    </Link>
                    <p className="text-xs text-muted-foreground font-medium">by {book.author}</p>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="font-mono font-extrabold text-lg text-foreground">₹{book.price}</span>
                    <span className={`text-[10px] font-bold ${book.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                      {book.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      addItem(isAuthenticated, book);
                      removeMutation.mutate(book.id);
                    }}
                    className="flex-1 py-2.5 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs rounded-2xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Move to Cart</span>
                  </button>
                  <Link
                    href={`/books/${book.slug}`}
                    className="p-2.5 rounded-2xl border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="View details"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
