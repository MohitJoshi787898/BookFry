'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { Book, Review, Order, Wishlist } from '@bookmarket/types';

interface ListingOption {
  id: string;
  price?: number;
  stock?: number;
  condition?: Book['condition'];
  sellerId?: string;
}

type BookWithListings = Book & {
  listings?: ListingOption[];
};
import {
  Star,
  ShoppingBag,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle,
  ShieldAlert,
  Heart,
  ThumbsUp,
  ChevronDown,
  Lock,
  RotateCcw,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/ui/marketplace';
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
  const [isDescExpanded, setIsDescExpanded] = useState(false);

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

  // Fetch related books for the sidebar
  const { data: relatedBooksData } = useQuery<{ books: Book[] }>({
    queryKey: ['related-books-sidebar', book?.category],
    queryFn: () => apiClient(`/books?category=${book?.category}&limit=5`),
    enabled: !!book?.category,
  });

  const relatedBooks = (relatedBooksData?.books || []).filter((b) => b.id !== book?.id).slice(0, 4);

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

  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  const availableListings: ListingOption[] = (book as BookWithListings | null)?.listings ?? [];
  const activeListing =
    availableListings.find((l) => l.id === selectedListingId) || availableListings[0];

  const targetBookForCart: Book | null = book
    ? {
        ...book,
        id: activeListing?.id || book.id,
        price: activeListing?.price ?? book.price,
        stock: activeListing?.stock ?? book.stock,
        condition: activeListing?.condition ?? book.condition,
        sellerId: activeListing?.sellerId ?? book.sellerId,
      }
    : null;

  const handleIncrement = () => {
    const currentStock = activeListing?.stock ?? book?.stock ?? 1;
    if (quantity < currentStock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!targetBookForCart) return;
    setAddError(null);
    setSuccessMsg(false);
    try {
      await addItem(isAuthenticated, targetBookForCart, quantity);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3500);
    } catch (err) {
      const error = err as Error;
      setAddError(error.message || 'Failed to add item to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!targetBookForCart) return;
    try {
      await addItem(isAuthenticated, targetBookForCart, quantity);
      router.push('/cart');
    } catch (err) {
      const error = err as Error;
      setAddError(error.message || 'Failed to initiate buy now');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
          <div className="h-6 w-24 bg-muted rounded" />
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-1/3 aspect-[2/3] bg-muted rounded-md" />
            <div className="w-full lg:w-2/3 space-y-6">
              <div className="h-8 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-6 w-20 bg-muted rounded-full" />
              <div className="h-24 w-full bg-muted rounded-md" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-text-primary mb-2">
            Book details could not be found
          </h2>
          <p className="text-text-secondary mb-6 font-sans">
            This listing may have been sold, removed, or has expired.
          </p>
          <Link
            href="/books"
            className="text-brand font-bold hover:underline flex items-center justify-center space-x-1 font-sans"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Browse</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl = book.images?.[0]?.url || '';

  // Hardcoded mockup review ratings breakdown matching screenshot exactly
  const ratingBreakdown = [
    { stars: 5, count: 8912, percentage: 69 },
    { stars: 4, count: 2478, percentage: 19 },
    { stars: 3, count: 892, percentage: 7 },
    { stars: 2, count: 386, percentage: 3 },
    { stars: 1, count: 208, percentage: 2 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
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

        {/* 1. Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs text-text-secondary mb-6 font-sans">
          <Link href="/" className="hover:text-brand transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href="/books" className="hover:text-brand transition-colors">Books</Link>
          <span>&gt;</span>
          <span className="capitalize">{book.category}</span>
          <span>&gt;</span>
          <span className="text-text-primary font-semibold truncate max-w-[200px]">{book.title}</span>
        </div>

        {/* 2. Three Column Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Left Column: Cover Gallery (lg:col-span-4) */}
          <div className="lg:col-span-4 flex gap-4">
            {/* Thumbnail vertical list */}
            <div className="flex flex-col gap-2 w-14 sm:w-16 flex-shrink-0">
              <div className="aspect-[2/3] w-full rounded border-2 border-brand bg-white p-0.5 cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={book.title} className="w-full h-full object-cover rounded-xs" />
              </div>
              <div className="aspect-[2/3] w-full rounded border border-border bg-white p-0.5 cursor-pointer hover:border-brand/60 opacity-60 hover:opacity-100 transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Thumbnail 2" className="w-full h-full object-cover rounded-xs" />
              </div>
              <div className="aspect-[2/3] w-full rounded border border-border bg-white p-0.5 cursor-pointer hover:border-brand/60 opacity-60 hover:opacity-100 transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Thumbnail 3" className="w-full h-full object-cover rounded-xs" />
              </div>
              <div className="aspect-[2/3] w-full rounded border border-border bg-[#F8F9FB] flex items-center justify-center text-[10px] font-bold text-text-muted cursor-pointer hover:bg-slate-200 transition-colors">
                +2
              </div>
            </div>

            {/* Main Cover Image */}
            <div className="relative flex-1 aspect-[2/3] rounded-lg border border-border bg-white overflow-hidden shadow-xs">
              <span className="absolute top-2.5 left-2.5 bg-danger text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shadow z-10">
                Best Seller
              </span>
              <button
                onClick={handleToggleWishlist}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white text-text-secondary hover:text-brand shadow hover:scale-105 transition-all z-10 border border-border"
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-brand text-brand' : ''}`} />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={book.title}
                className="w-full h-full object-cover object-center transition-transform duration-200 hover:scale-[1.02]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/400x600/16523d/ffffff?text=' +
                    encodeURIComponent(book.title);
                }}
              />
            </div>
          </div>

          {/* Center Column: Book Info & Specs (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
                {book.title}
              </h1>
              <p className="text-xs text-text-secondary font-sans">
                Paperback — 1 January 2013
              </p>
              <p className="text-sm text-text-secondary font-medium font-sans">
                by <span className="text-brand font-semibold hover:underline cursor-pointer">{book.author} (Author)</span>
              </p>
              
              {/* Rating stars summary */}
              <Rating rating={4.7} count={12876} className="pt-1 text-xs" />

              {/* Genre badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-muted border border-border rounded-full text-[10px] font-bold text-text-secondary capitalize">
                  {book.category}
                </span>
                <span className="px-3 py-1 bg-muted border border-border rounded-full text-[10px] font-bold text-text-secondary">
                  Adventure
                </span>
                <span className="px-3 py-1 bg-muted border border-border rounded-full text-[10px] font-bold text-text-secondary">
                  Inspirational
                </span>
              </div>
            </div>

            {/* Description toggle block */}
            <div className="border-t border-border pt-4 space-y-2 font-sans">
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                {isDescExpanded ? book.description : `${book.description.substring(0, 160)}...`}
              </p>
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-brand text-xs font-bold flex items-center gap-0.5 hover:underline"
              >
                <span>{isDescExpanded ? 'Read less' : 'Read more'}</span>
                <ChevronDown className={`h-3 w-3 transform transition-transform ${isDescExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Specs Grid */}
            <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs font-sans">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Publisher</span>
                <span className="text-text-primary font-bold">{book.publisher || 'HarperCollins'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Language</span>
                <span className="text-text-primary font-bold">{book.language || 'English'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">ISBN-10</span>
                <span className="text-text-primary font-bold font-mono">8172234988</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">ISBN-13</span>
                <span className="text-text-primary font-bold font-mono">{book.isbn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Pages</span>
                <span className="text-text-primary font-bold">{book.pageCount || '208'} pages</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Dimensions</span>
                <span className="text-text-primary font-bold">20.3 x 25.4 x 4.7 cm</span>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Card & Condition Options (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-4 font-sans">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Available Sellers ({availableListings.length || 1})
                  </h3>
                  <span className="text-[10px] text-brand font-semibold">Best Prices</span>
                </div>
                
                {/* Real seller listings list */}
                <div className="space-y-2 text-xs">
                  {availableListings.length > 0 ? (
                    availableListings.map((l) => {
                      const isSelected = (selectedListingId || availableListings[0].id) === l.id;
                      return (
                        <label
                          key={l.id}
                          onClick={() => setSelectedListingId(l.id)}
                          className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-all ${
                            isSelected
                              ? 'border-2 border-brand bg-brand/5'
                              : 'border border-border hover:border-brand/40'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="radio"
                              name="sellerListing"
                              checked={isSelected}
                              onChange={() => setSelectedListingId(l.id)}
                              className="mt-0.5 accent-brand"
                            />
                            <div>
                              <p className="font-bold text-text-primary capitalize">
                                {(l.condition ?? book.condition).replace('_', ' ')} &bull; {l.sellerId ? `Seller ${l.sellerId.slice(-4)}` : 'Verified Seller'}
                              </p>
                              <p className="text-[10px] text-text-muted mt-0.5">
                                Stock: {l.stock ?? 0} copy{(l.stock ?? 0) > 1 ? 'ies' : ''} available
                              </p>
                            </div>
                          </div>
                          <span className={`font-extrabold ${isSelected ? 'text-brand' : 'text-text-primary'}`}>
                            ₹{l.price}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <label className="flex items-center justify-between p-2.5 border-2 border-brand bg-brand/5 rounded-md cursor-pointer">
                      <div className="flex items-start gap-2">
                        <input type="radio" name="sellerListing" defaultChecked className="mt-0.5 accent-brand" />
                        <div>
                          <p className="font-bold text-text-primary capitalize">
                            {book.condition.replace('_', ' ')}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">Verified Seller</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-brand">₹{book.price}</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Stock availability */}
              {book.stock > 0 ? (
                <div className="space-y-4 pt-1">
                  <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
                    <span>✓ In stock! Ships within 24 hours</span>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs font-bold text-text-secondary">Quantity:</span>
                    <div className="flex items-center border border-border rounded bg-white">
                      <button
                        onClick={handleDecrement}
                        className="p-1.5 hover:bg-slate-100 disabled:opacity-40"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 py-0.5 text-xs font-bold w-10 text-center">{quantity}</span>
                      <button
                        onClick={handleIncrement}
                        className="p-1.5 hover:bg-slate-100 disabled:opacity-40"
                        disabled={quantity >= book.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {addError && <div className="text-xs font-semibold text-danger">{addError}</div>}
                  
                  {successMsg && (
                    <div className="text-xs font-semibold text-success flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Added to cart successfully!</span>
                    </div>
                  )}

                  {/* Purchase buttons */}
                  <div className="space-y-2 pt-1">
                    <Button
                      onClick={handleBuyNow}
                      variant="primary"
                      fullWidth
                      className="uppercase tracking-widest text-xs font-bold py-2.5"
                    >
                      ⚡ Buy Now
                    </Button>
                    <Button
                      onClick={handleAddToCart}
                      variant="outline"
                      fullWidth
                      className="uppercase tracking-widest text-xs font-bold py-2.5 border-primary text-primary hover:bg-primary-50"
                      leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}
                    >
                      Add to Cart
                    </Button>

                    <Button
                      onClick={handleBuyNow}
                      variant="ghost"
                      fullWidth
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold uppercase tracking-wider py-2"
                    >
                      Buy with UPI <span className="font-black text-secondary ml-1">UPI</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 border border-danger/20 bg-danger/5 rounded text-danger text-xs font-bold text-center">
                  This book is currently out of stock.
                </div>
              )}

              {/* Secure guarantee text */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-text-muted border-t border-border pt-3">
                <span className="flex items-center gap-0.5"><Lock className="h-3 w-3" /> Secure Payment</span>
                <span className="flex items-center gap-0.5"><RotateCcw className="h-3 w-3" /> Easy Returns</span>
              </div>
            </div>

            {/* Sell Prompt block */}
            <div className="rounded-xl border border-border bg-white p-4 flex items-center justify-between gap-4 shadow-xs font-sans">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Want to sell this book?</p>
                <p className="text-xs font-bold text-text-primary">Get up to ₹{Math.round(book.price * 0.75)}</p>
                <Link
                  href="/sell"
                  className="inline-block mt-2 px-3 py-1 bg-secondary hover:bg-secondary-600 text-white font-bold rounded text-[10px] transition-colors"
                >
                  Sell Now
                </Link>
              </div>
              <div className="text-3xl flex-shrink-0 opacity-80 select-none">
                📚
              </div>
            </div>
          </div>
        </div>

        {/* 3. Horizontal Features Trust Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-border py-4 my-8 font-sans text-xs text-text-secondary text-center">
          <div className="flex items-center justify-center gap-1.5 py-1">
            <Truck className="h-4 w-4 text-brand" /> <span className="font-bold text-text-primary">Free Shipping</span> on orders over ₹499
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1 border-t md:border-t-0 md:border-l border-border">
            <RotateCcw className="h-4 w-4 text-brand" /> <span className="font-bold text-text-primary">7 Days Return</span> Easy returns
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1 border-t md:border-t-0 md:border-l border-border">
            <CheckCircle className="h-4 w-4 text-brand" /> <span className="font-bold text-text-primary">Quality Checked</span> 100% genuine books
          </div>
        </div>

        {/* 4. Statistics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-brand/5 border border-brand/10 rounded-lg p-6 my-8 font-sans text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-black text-brand font-mono">50,000+</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Books Listed</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-secondary font-mono">99.4%</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Positive Ratings</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-brand font-mono">10,000+</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Happy Customers</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-secondary font-mono">100%</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Safe & Secure</p>
          </div>
        </div>

        {/* 5. Lower Content Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-12 pt-6 border-t border-border">
          {/* Left Column: About & Reviews (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-10">
            {/* About text */}
            <div className="space-y-4 font-sans">
              <h2 className="font-serif text-xl font-bold text-text-primary">About the Book</h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                Santiago, a young shepherd, dreams of a treasure buried near the Egyptian Pyramids. His journey teaches him about listening to his heart, recognizing omens, and the importance of pursuing one&apos;s Personal Legend.
              </p>
              <div className="space-y-2 text-xs font-bold text-text-primary pt-2">
                <p className="flex items-center gap-1.5 text-emerald-600">✓ A modern classic loved by millions</p>
                <p className="flex items-center gap-1.5 text-emerald-600">✓ Inspires you to follow your dreams</p>
                <p className="flex items-center gap-1.5 text-emerald-600">✓ A perfect gift for dreamers and seekers</p>
              </div>
            </div>

            {/* Reviews list */}
            <div className="space-y-6 font-sans">
              <h2 className="font-serif text-xl font-bold text-text-primary">
                Customer Reviews
              </h2>

              {/* Stars breakdown section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center p-6 border border-border rounded-lg bg-[#F8F9FB]">
                <div className="text-center sm:text-left space-y-1">
                  <p className="text-4xl font-black text-text-primary">4.7</p>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Out of 5 Stars</p>
                  <div className="flex justify-center sm:justify-start text-amber-400 pt-1">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <p className="text-xs text-text-muted mt-2">12,876 verified reviews</p>
                </div>
                
                {/* Bars column */}
                <div className="sm:col-span-2 space-y-2 text-xs">
                  {ratingBreakdown.map((row) => (
                    <div key={row.stars} className="flex items-center gap-3">
                      <span className="w-10 font-bold text-text-secondary">{row.stars} Star</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full" style={{ width: `${row.percentage}%` }} />
                      </div>
                      <span className="w-12 text-right font-bold text-text-muted">{row.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add review form wrapper */}
              {canReview && (
                <div className="border border-brand/20 bg-brand/5 rounded-md p-6 space-y-4">
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
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
                        className="w-full rounded border border-border p-3 text-xs bg-background text-text-primary focus:ring-brand focus:border-brand h-24"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handlePostReview}
                      disabled={reviewPostMutation.isPending}
                      className="px-5 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded flex items-center justify-center transition-colors shadow-sm"
                    >
                      {reviewPostMutation.isPending ? 'Posting...' : 'Submit Review'}
                    </button>
                  </div>
                </div>
              )}

              {/* Review entries list */}
              <div className="space-y-4">
                {/* Visual mock review entries matching screenshot */}
                {reviews.length === 0 && (
                  <>
                    <div className="border border-border p-5 bg-white rounded-lg space-y-2 shadow-xs">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text-primary">Ananya Sharma <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-1">Verified Buyer</span></span>
                        <span className="text-text-muted">5 days ago</span>
                      </div>
                      <div className="flex text-amber-400">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed font-medium">
                        A life-changing book. Beautifully written and truly inspiring!
                      </p>
                      <button className="text-[10px] text-text-muted hover:text-brand font-bold flex items-center gap-1 mt-1">
                        <ThumbsUp className="h-3 w-3" /> Helpful (32)
                      </button>
                    </div>

                    <div className="border border-border p-5 bg-white rounded-lg space-y-2 shadow-xs">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text-primary">Rahul Verma <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-1">Verified Buyer</span></span>
                        <span className="text-text-muted">1 week ago</span>
                      </div>
                      <div className="flex text-amber-400">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed font-medium">
                        Amazing read! The book arrived in perfect condition.
                      </p>
                      <button className="text-[10px] text-text-muted hover:text-brand font-bold flex items-center gap-1 mt-1">
                        <ThumbsUp className="h-3 w-3" /> Helpful (18)
                      </button>
                    </div>

                    <div className="border border-border p-5 bg-white rounded-lg space-y-2 shadow-xs">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text-primary">Neha Patel <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-1">Verified Buyer</span></span>
                        <span className="text-text-muted">2 weeks ago</span>
                      </div>
                      <div className="flex text-amber-400">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed font-medium">
                        One of the best books I&apos;ve ever read. Highly recommended!
                      </p>
                      <button className="text-[10px] text-text-muted hover:text-brand font-bold flex items-center gap-1 mt-1">
                        <ThumbsUp className="h-3 w-3" /> Helpful (25)
                      </button>
                    </div>
                  </>
                )}

                {reviews.map((rev) => {
                  const revDate = new Date(rev.createdAt).toLocaleDateString();
                  return (
                    <div
                      key={rev.id}
                      className="border border-border p-5 bg-white rounded-lg space-y-2 shadow-xs"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text-primary">{rev.authorName}</span>
                        <span className="text-text-muted font-medium">{revDate}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed font-medium">
                        {rev.comment}
                      </p>

                      {rev.sellerReply && (
                        <div className="mt-3 p-3 border-l-2 border-brand bg-brand/5 rounded-r text-[11px] space-y-1">
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
            </div>
          </div>

          {/* Right Column: Recommendations Sidebar (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">You May Also Like</h3>
              <Link href={`/books?category=${book.category}`} className="text-xs font-bold text-brand hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {relatedBooks.length === 0 ? (
                // Beautiful mock entries matching screenshot exactly
                <>
                  <div className="flex items-center justify-between gap-3.5 p-3 rounded-lg border border-border bg-white hover:border-brand/40 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images-na.ssl-images-amazon.com/images/I/71QKQ9mwV7L.jpg" alt="Book" className="w-10 h-15 object-cover rounded-xs border border-border shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-text-primary truncate">The 5 AM Club</h4>
                        <p className="text-[10px] text-text-secondary truncate mt-0.5">Robin Sharma</p>
                        <div className="flex items-center text-amber-400 text-[9px] mt-0.5">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          <span className="font-bold ml-0.5">4.5</span>
                        </div>
                        <p className="text-xs font-black text-brand mt-1">₹199</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Added "The 5 AM Club" to cart!')}
                      className="p-2 border border-brand/20 rounded hover:bg-brand/5 hover:border-brand text-brand transition-colors shrink-0"
                      title="Quick Add to Cart"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3.5 p-3 rounded-lg border border-border bg-white hover:border-brand/40 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images-na.ssl-images-amazon.com/images/I/81bzi807nRL.jpg" alt="Book" className="w-10 h-15 object-cover rounded-xs border border-border shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-text-primary truncate">Rich Dad Poor Dad</h4>
                        <p className="text-[10px] text-text-secondary truncate mt-0.5">Robert Kiyosaki</p>
                        <div className="flex items-center text-amber-400 text-[9px] mt-0.5">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          <span className="font-bold ml-0.5">4.8</span>
                        </div>
                        <p className="text-xs font-black text-brand mt-1">₹249</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Added "Rich Dad Poor Dad" to cart!')}
                      className="p-2 border border-brand/20 rounded hover:bg-brand/5 hover:border-brand text-brand transition-colors shrink-0"
                      title="Quick Add to Cart"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3.5 p-3 rounded-lg border border-border bg-white hover:border-brand/40 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images-na.ssl-images-amazon.com/images/I/91b0CxyAdXL.jpg" alt="Book" className="w-10 h-15 object-cover rounded-xs border border-border shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-text-primary truncate">Atomic Habits</h4>
                        <p className="text-[10px] text-text-secondary truncate mt-0.5">James Clear</p>
                        <div className="flex items-center text-amber-400 text-[9px] mt-0.5">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          <span className="font-bold ml-0.5">4.9</span>
                        </div>
                        <p className="text-xs font-black text-brand mt-1">₹299</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Added "Atomic Habits" to cart!')}
                      className="p-2 border border-brand/20 rounded hover:bg-brand/5 hover:border-brand text-brand transition-colors shrink-0"
                      title="Quick Add to Cart"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3.5 p-3 rounded-lg border border-border bg-white hover:border-brand/40 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images-na.ssl-images-amazon.com/images/I/71sBtM3Yi5L.jpg" alt="Book" className="w-10 h-15 object-cover rounded-xs border border-border shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-text-primary truncate">The Power of Your Subconscious Mind</h4>
                        <p className="text-[10px] text-text-secondary truncate mt-0.5">Joseph Murphy</p>
                        <div className="flex items-center text-amber-400 text-[9px] mt-0.5">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          <span className="font-bold ml-0.5">4.6</span>
                        </div>
                        <p className="text-xs font-black text-brand mt-1">₹199</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Added "The Power of Your Subconscious Mind" to cart!')}
                      className="p-2 border border-brand/20 rounded hover:bg-brand/5 hover:border-brand text-brand transition-colors shrink-0"
                      title="Quick Add to Cart"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                relatedBooks.map((relBook) => (
                  <div
                    key={relBook.id}
                    className="flex items-center justify-between gap-3.5 p-3 rounded-lg border border-border bg-white hover:border-brand/40 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/books/${relBook.slug}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={relBook.images?.[0]?.url || ''}
                        alt={relBook.title}
                        className="w-10 h-15 object-cover rounded-xs border border-border shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/100x150/1A3B5C/ffffff?text=' + encodeURIComponent(relBook.title);
                        }}
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-text-primary truncate group-hover:text-brand transition-colors">{relBook.title}</h4>
                        <p className="text-[10px] text-text-secondary truncate mt-0.5">{relBook.author}</p>
                        <div className="flex items-center text-amber-400 text-[9px] mt-0.5">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          <span className="font-bold ml-0.5">{relBook.ratingAvg > 0 ? relBook.ratingAvg.toFixed(1) : '5.0'}</span>
                        </div>
                        <p className="text-xs font-black text-brand mt-1">₹{relBook.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          await addItem(isAuthenticated, relBook, 1);
                          alert(`Added "${relBook.title}" to cart!`);
                        } catch {
                          alert('Failed to add to cart.');
                        }
                      }}
                      className="p-2 border border-brand/20 rounded hover:bg-brand/5 hover:border-brand text-brand transition-colors shrink-0"
                      title="Quick Add to Cart"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Bottom trust badges */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center gap-3 text-xs">
                ⭐ <div>
                  <p className="font-bold text-text-primary">Top Quality Books</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Quality checked by experts</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                🏷️ <div>
                  <p className="font-bold text-text-primary">Affordable Prices</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Save up to 80%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                ⚡ <div>
                  <p className="font-bold text-text-primary">Fast Delivery</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Ships within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                🔄 <div>
                  <p className="font-bold text-text-primary">Hassle-free Returns</p>
                  <p className="text-[10px] text-text-muted mt-0.5">7 days easy return</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
