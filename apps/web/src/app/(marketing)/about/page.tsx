import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Heart, Leaf, IndianRupee, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { SectionHeader } from '@/components/shared/section-header';
import { Button } from '@/components/shared/button';
import { StatCard } from '@/components/shared/stat-card';
import { ValueCard } from '@/components/shared/value-card';
import { SellYourBooksStrip } from '@/components/marketing/sell-your-books-strip';

export const metadata = {
  title: 'BookFry • Our Story & Mission',
  description: 'Learn about BookFry, India’s circular textbook marketplace. Our mission, values, and how we keep education affordable for every student.',
};

export default function AboutPage() {
  const stats = [
    { number: '50,000+', label: 'Books Circulated' },
    { number: '12,000+', label: 'Verified Student Sellers' },
    { number: '4.8★', label: 'Average User Rating' },
    { number: '30%', label: 'Less Waste vs. Buying New' },
  ];

  const values = [
    {
      title: 'Trust & Transparency',
      description: 'Every seller profile is verified, and transactions are protected by escrow to ensure you get the exact condition you paid for.',
      icon: ShieldCheck,
      variant: 'primary' as const,
    },
    {
      title: 'Sustainability First',
      description: 'Circulating pre-owned textbooks extends their lifecycle and reduces paper waste. Learning should enrich minds, not deplete forests.',
      icon: Leaf,
      variant: 'success' as const,
    },
    {
      title: 'Student Community First',
      description: 'BookFry is built by students, for students. We facilitate direct peer-to-peer exchanges and campus pickups to build local trust.',
      icon: Heart,
      variant: 'secondary' as const,
    },
    {
      title: 'Fair & Open Pricing',
      description: 'No middleman markups. Sellers set their own prices, and buyers get textbooks at up to 70% off retail pricing.',
      icon: IndianRupee,
      variant: 'primary' as const,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow">
        {/* Warm Cozy Hero Section */}
        <section className="relative h-[420px] w-full overflow-hidden flex items-center justify-center font-sans">
          <div className="absolute inset-0">
            <Image
              src="/about_hero.png"
              alt="Cozy bookstore bookshelf background"
              fill
              priority
              className="object-cover brightness-[0.70] dark:brightness-[0.45]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 text-center space-y-4 z-10 animate-fade-in">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary-50 dark:bg-secondary-950/40 px-3 py-1 rounded-full inline-block">
              Our Vision
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Every book deserves a second reader.
            </h1>
            <p className="text-sm sm:text-lg text-white/90 max-w-xl mx-auto font-sans leading-relaxed">
              We connect students, readers, and book collectors across India to make education affordable and circular.
            </p>
          </div>
        </section>

        {/* Our Story Narrative Alternating Blocks */}
        <section className="py-16 sm:py-24 font-sans bg-surface border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
            
            <SectionHeader
              title="Why BookFry Exists"
              subtitle="The story of how we decided to turn dusty bookshelves into shared knowledge."
              className="mb-12"
            />

            {/* Block 1: The Problem (Image Right) */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="w-full lg:w-1/2 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block">
                  The Problem
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
                  Books Stuck in Boxes
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Every semester, millions of students purchase brand new textbooks at premium prices, only to let them sit in cardboard boxes or closets once exams are over. Meanwhile, incoming students struggle to afford the same syllabus material.
                </p>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Local scrap dealers (kabadiwalas) buy these valuable books for pennies, and there has been no trusted, direct marketplace where a student can list books and recoup their costs while helping another learner.
                </p>
              </div>
              <div className="w-full lg:w-1/2 relative h-64 sm:h-80 rounded-xl overflow-hidden shadow-md border border-border/40">
                <Image
                  src="/story_books.png"
                  alt="Textbooks packed in boxes"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Block 2: The Founding (Image Left) */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
              <div className="w-full lg:w-1/2 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand block">
                  The Mission
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
                  Affordable Learning for All
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  BookFry was founded with a single brand slogan in mind: **&quot;क्योंकि.. पढ़ाई रुकनी नहीं चाहिए&quot;** (*Because education must never stop*). We believe that the cost of learning material should never be a barrier to a student’s academic potential.
                </p>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  By building a streamlined campus-wide digital marketplace, we make it simple to buy, sell, and exchange pre-owned books locally, ensuring that affordable knowledge remains in perpetual circulation.
                </p>
              </div>
              <div className="w-full lg:w-1/2 relative h-64 sm:h-80 rounded-xl overflow-hidden shadow-md border border-border/40">
                <Image
                  src="/campus_exchange.png"
                  alt="Students swapping textbooks on campus"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

          </div>
        </section>

        {/* By the Numbers Stats Row */}
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <StatCard key={idx} number={stat.number} label={stat.label} />
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Strip (Reused from home/marketing) */}
        <SellYourBooksStrip />

        {/* Values Grid */}
        <section className="py-16 sm:py-24 bg-surface border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="What Governs Us"
              subtitle="Our core values guide how we build technology, support communities, and preserve the environment."
              className="mb-12"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((val, idx) => (
                <ValueCard
                  key={idx}
                  title={val.title}
                  description={val.description}
                  icon={val.icon}
                  iconVariant={val.variant}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Band Closing Action */}
        <section className="py-16 bg-gradient-hero text-center font-sans">
          <div className="max-w-2xl mx-auto px-4 space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
              Ready to clear your bookshelf?
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              List your books in under 60 seconds, reach local students on campus, and support a circular economy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/seller/dashboard">
                <Button variant="secondary" className="px-6 py-3 flex items-center space-x-2">
                  <span>Start Selling Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/books">
                <Button variant="outline" className="px-6 py-3">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
