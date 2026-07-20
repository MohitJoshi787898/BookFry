'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { Wishlist, Book } from '@bookmarket/types';
import { Heart, Trash2, ShoppingCart, ArrowLeft, Star, HeartCrack } from 'lucide-react';
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
      // Automatically remove from wishlist once added to cart (optional, but standard practice)
      handleRemove(book.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/books"
          className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-brand mb-6 transition-colors font-sans"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>

        <h1 className="font-serif text-3xl font-bold text-text-primary mb-8 flex items-center space-x-3">
          <Heart className="h-8 w-8 text-brand fill-brand" />
          <span>My Wishlist</span>
        </h1>

        {!isAuthenticated ? (
          <div className="text-center py-16 border border-border bg-surface rounded-md space-y-6">
            <HeartCrack className="h-12 w-12 text-text-muted mx-auto" />
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">Please log in</h2>
              <p className="text-sm text-text-secondary max-w-sm mx-auto mt-2 font-sans">
                You must be logged in to view your wishlist.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-brand text-white font-semibold rounded hover:bg-brand-hover font-sans text-sm"
            >
              Sign In
            </Link>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-96 border border-border bg-surface rounded-md" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 border border-border bg-surface rounded-md">
            <h2 className="text-lg font-bold text-text-primary mb-2 font-serif">
              Failed to load wishlist
            </h2>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover text-sm font-semibold font-sans"
            >
              Retry
            </button>
          </div>
        ) : wishlistData.books.length === 0 ? (
          <div className="text-center py-16 border border-border bg-surface rounded-md space-y-6">
            <Heart className="h-12 w-12 text-text-muted mx-auto" />
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">
                Your wishlist is empty
              </h2>
              <p className="text-sm text-text-secondary max-w-sm mx-auto mt-2 font-sans">
                Save items you like in your wishlist to buy them later.
              </p>
            </div>
            <Link
              href="/books"
              className="inline-block px-6 py-2.5 bg-brand text-white font-semibold rounded hover:bg-brand-hover font-sans text-sm"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-sans">
            {wishlistData.books.map((book) => {
              const imageUrl = book.images?.[0]?.url || '';
              return (
                <div
                  key={book.id}
                  className="flex flex-col h-full rounded-md border border-border bg-surface overflow-hidden hover:shadow-md transition-all duration-120 relative group"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(book.id)}
                    className="absolute top-2 right-2 z-10 p-2 bg-surface/80 hover:bg-danger/10 hover:text-danger text-text-secondary rounded-full border border-border backdrop-blur-sm transition-colors"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Book Image Cover Link */}
                  <Link href={`/books/${book.slug}`} className="relative w-full aspect-[2/3] bg-background-subtle overflow-hidden block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover object-center group-hover:opacity-95 transition-opacity"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/400x600/16523d/ffffff?text=' + encodeURIComponent(book.title);
                      }}
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex flex-col flex-grow p-4">
                    <h3 className="font-sans text-sm font-semibold text-text-primary group-hover:text-brand transition-colors line-clamp-1 mb-1">
                      <Link href={`/books/${book.slug}`}>{book.title}</Link>
                    </h3>
                    <p className="text-xs text-text-secondary font-medium mb-3">by {book.author}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-sm font-bold text-text-primary">${book.price.toFixed(2)}</span>
                        {book.discountPrice && (
                          <span className="text-xs text-text-muted line-through">
                            ${book.discountPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-text-secondary">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">
                          {book.ratingAvg > 0 ? book.ratingAvg.toFixed(1) : '5.0'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(book)}
                      disabled={book.stock === 0}
                      className="w-full mt-auto py-2 bg-brand hover:bg-brand-hover disabled:bg-border disabled:text-text-muted text-white text-xs font-bold rounded flex items-center justify-center space-x-2 transition-all"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>{book.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
