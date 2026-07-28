"use client";

import React from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturesBar } from "@/components/marketing/features-bar";
import { QuickFilterBar } from "@/components/marketing/quick-filter-bar";
import { BookCarousel } from "@/components/marketing/book-carousel";
import { ExchangeKnowledgeSection } from "@/components/marketing/exchange-knowledge-section";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { WhyBookFrySection } from "@/components/marketing/why-bookfry-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { ReadingJourneyCTA } from "@/components/marketing/reading-journey-cta";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { Book } from "@bookmarket/types";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary transition-colors duration-200">
      <OrganizationJsonLd />
      {/* 1. Sticky Header Navigation */}
      <Navbar />

      <main className="flex-grow">
        {/* 2. Brand Hero Section */}
        <HeroSection />

        {/* 2.5 Features Value Proposition Bar */}
        <FeaturesBar />

        {/* 3. Quick Browse & Subject Filter Bar */}
        <QuickFilterBar />

        {/* 4. Trending Reads Carousel */}
        <BookCarousel
          eyebrow="Trending Velocity"
          title="Trending Reads"
          subtitle="Real-time popular velocity based on student activity & study demands"
          endpoint="/recommendations/home"
          filterFn={(data) => (Array.isArray(data) ? data : ((data?.trending as Book[]) || []))}
          href="/books?sort=viewsCount"
        />

        {/* 5. Exchange Knowledge Story Flow */}
        <ExchangeKnowledgeSection />

        {/* 6. Used Books — Give Books a Second Life (Bargain Finds) */}
        <BookCarousel
          eyebrow="Gently Pre-Owned"
          title="Give Books a Second Life"
          subtitle="Massive savings on verified pre-owned textbooks & study materials"
          queryParam="discount=30&limit=12"
          href="/books?discount=30"
          tintBackground={true}
        />

        {/* 7. Explore Every Subject (Category Bookshelves) */}
        <CategoryGrid />

        {/* 8. Popular & Recommended Literature */}
        <BookCarousel
          eyebrow="Student Favorites"
          title="Popular & Recommended Literature"
          subtitle="Highest ranked books curated based on sales, ratings, and student interest"
          endpoint="/recommendations/home"
          filterFn={(data) => (Array.isArray(data) ? data : ((data?.popular as Book[]) || []))}
          href="/books?sort=ratingAvg"
        />

        {/* 9. Why BookFry — 4 Core Pillars & Eco Impact */}
        <WhyBookFrySection />

        {/* 10. Student & Reader Testimonials */}
        <TestimonialsSection />

        {/* 11. Start Reading Journey CTA */}
        <ReadingJourneyCTA />

        {/* 12. Newsletter Signup */}
        <NewsletterSection />
      </main>

      {/* 13. Footer with Brand Slogan */}
      <Footer />
    </div>
  );
}
