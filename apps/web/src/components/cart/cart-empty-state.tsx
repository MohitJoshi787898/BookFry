'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, ArrowRight, ShoppingBag, Plus, Tag, ShieldCheck, Check } from 'lucide-react';
import { Book } from '@bookmarket/types';

interface CartEmptyStateProps {
  recommendedBooks: Book[];
  onAddToCart: (book: Book) => void;
  isAdding: boolean;
}

export function CartEmptyState({ recommendedBooks, onAddToCart, isAdding }: CartEmptyStateProps) {
  const [addedId, setAddedId] = React.useState<string | null>(null);

  const handleAdd = (book: Book) => {
    setAddedId(book.id);
    onAddToCart(book);
    setTimeout(() => {
      setAddedId(null);
    }, 1500);
  };

  return (
    <div className="w-full py-4 sm:py-8 space-y-8 sm:space-y-12 font-sans">
      {/* Visual Fox Mascot Hero Banner - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full rounded-3xl border border-border/80 bg-card p-6 sm:p-10 lg:p-14 shadow-sm overflow-hidden text-center"
      >
        {/* Soft Background Radial Glow */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-secondary/15 dark:bg-secondary/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          {/* Mascot Image with Next.js Image Component */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-4 select-none drop-shadow-md">
            <Image
              src="/assets/bookfry/bookfry-fox-reading.webp"
              alt="BookFry Mascot — Fox reading a book"
              fill
              sizes="(max-width: 640px) 144px, 176px"
              className="object-contain"
              priority
            />
          </div>

          {/* Motto Pill */}
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-secondary">
            <BookOpen className="h-4 w-4" />
            <span>क्योंकि.. पढ़ाई रुकनी नहीं चाहिए</span>
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-3 tracking-tight">
            Your Reading Vault is Empty
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed mb-6 max-w-lg">
            Education must never stop! Discover verified syllabus textbooks, engineering guides, competitive exam books, and bestsellers starting at just ₹99.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/books"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-13 px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Explore Book Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sell"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-13 px-7 bg-card hover:bg-muted border border-border text-foreground font-bold text-sm rounded-2xl transition-all active:scale-95 cursor-pointer"
            >
              <Tag className="h-4 w-4 text-secondary" />
              <span>Sell Used Books</span>
            </Link>
          </div>

          {/* Value props ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mt-8 pt-8 border-t border-border/60 w-full max-w-xl text-left">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-foreground">Verified Quality</p>
                <p className="text-[11px] text-muted-foreground">Every copy hand-inspected</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-foreground">Up to 80% Off</p>
                <p className="text-[11px] text-muted-foreground">Affordable student pricing</p>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 justify-center sm:justify-start">
              <div className="h-8 w-8 rounded-xl bg-brand/15 text-brand flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-foreground">Campus Delivery</p>
                <p className="text-[11px] text-muted-foreground">Fast dispatch across India</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recommended Books Section - Full Responsive Width Grid */}
      {recommendedBooks.length > 0 && (
        <div className="w-full space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Recommended For You
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                Popular campus textbooks and reference books trending right now
              </p>
            </div>
            <Link
              href="/books"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-secondary hover:underline cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Grid Layout on Desktop / Tablet, Smooth Scroll Carousel on Mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {recommendedBooks.slice(0, 8).map((book) => {
              const coverImg = book.images?.[0]?.url || 'https://placehold.co/240x360/1A3B5C/fff?text=BookFry';
              const isItemAdded = addedId === book.id;

              return (
                <div
                  key={book.id}
                  className="hover-page-turn group bg-card border border-border/80 rounded-2xl p-3 sm:p-4 flex flex-col justify-between gap-3 hover:shadow-md transition-all duration-300"
                >
                  <Link href={`/books/${book.slug}`} className="space-y-2.5 block">
                    <div className="aspect-[3/4] w-full rounded-xl overflow-hidden border border-border/80 bg-muted relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImg}
                        alt={book.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://placehold.co/240x360/1A3B5C/fff?text=${encodeURIComponent(
                            book.title.substring(0, 15)
                          )}`;
                        }}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-background/90 backdrop-blur-sm border border-border text-[10px] font-extrabold uppercase text-secondary">
                        {book.condition === 'new' ? 'New' : 'Used'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-foreground line-clamp-2 leading-snug group-hover:text-secondary transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-muted-foreground font-medium line-clamp-1 mt-0.5">
                        by {book.author}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-sm sm:text-base font-extrabold text-secondary font-mono">
                          ₹{book.discountPrice || book.price}
                        </span>
                        {book.discountPrice && book.discountPrice < book.price && (
                          <span className="text-xs text-muted-foreground line-through font-medium font-mono">
                            ₹{book.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleAdd(book)}
                    disabled={isAdding}
                    className={`w-full h-10 sm:h-11 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                      isItemAdded
                        ? 'bg-success text-white'
                        : 'bg-secondary/15 hover:bg-secondary text-secondary hover:text-secondary-foreground'
                    }`}
                  >
                    {isItemAdded ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Add to Vault</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CartEmptyState;
