"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowRight, BookOpen, Tag, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useAuthModalStore } from "@/stores/auth-modal.store";
import { StatItem } from "../shared/stat-item";
import { SearchPillChip } from "../shared/search-pill-chip";

export function HeroSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/books?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const quickTags = [
    { label: "Engineering", href: "/books?category=engineering" },
    { label: "NEET Books", href: "/books?search=NEET" },
    { label: "JEE Main", href: "/books?search=JEE" },
    { label: "Class 12", href: "/books?search=Class+12" },
    { label: "CA Books", href: "/books?search=CA" },
    { label: "UPSC", href: "/books?search=UPSC" },
    { label: "Novels", href: "/books?category=fiction" },
    { label: "B.Sc. Books", href: "/books?search=B.Sc" },
  ];

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-[#FEF8F3] dark:bg-[#0B1320] border-b border-border transition-colors duration-200">
      {/* Decorative light drawings/sketches background overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none bg-[radial-gradient(#F26522_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Copy */}
          <div className="lg:col-span-4 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Slogan badge pill */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FFF5F0] dark:bg-muted/60 text-[#F26522] text-xs font-bold uppercase tracking-wider mb-4 border border-[#FFF0E8]/50 dark:border-border/40">
                <BookOpen className="h-3.5 w-3.5 text-[#F26522]" />
                <span className="font-serif tracking-wide text-xs">
                  पढ़िये, बचाइये और बेचिये
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A3B5C] dark:text-foreground leading-[1.1]">
                Books you love. <br />
                Deals you&apos;ll <br />
                <span className="text-[#F26522] italic font-serif">adore.</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed max-w-md mx-auto lg:mx-0 font-medium"
            >
              Buy, sell and discover new & used books at the best prices. Read
              more, spend less, and make every page count.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2 font-sans"
            >
              <Link
                href="/books"
                className="w-full sm:w-auto rounded-lg bg-[#0B1E36] dark:bg-primary dark:hover:bg-primary/95 hover:bg-[#061224] px-6 py-3 text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Buy Books</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/sell"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    useAuthModalStore.getState().openModal("login", "/sell");
                  }
                }}
                className="w-full sm:w-auto rounded-lg border border-[#F26522] text-[#F26522] bg-white dark:bg-transparent dark:text-secondary dark:hover:bg-white/5 px-6 py-3 text-xs font-bold shadow-xs hover:bg-[#FFF5F0] transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Sell Your Books</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>

            {/* Impact Stats */}
            <div className="pt-6 border-t border-border/60 flex flex-wrap gap-4 items-center justify-between font-sans">
              <StatItem icon={BookOpen} value="50,000+" label="Books Listed" />
              <StatItem icon={Tag} value="₹1.2Cr+" label="Saved by Students" />
              <StatItem
                icon={ShieldCheck}
                value="99.4%"
                label="Verified Quality"
              />
            </div>
          </div>

          {/* Center Column: Wise Fox Reading Mascot (Blended) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="lg:col-span-4 flex justify-center items-center"
          >
            <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center rounded-2xl dark:bg-card dark:border dark:border-border/60 p-4 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fox_reading_178491148655455.png"
                alt="BookFry Mascot Wise Fox Reading"
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal select-none"
              />
            </div>
          </motion.div>

          {/* Right Column: Search Box Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4"
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:shadow-none space-y-5 relative overflow-hidden transition-colors">
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#1A3B5C] dark:text-foreground">
                  Find Your Next Read
                </h3>
                <p className="text-xs text-text-secondary font-sans font-medium">
                  Search from millions of books at the best prices
                </p>
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className="space-y-3 font-sans"
              >
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="e.g. Engineering Mathematics or 978013427741"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-xs bg-background dark:bg-background/45 text-text-primary focus:outline-none focus:ring-1 focus:ring-[#F26522] placeholder:text-text-muted font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#F26522] hover:bg-[#e05310] text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  Search Books
                </button>
              </form>

              <div className="space-y-2 pt-2 border-t border-border/40">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickTags.map((tag) => (
                    <SearchPillChip
                      key={tag.label}
                      label={tag.label}
                      href={tag.href}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
