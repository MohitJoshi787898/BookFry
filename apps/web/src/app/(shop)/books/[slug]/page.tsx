'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { Book, Review, Order, Wishlist } from '@bookmarket/types';
import { SellerOffersList, SellerOffer } from '@/components/shared/seller-offers-list';
import { BookCarousel } from '@/components/marketing/book-carousel';
import { BookJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';
import Link from 'next/link';
import {
  Star, ShoppingBag, Plus, Minus, ArrowLeft, CheckCircle,
  ShieldAlert, Heart, ThumbsUp, ChevronDown, Lock, RotateCcw,
  Truck, Sparkles, ChevronRight, BookOpen, BadgeCheck, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/ui/marketplace';

interface ListingOption {
  id: string;
  price?: number;
  stock?: number;
  condition?: Book['condition'];
  sellerId?: string;
}

type BookWithListings = Book & { listings?: ListingOption[] };

const CONDITION_MAP: Record<string, { label: string; color: string }> = {
  like_new: { label: 'Like New', color: 'bg-success/10 text-success border-success/30' },
  good: { label: 'Good', color: 'bg-info/10 text-info border-info/30' },
  fair: { label: 'Fair', color: 'bg-warning/10 text-warning border-warning/30' },
  acceptable: { label: 'Acceptable', color: 'bg-secondary/10 text-secondary border-secondary/30' },
};

// ──────────────────────────────────────────────────────────────────────────────
// Loading Skeleton
// ──────────────────────────────────────────────────────────────────────────────
function BookDetailSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 animate-pulse space-y-8">
        <div className="h-4 w-48 bg-muted rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 aspect-[2/3] bg-card border border-border rounded-3xl" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-8 w-3/4 bg-card border border-border rounded-2xl" />
            <div className="h-4 w-1/2 bg-card border border-border rounded-full" />
            <div className="h-20 w-full bg-card border border-border rounded-2xl" />
          </div>
          <div className="lg:col-span-3">
            <div className="h-80 w-full bg-card border border-border rounded-3xl" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Review Card
// ──────────────────────────────────────────────────────────────────────────────
function ReviewCard({ name, date, rating, comment, helpful, verified = true }: {
  name: string; date: string; rating: number; comment: string; helpful: number; verified?: boolean;
}) {
  return (
    <div className="p-5 rounded-2xl border border-border bg-card space-y-3 hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-extrabold text-primary">
            {name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-text-primary">{name}</span>
              {verified && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-success/10 border border-success/20 rounded-full text-[9px] font-extrabold text-success">
                  <BadgeCheck className="h-2.5 w-2.5" /> Verified
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-muted font-medium mt-0.5">{date}</p>
          </div>
        </div>
        <div className="flex gap-0.5 shrink-0">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`h-3 w-3 ${s <= rating ? 'fill-accent text-accent' : 'text-border'}`} />
          ))}
        </div>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed font-medium">{comment}</p>
      <button className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary font-bold transition-colors">
        <ThumbsUp className="h-3 w-3" /> Helpful ({helpful})
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────
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
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const { data: book, isLoading, isError } = useQuery<Book>({
    queryKey: ['book', slug],
    queryFn: () => apiClient(`/books/${slug}`),
    enabled: !!slug,
  });

  React.useEffect(() => {
    if (book?.id) {
      apiClient('/events/view', {
        method: 'POST',
        body: JSON.stringify({ bookId: book.id, categoryId: book.category }),
      }).catch(() => {});
    }
  }, [book?.id, book?.category]);

  const { data: recData } = useQuery<{ frequentlyBoughtTogether: Book[]; similarCategory: Book[] }>({
    queryKey: ['bookRecommendations', book?.id],
    queryFn: () => apiClient(`/recommendations/${book?.id}`),
    enabled: !!book?.id,
  });

  const { data: wishlistData } = useQuery<{ wishlist: Wishlist; books: Book[] }>({
    queryKey: ['wishlist'],
    queryFn: () => apiClient('/wishlist'),
    enabled: isAuthenticated,
  });

  const isWishlisted = wishlistData?.wishlist.bookIds.includes(book?.id || '') || false;

  const toggleWishlistMutation = useMutation({
    mutationFn: (bookId: string) =>
      apiClient(`/wishlist/${bookId}`, { method: isWishlisted ? 'DELETE' : 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

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

  const hasReviewed = reviews.some((rev) => rev.authorId === user?.id && rev.orderId === eligibleOrder?.id);
  const canReview = isAuthenticated && !!eligibleOrder && !hasReviewed;

  const reviewPostMutation = useMutation({
    mutationFn: (data: { bookId: string; orderId: string; rating: number; comment: string }) =>
      apiClient('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      setReviewComment(''); setReviewRating(5); setReviewError(null);
      refetchReviews();
      queryClient.invalidateQueries({ queryKey: ['book', slug] });
    },
    onError: (err: { message?: string }) => setReviewError(err.message || 'Failed to submit review.'),
  });

  const handlePostReview = () => {
    if (!book || !eligibleOrder) return;
    if (reviewComment.trim().length < 10) { setReviewError('Review must be at least 10 characters.'); return; }
    reviewPostMutation.mutate({ bookId: book.id, orderId: eligibleOrder.id, rating: reviewRating, comment: reviewComment });
  };

  const availableListings: ListingOption[] = (book as BookWithListings | null)?.listings ?? [];
  const activeListing = availableListings.find((l) => l.id === selectedListingId) || availableListings[0];

  const targetBookForCart: Book | null = book ? {
    ...book,
    id: activeListing?.id || book.id,
    price: activeListing?.price ?? book.price,
    stock: activeListing?.stock ?? book.stock,
    condition: activeListing?.condition ?? book.condition,
    sellerId: activeListing?.sellerId ?? book.sellerId,
  } : null;

  const handleAddToCart = async () => {
    if (!targetBookForCart) return;
    setAddError(null); setSuccessMsg(false);
    try {
      await addItem(isAuthenticated, targetBookForCart, quantity);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3500);
    } catch (err) {
      setAddError((err as Error).message || 'Failed to add item to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!targetBookForCart) return;
    try {
      await addItem(isAuthenticated, targetBookForCart, quantity);
      router.push('/cart');
    } catch (err) {
      setAddError((err as Error).message || 'Failed to initiate buy now');
    }
  };

  const ratingBreakdown = [
    { stars: 5, count: 8912, percentage: 69 },
    { stars: 4, count: 2478, percentage: 19 },
    { stars: 3, count: 892, percentage: 7 },
    { stars: 2, count: 386, percentage: 3 },
    { stars: 1, count: 208, percentage: 2 },
  ];

  if (isLoading) return <BookDetailSkeleton />;

  if (isError || !book) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-danger/10 border border-danger/20 flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-danger" />
            </div>
            <h2 className="font-serif text-2xl font-extrabold text-text-primary">Book Not Found</h2>
            <p className="text-sm text-text-secondary font-medium">
              This listing may have been sold, removed, or has expired.
            </p>
            <Link href="/books" className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-extrabold rounded-2xl text-sm hover:bg-secondary/90 transition-all active:scale-95">
              <ArrowLeft className="h-4 w-4" /> Browse Books
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl = book.images?.[0]?.url || '';
  const allImages = book.images?.length > 0 ? book.images : [{ url: imageUrl }, { url: imageUrl }, { url: imageUrl }];
  const activeImage = allImages[activeImageIdx]?.url || imageUrl;
  const conditionInfo = CONDITION_MAP[book.condition] || { label: book.condition, color: 'bg-muted text-text-secondary border-border' };
  const bookAny = book as Book & { originalPrice?: number };
  const discountPct = bookAny.originalPrice ? Math.round((1 - book.price / bookAny.originalPrice) * 100) : null;

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Navbar />

      <main className="flex-grow w-full">
        <BookJsonLd book={book} url={`https://bookfry.in/books/${book.slug}`} />
        <BreadcrumbJsonLd items={[
          { name: 'Home', item: 'https://bookfry.in' },
          { name: 'Books', item: 'https://bookfry.in/books' },
          { name: book.title, item: `https://bookfry.in/books/${book.slug}` },
        ]} />

        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6 space-y-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-medium text-text-muted">
            <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/books" className="hover:text-text-primary transition-colors">Books</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-text-primary font-semibold capitalize truncate max-w-[240px]">{book.title}</span>
          </nav>

          {/* ── 3-Column Product Layout ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* ── Column 1: Image Gallery ──────────────────────────── */}
            <div className="lg:col-span-4 flex gap-3">
              {/* Thumbnail Strip */}
              <div className="flex flex-col gap-2 w-14 sm:w-16 shrink-0">
                {allImages.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`aspect-[2/3] w-full rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIdx === idx ? 'border-secondary shadow-md' : 'border-border opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="relative flex-1 aspect-[2/3] rounded-3xl overflow-hidden border border-border bg-card shadow-lg group">
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                  <span className="px-2.5 py-1 bg-danger text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-xs">
                    Best Seller
                  </span>
                  {discountPct && (
                    <span className="px-2.5 py-1 bg-success text-success-foreground text-xs font-bold rounded-full shadow-xs">
                      -{discountPct}% OFF
                    </span>
                  )}
                </div>

                {/* Wishlist */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => toggleWishlistMutation.mutate(book.id)}
                  className={`absolute top-3 right-3 z-10 h-10 w-10 rounded-full border flex items-center justify-center shadow-md transition-all ${
                    isWishlisted
                      ? 'bg-danger/10 border-danger/30 text-danger'
                      : 'bg-card/90 border-border text-text-muted hover:text-danger hover:border-danger/30'
                  }`}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-danger' : ''}`} />
                </motion.button>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage}
                  alt={book.title}
                  className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/400x600/1A3B5C/ffffff?text=${encodeURIComponent(book.title)}`;
                  }}
                />
              </div>
            </div>

            {/* ── Column 2: Book Info ──────────────────────────────── */}
            <div className="lg:col-span-5 space-y-6">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 border rounded-full text-xs font-semibold capitalize ${conditionInfo.color}`}>
                    {conditionInfo.label}
                  </span>
                  <span className="px-3 py-1 bg-muted border border-border rounded-full text-xs font-semibold text-text-secondary capitalize">
                    {book.category}
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight tracking-tight">
                  {book.title}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <p className="text-sm text-text-secondary font-medium">
                    by <span className="text-primary dark:text-primary font-extrabold hover:underline cursor-pointer">{book.author}</span>
                  </p>
                  <span className="hidden sm:block text-border">·</span>
                  <p className="text-xs text-text-muted font-medium">Paperback</p>
                </div>

                <Rating rating={4.7} count={12876} className="text-xs" />
              </div>

              {/* Price Block */}
              <div className="flex items-baseline gap-3 pb-4 border-b border-border/60">
                <span className="font-serif text-4xl font-extrabold text-text-primary tracking-tight">
                  ₹{activeListing?.price ?? book.price}
                </span>
                {bookAny.originalPrice && (
                  <>
                    <span className="text-sm text-text-muted line-through font-medium">₹{bookAny.originalPrice}</span>
                    <span className="px-2 py-0.5 bg-success/10 border border-success/20 text-success text-xs font-extrabold rounded-full">
                      Save ₹{bookAny.originalPrice - book.price}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">About this Book</h2>
                <p className="text-sm text-text-secondary leading-relaxed font-medium">
                  {isDescExpanded ? book.description : `${book.description?.substring(0, 200)}...`}
                </p>
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="inline-flex items-center gap-1 text-secondary text-xs font-extrabold hover:underline"
                >
                  {isDescExpanded ? 'Read less' : 'Read more'}
                  <ChevronDown className={`h-3 w-3 transition-transform ${isDescExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-0 border border-border rounded-2xl overflow-hidden">
                {[
                  { label: 'Publisher', value: book.publisher || 'HarperCollins' },
                  { label: 'Language', value: book.language || 'English' },
                  { label: 'ISBN', value: book.isbn || '—' },
                  { label: 'Pages', value: `${book.pageCount || 208}` },
                ].map(({ label, value }, idx) => (
                  <div key={label} className={`px-4 py-3 ${idx % 2 === 0 ? 'border-r' : ''} ${idx < 2 ? 'border-b' : ''} border-border`}>
                    <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">{label}</p>
                    <p className="text-xs font-extrabold text-text-primary mt-0.5 truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Trust Strip */}
              <div className="flex flex-wrap gap-3 text-[11px] font-bold text-text-secondary">
                <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-primary" /> Free Shipping ₹499+</span>
                <span className="flex items-center gap-1"><RotateCcw className="h-3.5 w-3.5 text-primary" /> 7 Day Returns</span>
                <span className="flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5 text-success" /> Quality Verified</span>
              </div>
            </div>

            {/* ── Column 3: Purchase Card ──────────────────────────── */}
            <div className="lg:col-span-3 space-y-4">
              {/* Checkout Card */}
              <div className="rounded-3xl border border-border bg-card shadow-lg overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 bg-primary border-b border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-secondary">Available Sellers</span>
                    <span className="text-xs text-primary-foreground/60 font-medium">{availableListings.length || 1} offer{availableListings.length !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-2xl font-extrabold text-primary-foreground mt-1 font-serif tracking-tight">
                    ₹{activeListing?.price ?? book.price}
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  {/* Seller Listings */}
                  <div className="space-y-2">
                    {availableListings.length > 0 ? availableListings.map((l) => {
                      const isSelected = (selectedListingId || availableListings[0]?.id) === l.id;
                      const cInfo = CONDITION_MAP[l.condition ?? ''] || { label: 'Good', color: 'bg-muted text-text-secondary border-border' };
                      return (
                        <button
                          key={l.id}
                          onClick={() => setSelectedListingId(l.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                            isSelected ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/20' : 'border-border hover:border-border/80'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${cInfo.color}`}>
                              {cInfo.label}
                            </span>
                            <p className="text-[11px] text-text-muted font-medium">
                              Stock: {l.stock ?? 0} left
                            </p>
                          </div>
                          <span className={`font-extrabold text-sm ${isSelected ? 'text-secondary' : 'text-text-primary'}`}>
                            ₹{l.price}
                          </span>
                        </button>
                      );
                    }) : (
                      <div className="p-3 rounded-xl border border-secondary/30 bg-secondary/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${conditionInfo.color}`}>
                              {conditionInfo.label}
                            </span>
                            <p className="text-[11px] text-text-muted font-medium mt-0.5">Verified Seller</p>
                          </div>
                          <span className="font-extrabold text-secondary">₹{book.price}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stock Status */}
                  {book.stock > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-success text-xs font-extrabold">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>In Stock · Ships within 24h</span>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-text-secondary">Quantity</span>
                        <div className="flex items-center border border-border rounded-xl overflow-hidden bg-background">
                          <button
                            onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
                            disabled={quantity <= 1}
                            className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-extrabold text-text-primary">{quantity}</span>
                          <button
                            onClick={() => quantity < book.stock && setQuantity((q) => q + 1)}
                            disabled={quantity >= book.stock}
                            className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Feedback messages */}
                      <AnimatePresence>
                        {addError && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs font-semibold text-danger">
                            {addError}
                          </motion.p>
                        )}
                        {successMsg && (
                          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-xs font-extrabold text-success">
                            <CheckCircle className="h-3.5 w-3.5" /> Added to cart!
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Purchase Buttons */}
                      <div className="space-y-2.5">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={handleBuyNow}
                          className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold rounded-2xl text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <Zap className="h-4 w-4" /> Buy Now
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={handleAddToCart}
                          className="w-full h-12 border border-primary text-primary font-extrabold rounded-2xl text-sm transition-all hover:bg-primary/5 flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="h-4 w-4" /> Add to Cart
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={handleBuyNow}
                          className="w-full h-11 bg-card border border-border hover:bg-muted text-text-primary font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                        >
                          Pay with <span className="text-secondary font-black">UPI</span>
                        </motion.button>
                      </div>

                      {/* Secure Badge */}
                      <div className="flex items-center justify-center gap-4 pt-1 text-[10px] text-text-muted border-t border-border font-bold">
                        <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Secure Payment</span>
                        <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Easy Returns</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-danger/20 bg-danger/5 rounded-2xl text-danger text-xs font-extrabold text-center">
                      Out of Stock · Join Waitlist
                    </div>
                  )}
                </div>
              </div>

              {/* Sell This Book Prompt */}
              <div className="rounded-3xl border border-border bg-primary overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary block">Own this book?</span>
                    <p className="text-sm font-extrabold text-primary-foreground">
                      Sell it for up to ₹{Math.round(book.price * 0.75)}
                    </p>
                    <Link
                      href="/sell"
                      className="inline-flex items-center gap-1 mt-2 px-4 py-1.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold rounded-xl text-xs transition-all active:scale-95"
                    >
                      Sell Now <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <BookOpen className="h-12 w-12 text-primary-foreground/20 shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Multi-Seller Comparison ─────────────────────────────── */}
          <div className="border-t border-border pt-8">
            <SellerOffersList catalogBook={book} offers={(book as BookWithListings).listings as unknown as SellerOffer[] || []} />
          </div>

          {/* ── Stats Banner ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { val: '50,000+', label: 'Books Listed', color: 'text-primary' },
              { val: '99.4%', label: 'Positive Ratings', color: 'text-secondary' },
              { val: '10,000+', label: 'Happy Students', color: 'text-primary' },
              { val: '100%', label: 'Safe & Secure', color: 'text-secondary' },
            ].map(({ val, label, color }) => (
              <div key={label} className="rounded-2xl border border-border bg-card px-5 py-5 text-center">
                <p className={`text-2xl sm:text-3xl font-extrabold font-mono ${color}`}>{val}</p>
                <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* ── Reviews + Related ────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-border">

            {/* ── Reviews Section ──────────────────────────────────── */}
            <div className="lg:col-span-8 space-y-8">
              <h2 className="font-serif text-2xl font-extrabold text-text-primary">Customer Reviews</h2>

              {/* Rating Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center p-6 rounded-3xl border border-border bg-card">
                <div className="text-center sm:text-left space-y-2">
                  <p className="text-5xl font-extrabold text-text-primary font-serif">4.7</p>
                  <div className="flex gap-0.5 justify-center sm:justify-start">
                    {[1,2,3,4,5].map((s) => <Star key={s} className="h-4 w-4 fill-accent text-accent" />)}
                  </div>
                  <p className="text-xs text-text-muted font-bold">12,876 verified reviews</p>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  {ratingBreakdown.map((row) => (
                    <div key={row.stars} className="flex items-center gap-3 text-xs">
                      <span className="w-10 font-bold text-text-muted text-right shrink-0">{row.stars} ★</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${row.percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full bg-accent rounded-full"
                        />
                      </div>
                      <span className="w-12 text-right font-bold text-text-muted shrink-0">{row.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write Review Form */}
              {canReview && (
                <div className="p-6 rounded-3xl border border-primary/20 bg-primary/5 space-y-4">
                  <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-secondary" /> Write a Review
                  </h3>
                  {reviewError && (
                    <p className="text-xs font-semibold text-danger p-3 bg-danger/5 border border-danger/20 rounded-xl">{reviewError}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-text-secondary uppercase">Rating:</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)} className="group">
                          <Star className={`h-6 w-6 transition-all group-hover:scale-110 ${star <= reviewRating ? 'fill-accent text-accent' : 'text-border hover:text-accent/50'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts about this book (minimum 10 characters)..."
                    className="w-full h-24 px-4 py-3 rounded-2xl border border-border bg-background text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                  />
                  <Button
                    onClick={handlePostReview}
                    disabled={reviewPostMutation.isPending}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6"
                  >
                    {reviewPostMutation.isPending ? 'Posting...' : 'Submit Review'}
                  </Button>
                </div>
              )}

              {/* Review List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <>
                    <ReviewCard name="Ananya Sharma" date="5 days ago" rating={5} comment="A life-changing book. Beautifully written and truly inspiring! The condition was exactly as described." helpful={32} />
                    <ReviewCard name="Rahul Verma" date="1 week ago" rating={5} comment="Amazing read! The book arrived in perfect condition. Super fast delivery from BookFry. Will buy again!" helpful={18} />
                    <ReviewCard name="Neha Patel" date="2 weeks ago" rating={4} comment="One of the best books I've ever read. Highly recommended for any student. Saved a lot compared to MRP." helpful={25} />
                  </>
                ) : reviews.map((rev) => (
                  <div key={rev.id} className="p-5 rounded-2xl border border-border bg-card space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-extrabold text-text-primary">{rev.authorName}</span>
                        <p className="text-[11px] text-text-muted font-medium">{new Date(rev.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= rev.rating ? 'fill-accent text-accent' : 'text-border'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed font-medium">{rev.comment}</p>
                    {rev.sellerReply && (
                      <div className="mt-2 p-3 border-l-2 border-primary bg-primary/5 rounded-r-xl text-[11px] space-y-1">
                        <span className="font-extrabold text-primary block uppercase tracking-wider text-[10px]">Seller Response</span>
                        <p className="text-text-secondary leading-relaxed">{rev.sellerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Related Books Sidebar ───────────────────────────── */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-extrabold text-text-primary">You May Also Like</h3>
                <Link href={`/books?category=${book.category}`} className="text-xs font-extrabold text-secondary hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {(relatedBooks.length > 0 ? relatedBooks : [
                  { id: 'mock1', title: 'The 5 AM Club', author: 'Robin Sharma', price: 199, ratingAvg: 4.5, slug: 'the-5-am-club', images: [] },
                  { id: 'mock2', title: 'Atomic Habits', author: 'James Clear', price: 299, ratingAvg: 4.9, slug: 'atomic-habits', images: [] },
                  { id: 'mock3', title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', price: 249, ratingAvg: 4.8, slug: 'rich-dad-poor-dad', images: [] },
                ] as unknown as Book[]).map((relBook) => (
                  <div
                    key={relBook.id}
                    onClick={() => router.push(`/books/${relBook.slug}`)}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-16 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={relBook.images?.[0]?.url || `https://placehold.co/100x150/1A3B5C/ffffff?text=${encodeURIComponent(relBook.title)}`}
                        alt={relBook.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/100x150/1A3B5C/ffffff?text=${encodeURIComponent(relBook.title)}`; }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-extrabold text-text-primary truncate group-hover:text-primary transition-colors">{relBook.title}</h4>
                      <p className="text-[11px] text-text-muted font-medium truncate mt-0.5">{relBook.author}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => <Star key={s} className={`h-2.5 w-2.5 ${s <= Math.round(relBook.ratingAvg) ? 'fill-accent text-accent' : 'text-border'}`} />)}
                        </div>
                        <span className="text-[10px] font-bold text-text-muted">{relBook.ratingAvg > 0 ? relBook.ratingAvg.toFixed(1) : '5.0'}</span>
                      </div>
                      <p className="text-sm font-extrabold text-primary dark:text-primary mt-1">₹{relBook.price}</p>
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try { await addItem(isAuthenticated, relBook, 1); } catch {}
                      }}
                      className="h-8 w-8 shrink-0 rounded-xl border border-border hover:border-secondary hover:bg-secondary/5 text-text-muted hover:text-secondary flex items-center justify-center transition-all"
                      aria-label="Quick add to cart"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Bottom Trust Items */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                {[
                  { icon: '⭐', title: 'Top Quality Books', sub: 'Expert quality checked' },
                  { icon: '🏷️', title: 'Affordable Prices', sub: 'Save up to 80% vs MRP' },
                  { icon: '⚡', title: 'Fast Delivery', sub: 'Ships within 24 hours' },
                  { icon: '🔄', title: 'Hassle-free Returns', sub: '7 days easy return policy' },
                ].map(({ icon, title, sub }) => (
                  <div key={title} className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{icon}</span>
                    <div>
                      <p className="text-xs font-extrabold text-text-primary">{title}</p>
                      <p className="text-[11px] text-text-muted font-medium mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Frequently Bought Together ──────────────────────── */}
          {recData?.frequentlyBoughtTogether && recData.frequentlyBoughtTogether.length > 0 && (
            <div className="border-t border-border pt-8">
              <BookCarousel
                eyebrow="Customers Also Bought"
                title="Frequently Bought Together"
                subtitle="Students who viewed this book also bought these items"
                customBooks={recData.frequentlyBoughtTogether}
              />
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
