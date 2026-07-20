'use client';

import React from 'react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { HeroSection } from '@/components/marketing/hero-section';
import { QuickFilterBar } from '@/components/marketing/quick-filter-bar';
import { BookCarousel } from '@/components/marketing/book-carousel';
import { SellYourBooksStrip } from '@/components/marketing/sell-your-books-strip';
import { CategoryGrid } from '@/components/marketing/category-grid';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { NewsletterSection } from '@/components/marketing/newsletter-section';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary transition-colors duration-200">
      {/* 1. Header Navigation */}
      <Navbar />

      <main className="flex-grow">
        {/* 2. Editorial Hero */}
        <HeroSection />

        {/* 3. Filter / Quick-Browse Bar */}
        <QuickFilterBar />

        {/* 4. Category-Wise Book Carousels (Each queries server independently) */}

        {/* Carousel 1: Now Trending */}
        <BookCarousel
          eyebrow="Curated Collection"
          title="Now Trending"
          subtitle="The most viewed and discussed titles this week"
          queryParam="sort=viewsCount&limit=12"
          href="/books?sort=viewsCount"
        />

        {/* Carousel 2: Best Sellers */}
        <BookCarousel
          eyebrow="Top Rated Literature"
          title="Best Sellers"
          subtitle="Highest-rated books based on verified buyer reviews"
          queryParam="sort=ratingAvg&limit=12"
          href="/books?sort=ratingAvg"
        />

        {/* Carousel 3: New Arrivals */}
        <BookCarousel
          eyebrow="Fresh Additions"
          title="New Arrivals"
          subtitle="Recently listed books from sellers across the platform"
          queryParam="sort=createdAt&limit=12"
          href="/books?sort=createdAt"
        />

        {/* Carousel 4: International Bestsellers */}
        <BookCarousel
          eyebrow="Global Fiction Hits"
          title="International Bestsellers"
          subtitle="Acclaimed books captivating readers worldwide"
          queryParam="category=fiction&limit=12"
          href="/books?category=fiction"
        />

        {/* Carousel 5: BW Top Books */}
        <BookCarousel
          eyebrow="Editor's Selection"
          title="BW Top Books"
          subtitle="Hand-picked literature recommended by our editorial team"
          queryParam="category=award-winners&limit=12"
          href="/books?category=award-winners"
        />

        {/* Carousel 6: Up to 50% Off (Tinted Background) */}
        <BookCarousel
          eyebrow="Bargain Finds"
          title="Up to 50% Off"
          subtitle="Incredible discounts on quality pre-owned & excess copies"
          queryParam="discount=30&limit=12"
          href="/books?discount=30"
          tintBackground={true}
        />

        {/* Carousel 7: Minimum 40% Off (Tinted Background) */}
        <BookCarousel
          eyebrow="Deep Discounts"
          title="Minimum 40% Off"
          subtitle="Massive savings on verified condition titles"
          queryParam="discount=40&limit=12"
          href="/books?discount=40"
          tintBackground={true}
        />

        {/* 5. Secondary Homepage Sections */}

        {/* Sell Your Books Strip */}
        <SellYourBooksStrip />

        {/* Category Tile Grid */}
        <CategoryGrid />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Newsletter Signup */}
        <NewsletterSection />
      </main>

      {/* 6. Footer */}
      <Footer />
    </div>
  );
}
