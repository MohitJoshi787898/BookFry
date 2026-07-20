'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { BookCarousel } from '@/components/marketing/book-carousel';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { Book, Review, Order, Wishlist } from '@bookmarket/types';
import { Star, ShoppingBag, Plus, Minus, ArrowLeft, CheckCircle, ShieldAlert, Heart } from 'lucide-react';
import Link from 'next/link';
import { BookJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { isAuthenticated, user } = useAuthStore();
  const { addItem } = useCartStore();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const {
    data: book,
    isLoading,
    isError,
  } = useQuery<Book>({
    queryKey: ['book', slug],
    queryFn: () => apiClient(`/books/${slug}`),
    enabled: !!slug,
  });

  const { data: wishlistData } = useQuery<{ wishlist: Wishlist; books: Book[] }>({
    queryKey: ['wishlist'],
    queryFn: () => apiClient('/wishlist'),
    enabled: isAuthenticated,
  });

  const isWishlisted = wishlistData?.wishlist.bookIds.includes(book?.id || '') || false;

  const toggleWishlistMutation = useMutation({
    mutationFn: (bookId: string) =>
      apiClient(`/wishlist/${bookId}`, {
        method: isWishlisted ? 'DELETE' : 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleToggleWishlist = () => {
    if (book) {
      toggleWishlistMutation.mutate(book.id);
    }
  };

  const { data: reviews = [], refetch: refetchReviews } = useQuery<Review[]>({
    queryKey: ['book-reviews', book?.id],
    queryFn: () => apiClient(`/reviews/book/${book?.id}`),
    enabled: !!book?.id,
  });

  const { data: buyerOrders = [] } = useQuery<Order[]>({
    queryKey: ['buyer-orders'],
    queryFn: () => apiClient('/orders'),
    enabled: isAuthenticated,
  });

  const eligibleOrder = buyerOrders.find((ord) =>
    ord.items.some((item) => item.bookId === book?.id) &&
    ['confirmed', 'shipped', 'delivered'].includes(ord.status)
  );

  const hasReviewed = reviews.some((rev) =>
    rev.authorId === user?.id && rev.orderId === eligibleOrder?.id
  );

  const canReview = isAuthenticated && !!eligibleOrder && !hasReviewed;

  const reviewPostMutation = useMutation({
    mutationFn: (reviewData: { bookId: string; orderId: string; rating: number; comment: string }) =>
      apiClient('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      }),
    onSuccess: () => {
      setReviewComment('');
      setReviewRating(5);
      setReviewError(null);
      refetchReviews();
      queryClient.invalidateQueries({ queryKey: ['book', slug] });
    },
    onError: (err: { message?: string }) => {
      setReviewError(err.message || 'Failed to submit review. Try again.');
    },
  });

  const handlePostReview = () => {
    if (!book || !eligibleOrder) return;
    if (reviewComment.trim().length < 10) {
      setReviewError('Review comment must be at least 10 characters long.');
      return;
    }
    reviewPostMutation.mutate({
      bookId: book.id,
      orderId: eligibleOrder.id,
      rating: reviewRating,
      comment: reviewComment,
    });
  };

  const handleIncrement = () => {
    if (book && quantity < book.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!book) return;
    setAddError(null);
    setSuccessMsg(false);
    try {
      await addItem(isAuthenticated, book, quantity);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      const error = err as Error;
      setAddError(error.message || 'Failed to add item to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!book) return;
    try {
      await addItem(isAuthenticated, book, quantity);
      router.push('/cart');
    } catch (err) {
      const error = err as Error;
      setAddError(error.message || 'Failed to initiate buy now');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
          <div className="h-6 w-24 bg-background-subtle rounded" />
          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-1/2 aspect-[2/3] bg-background-subtle rounded-md" />
            <div className="w-full md:w-1/2 space-y-6">
              <div className="h-8 w-3/4 bg-background-subtle rounded" />
              <div className="h-4 w-1/3 bg-background-subtle rounded" />
              <div className="h-6 w-20 bg-background-subtle rounded-full" />
              <div className="h-6 w-24 bg-background-subtle rounded" />
              <div className="h-10 w-full bg-background-subtle rounded-md" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-semibold text-text-primary mb-2">
            Book details could not be found
          </h2>
          <p className="text-text-secondary mb-6 font-sans">
            This listing may have been sold, removed, or has expired.
          </p>
          <Link
            href="/books"
            className="text-brand font-medium hover:underline flex items-center justify-center space-x-1 font-sans"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Browse</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const conditionColors = {
    new: 'bg-success/10 text-success border-success/20',
    like_new: 'bg-brand/10 text-brand border-brand/20',
    good: 'bg-warning/10 text-warning border-warning/20',
    fair: 'bg-accent/10 text-accent border-accent/20',
  }[book.condition];

  const conditionLabels = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
  }[book.condition];

  const imageUrl = book.images?.[0]?.url || '';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookJsonLd book={book} url={`https://bookfry.in/books/${book.slug}`} />
        <BreadcrumbJsonLd
          items={[
            { name: 'Home', item: 'https://bookfry.in' },
            { name: 'Books', item: 'https://bookfry.in/books' },
            { name: book.title, item: `https://bookfry.in/books/${book.slug}` },
          ]}
        />

        <Link
          href="/books"
          className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-brand mb-6 transition-colors font-sans"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to catalog</span>
        </Link>

        <div className="flex flex-col md:flex-row gap-12 mb-12">
          {/* Cover Gallery */}
          <div className="w-full md:w-1/2 max-w-md mx-auto aspect-[2/3] relative rounded-md border border-border bg-background-subtle overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={book.title}
              className="w-full h-full object-cover object-center transition-transform duration-200 hover:scale-[1.03]"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/400x600/16523d/ffffff?text=' +
                  encodeURIComponent(book.title);
              }}
            />
          </div>

          {/* Book Purchasing Action area */}
          <div className="w-full md:w-1/2 space-y-6">
            <div className="space-y-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${conditionColors}`}
              >
                {conditionLabels}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
                {book.title}
              </h1>
              <p className="text-lg text-text-secondary font-medium font-sans">
                by <span className="text-text-primary font-semibold">{book.author}</span>
              </p>
            </div>

            {/* Seller Info */}
            <div className="flex items-center space-x-3 p-4 border border-border rounded-md bg-background-subtle">
              <div className="h-10 w-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold font-sans">
                S
              </div>
              <div className="font-sans">
                <p className="text-sm font-semibold text-text-primary">Seller Listing</p>
                <div className="flex items-center space-x-1 text-xs text-text-secondary">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">
                    {book.ratingAvg > 0 ? book.ratingAvg.toFixed(1) : '5.0'}
                  </span>
                  <span>rating</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-2 font-sans">
              <span className="text-3xl font-extrabold text-text-primary">
                ${book.price.toFixed(2)}
              </span>
              {book.discountPrice && (
                <span className="text-lg text-text-muted line-through">
                  ${book.discountPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Quantity Selector & CTAs */}
            {book.stock > 0 ? (
              <div className="space-y-4 pt-4 font-sans">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-text-secondary">Quantity:</span>
                  <div className="flex items-center border border-border rounded-md bg-surface">
                    <button
                      onClick={handleDecrement}
                      className="p-2 hover:bg-background-subtle text-text-secondary transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-1 text-sm font-semibold text-text-primary w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      className="p-2 hover:bg-background-subtle text-text-secondary transition-colors"
                      disabled={quantity >= book.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-text-muted">({book.stock} copies available)</span>
                </div>

                {addError && <div className="text-sm font-semibold text-danger">{addError}</div>}

                {successMsg && (
                  <div className="text-sm font-semibold text-success flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>Item added to shopping cart successfully!</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex-grow py-3 px-6 rounded-md border border-brand text-brand font-semibold hover:bg-brand/5 transition-all duration-120 flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-grow py-3 px-6 rounded-md bg-brand text-white font-semibold hover:bg-brand-hover shadow-sm transition-all duration-120 flex items-center justify-center"
                  >
                    Buy It Now
                  </button>
                  {isAuthenticated && (
                    <button
                      onClick={handleToggleWishlist}
                      className={`p-3 rounded-md border transition-all flex items-center justify-center ${
                        isWishlisted
                          ? 'border-brand bg-brand/5 text-brand'
                          : 'border-border text-text-secondary hover:bg-background-subtle'
                      }`}
                      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-brand' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 border border-danger/20 bg-danger/5 rounded-md text-danger text-sm font-medium font-sans">
                This book is currently out of stock.
              </div>
            )}

            {/* Description */}
            <div className="border-t border-border pt-6 space-y-2">
              <h2 className="font-serif text-lg font-bold text-text-primary">Description</h2>
              <p className="text-sm text-text-secondary font-sans leading-relaxed">
                {book.description}
              </p>
            </div>

            {/* Specification Table */}
            <div className="border-t border-border pt-6 space-y-3 font-sans">
              <h2 className="font-serif text-lg font-bold text-text-primary">Specifications</h2>
              <div className="border border-border rounded-md overflow-hidden bg-surface">
                <table className="min-w-full divide-y divide-border text-sm">
                  <tbody className="divide-y divide-border">
                    <tr className="flex">
                      <td className="w-1/3 px-4 py-2 font-medium text-text-muted bg-background-subtle">
                        ISBN
                      </td>
                      <td className="w-2/3 px-4 py-2 text-text-primary font-mono">{book.isbn}</td>
                    </tr>
                    <tr className="flex">
                      <td className="w-1/3 px-4 py-2 font-medium text-text-muted bg-background-subtle">
                        Language
                      </td>
                      <td className="w-2/3 px-4 py-2 text-text-primary">{book.language}</td>
                    </tr>
                    {book.publisher && (
                      <tr className="flex">
                        <td className="w-1/3 px-4 py-2 font-medium text-text-muted bg-background-subtle">
                          Publisher
                        </td>
                        <td className="w-2/3 px-4 py-2 text-text-primary">{book.publisher}</td>
                      </tr>
                    )}
                    {book.edition && (
                      <tr className="flex">
                        <td className="w-1/3 px-4 py-2 font-medium text-text-muted bg-background-subtle">
                          Edition
                        </td>
                        <td className="w-2/3 px-4 py-2 text-text-primary">{book.edition}</td>
                      </tr>
                    )}
                    {book.pageCount && (
                      <tr className="flex">
                        <td className="w-1/3 px-4 py-2 font-medium text-text-muted bg-background-subtle">
                          Pages
                        </td>
                        <td className="w-2/3 px-4 py-2 text-text-primary">{book.pageCount}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-border pt-12 mt-12 space-y-8 font-sans">
          <h2 className="font-serif text-2xl font-bold text-text-primary">
            Customer Reviews ({reviews.length})
          </h2>

          {/* Write review button/form if purchaser & not already reviewed */}
          {canReview && (
            <div className="border border-brand/20 bg-brand/5 rounded-md p-6 space-y-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-sans">
                Write a Review
              </h3>

              {reviewError && (
                <div className="p-3 bg-danger/5 border border-danger/20 rounded text-xs font-semibold text-danger font-sans">
                  {reviewError}
                </div>
              )}

              <div className="space-y-4 font-sans">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-text-secondary uppercase">Rating:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-text-secondary hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-text-muted'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts about this book (minimum 10 characters)..."
                    className="w-full rounded border border-border p-3 text-sm bg-background text-text-primary focus:ring-brand focus:border-brand h-28"
                  />
                </div>

                <button
                  type="button"
                  onClick={handlePostReview}
                  disabled={reviewPostMutation.isPending}
                  className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded flex items-center justify-center transition-colors"
                >
                  {reviewPostMutation.isPending ? 'Posting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 border border-border rounded-md bg-surface text-text-secondary text-sm font-sans">
              No reviews for this book yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev) => {
                const revDate = new Date(rev.createdAt).toLocaleDateString();
                return (
                  <div
                    key={rev.id}
                    className="border border-border p-6 bg-surface rounded-md space-y-3 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-text-primary">{rev.authorName}</span>
                      <span className="text-text-muted font-medium">{revDate}</span>
                    </div>
                    <div className="flex space-x-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed font-sans font-medium">
                      {rev.comment}
                    </p>

                    {/* Seller Reply display */}
                    {rev.sellerReply && (
                      <div className="mt-4 p-3 border-l-2 border-brand bg-brand/5 rounded-r text-xs space-y-1">
                        <span className="font-bold text-brand block uppercase tracking-wider">
                          Seller Response
                        </span>
                        <p className="text-text-secondary font-sans leading-relaxed">
                          {rev.sellerReply}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Related Books Carousel Section */}
        {book?.category && (
          <div className="pt-12 border-t border-border mt-16">
            <BookCarousel
              eyebrow="You Might Also Like"
              title={`Related Books in ${book.category.replace('-', ' ').toUpperCase()}`}
              subtitle="Discover similar titles based on genre and category"
              queryParam={`category=${book.category}&limit=10`}
              filterFn={(items) => items.filter((b) => b.id !== book.id)}
              href={`/books?category=${book.category}`}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
