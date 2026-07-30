'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { Wishlist, Book } from '@bookmarket/types';
import { Heart, Trash2, ShoppingCart, ArrowLeft, Star, HeartCrack, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const queryClient = useQueryClient();

  const {
    data: wishlistData = { wishlist: { id: '', userId: '', bookIds: [] }, books: [] },
    isLoading,
    isError,
    refetch,
  } = useQuery<{ wishlist: Wishlist; books: Book[] }>({
    queryKey: ['wishlist'],
    queryFn: () => apiClient('/wishlist'),
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: (bookId: string) =>
      apiClient(`/wishlist/${bookId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleRemove = (bookId: string) => {
    removeMutation.mutate(bookId);
  };

  const handleAddToCart = async (book: Book) => {
    try {
      await addItem(isAuthenticated, book, 1);
      handleRemove(book.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary transition-colors duration-200">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans">
        {/* Navigation Breadcrumb */}
        <Link
          href="/books"
          className="inline-flex items-center space-x-2 text-xs font-bold text-text-muted hover:text-secondary mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Catalog</span>
        </Link>

        {/* Page Title */}
        <div className="flex items-center justify-between border-b border-border pb-5 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary">
              <Heart className="h-7 w-7 fill-secondary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-primary dark:text-foreground">
                My Saved Wishlist
              </h1>
              <p className="text-xs font-medium text-text-muted">
                {wishlistData.books.length} saved items ready for purchase
              </p>
            </div>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-20 border border-border bg-card rounded-3xl space-y-6 max-w-md mx-auto shadow-sm">
            <HeartCrack className="h-14 w-14 text-text-muted mx-auto" />
            <div className="space-y-2 px-6">
              <h2 className="font-serif text-xl font-bold text-text-primary">Log in to view your wishlist</h2>
              <p className="text-xs text-text-muted font-medium leading-relaxed">
                Save your favorite textbooks and storybooks to keep track of price drops and availability.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/90 text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Sign In Now</span>
            </Link>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-80 border border-border bg-card rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 border border-border bg-card rounded-3xl space-y-4 max-w-md mx-auto">
            <h2 className="text-base font-bold text-text-primary font-serif">
              Failed to load wishlist items
            </h2>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition-colors shadow-xs"
            >
              Retry
            </button>
          </div>
        ) : wishlistData.books.length === 0 ? (
          <div className="text-center py-20 border border-border bg-card rounded-3xl space-y-6 max-w-md mx-auto shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto text-secondary">
              <Heart className="h-8 w-8" />
            </div>
            <div className="space-y-2 px-6">
              <h2 className="font-serif text-xl font-bold text-text-primary">
                Your wishlist is empty
              </h2>
              <p className="text-xs text-text-muted font-medium leading-relaxed">
                Tap the heart icon on any book card to save it here for future reading or price drop alerts.
              </p>
            </div>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-brand text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm hover:scale-[1.02] transition-transform"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {wishlistData.books.map((book, idx) => {
              const imageUrl =
                book.images?.[0]?.url ||
                'https://placehold.co/400x600/163A63/ffffff?text=' + encodeURIComponent(book.title || 'BookFry');
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all duration-300 relative group"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(book.id)}
                    className="absolute top-2.5 right-2.5 z-10 p-2 bg-card/90 hover:bg-danger/10 hover:text-danger text-text-muted rounded-full border border-border/80 backdrop-blur-md transition-colors"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  {/* Book Image Cover Link */}
                  <Link href={`/books/${book.slug}`} className="relative w-full aspect-[2/3] bg-background-subtle overflow-hidden block border-b border-border/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/400x600/163A63/ffffff?text=' + encodeURIComponent(book.title);
                      }}
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex flex-col flex-grow p-3.5 space-y-2">
                    <h3 className="text-xs font-bold text-text-primary group-hover:text-secondary transition-colors line-clamp-1">
                      <Link href={`/books/${book.slug}`}>{book.title}</Link>
                    </h3>
                    <p className="text-[10px] text-text-muted font-medium line-clamp-1">by {book.author}</p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-xs font-black text-text-primary">₹{(book.lowestPrice ?? book.price).toFixed(0)}</span>
                        {book.discountPrice && (
                          <span className="text-[10px] text-text-muted line-through">
                            ₹{book.discountPrice.toFixed(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-[10px] text-text-muted font-bold">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{book.ratingAvg > 0 ? book.ratingAvg.toFixed(1) : '4.8'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(book)}
                      disabled={book.stock === 0}
                      className="w-full mt-auto py-2 bg-secondary hover:bg-secondary/90 disabled:bg-border disabled:text-text-muted text-secondary-foreground text-[10px] font-extrabold uppercase tracking-wider rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>{book.stock > 0 ? 'Move to Cart' : 'Out of Stock'}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
