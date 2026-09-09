'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { Book, Wishlist } from '@bookmarket/types';
import { SellerOffersList } from '@/components/shared/seller-offers-list';
import { BookCarousel } from '@/components/marketing/book-carousel';
import { BookJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { BookDetailGallery } from '@/components/shop/book-detail-gallery';
import { BookDetailInfo } from '@/components/shop/book-detail-info';
import { BookDetailBuyBox } from '@/components/shop/book-detail-buy-box';
import { BookDetailMobileStickyBar } from '@/components/shop/book-detail-mobile-sticky-bar';

function BookDetailSkeleton() {
  return (
    <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 animate-pulse space-y-8">
      <div className="h-4 w-48 bg-muted rounded-full" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 aspect-[3/4] bg-card border border-border rounded-3xl" />
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
  );
}

export default function BookDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { items, addItem } = useCartStore();

  const { data: book, isLoading, isError } = useQuery<Book>({
    queryKey: ['book', slug],
    queryFn: () => apiClient(`/books/${slug}`),
    enabled: Boolean(slug),
  });

  const { data: wishlistData } = useQuery<{ wishlist: Wishlist }>({
    queryKey: ['wishlist'],
    queryFn: () => apiClient('/wishlist'),
    enabled: isAuthenticated,
  });

  const isWishlisted = Boolean(
    book?.id && wishlistData?.wishlist?.bookIds?.includes(book.id)
  );

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (isWishlisted) {
        await apiClient(`/wishlist/items/${book?.id}`, { method: 'DELETE' });
      } else {
        await apiClient('/wishlist/items', {
          method: 'POST',
          body: JSON.stringify({ bookId: book?.id }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const { data: relatedData = { books: [] } } = useQuery<{ books: Book[] }>({
    queryKey: ['related-books', book?.category],
    queryFn: () => {
      const cat = typeof book?.category === 'object' && book?.category !== null
        ? (book.category as { id?: string }).id
        : book?.category;
      return apiClient(`/books?limit=8${cat ? `&category=${cat}` : ''}`);
    },
    enabled: Boolean(book),
  });

  if (isLoading) return <BookDetailSkeleton />;

  if (isError || !book) {
    return (
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12">
        <RoleEmptyState
          title="Book Not Found"
          description="The requested textbook listing might have been moved, sold out, or expired."
          mascotVariant="pointing"
          action={{ label: 'Explore Books', href: '/books' }}
        />
      </main>
    );
  }

  const cartItem = items.find((it) => it.bookId === book.id || it.bookId === (book as { _id?: string })._id);
  const inCartCount = cartItem ? cartItem.quantity : 0;
  const canonicalUrl = `/books/${book.slug || book.id}`;

  return (
    <>
      {/* SEO Schema Injection */}
      <BookJsonLd book={book} url={canonicalUrl} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: '/' },
          { name: 'Textbooks', item: '/books' },
          { name: book.title, item: canonicalUrl },
        ]}
      />

      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 space-y-10">
        {/* Back Link */}
        <Link
          href="/books"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>

        {/* 3-Column Detail Layout: Gallery (4 cols) - Info (5 cols) - Buy Box (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Column 1: Image Gallery & Cover Preview */}
          <div className="lg:col-span-4">
            <BookDetailGallery book={book} />
          </div>

          {/* Column 2: Details, Specifications, & Description */}
          <div className="lg:col-span-5">
            <BookDetailInfo book={book} />
          </div>

          {/* Column 3: Buy Box & Delivery Estimate */}
          <div className="lg:col-span-3">
            <BookDetailBuyBox
              book={book}
              isWishlisted={isWishlisted}
              onToggleWishlist={() => toggleWishlistMutation.mutate()}
            />
          </div>
        </div>

        {/* P2P Seller Offers Section */}
        <div className="pt-8 border-t border-border/80">
          <SellerOffersList catalogBook={book} offers={book.listings || []} />
        </div>

        {/* Related Books Carousel */}
        {relatedData.books.length > 0 && (
          <div className="pt-8 border-t border-border/80">
            <BookCarousel
              title="Related Syllabus Books &amp; Guides"
              subtitle="Frequently purchased alongside this textbook by college students."
              customBooks={relatedData.books.filter((b) => b.id !== book.id)}
            />
          </div>
        )}
      </main>

      {/* Mobile Sticky Buy Dock — fixed-positioned, no footer conflict */}
      <BookDetailMobileStickyBar
        book={book}
        inCartCount={inCartCount}
        onAddToCart={() => addItem(isAuthenticated, book, 1)}
        onBuyNow={async () => {
          await addItem(isAuthenticated, book, 1);
          router.push('/cart');
        }}
      />
    </>
  );
}

