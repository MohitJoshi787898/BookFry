"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search,
  ArrowRight,
  BookOpen,
  Tag,
  ShieldCheck,
  Bookmark,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useAuthModalStore } from "@/stores/auth-modal.store";
import { StatItem } from "../shared/stat-item";
import { SearchPillChip } from "../shared/search-pill-chip";

const EASE = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState("");
  const prefersReducedMotion = useReducedMotion();

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

  const reveal = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden border-b border-border bg-background transition-colors duration-200">
      {/* Ambient wash + bookshelf texture — both already defined in globals.css,
          reused here instead of a bespoke inline background hack */}
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute inset-0 bg-bookshelf-pattern opacity-[0.35] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-6">
          {/* ---------------------------------------------------------------
              Left: editorial copy — widened to 5/12 so it leads the page
              instead of splitting attention evenly across three columns
             --------------------------------------------------------------- */}
          <div className="relative lg:col-span-5">
            <motion.div {...reveal(0)}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="tracking-wide">
                  क्योंकि.. पढ़ाई रुकनी नहीं चाहिए
                </span>
              </div>

              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-primary dark:text-foreground sm:text-5xl lg:text-6xl">
                Books you love.
                <br />
                Deals you&apos;ll{" "}
                <span className="relative inline-block text-secondary">
                  adore.
                  <svg
                    className="absolute -bottom-1 left-0 w-full text-secondary/40"
                    height="8"
                    viewBox="0 0 120 8"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 5.5C30 1 90 1 118 5.5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
            </motion.div>

            <motion.p
              {...reveal(0.08)}
              className="mt-5 max-w-md text-sm font-medium leading-relaxed text-muted-foreground sm:text-base"
            >
              Buy, sell and discover new &amp; used books at the best prices.
              Read more, spend less, and make every page count.
            </motion.p>

            <motion.div
              {...reveal(0.16)}
              className="mt-7 flex flex-col gap-3.5 sm:flex-row"
            >
              <Link
                href="/books"
                className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-brand px-6 py-3 text-xs font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Buy books
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/sell"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    useAuthModalStore.getState().openModal("login", "/sell");
                  }
                }}
                className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg border border-secondary bg-background px-6 py-3 text-xs font-bold text-secondary shadow-sm transition-colors hover:bg-secondary/10"
              >
                Sell your books
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </motion.div>

            <motion.div
              {...reveal(0.24)}
              className="mt-8 flex flex-wrap items-center gap-3 border-t border-border/60 pt-6"
            >
              <div className="hover-page-turn rounded-lg px-2 py-1">
                <StatItem
                  icon={BookOpen}
                  value="50,000+"
                  label="Books listed"
                />
              </div>
              <div className="hover-page-turn rounded-lg px-2 py-1">
                <StatItem
                  icon={Tag}
                  value="₹1.2Cr+"
                  label="Saved by students"
                />
              </div>
              <div className="hover-page-turn rounded-lg px-2 py-1">
                <StatItem
                  icon={ShieldCheck}
                  value="99.4%"
                  label="Verified quality"
                />
              </div>
            </motion.div>
          </div>

          {/* ---------------------------------------------------------------
              Center: mascot — freed from its own bordered box so it reads as
              part of the page rather than a floating tile; a soft radial glow
              grounds it instead
             --------------------------------------------------------------- */}
          <motion.div
            {...reveal(0.1)}
            className="relative order-first flex items-center justify-center lg:order-none lg:col-span-3"
          >
            <div
              className="pointer-events-none absolute h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
              aria-hidden="true"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fox_reading_178491148655455.png"
              alt="BookFry mascot — a fox reading a book"
              className="relative w-full max-w-[280px] select-none object-contain mix-blend-multiply dark:mix-blend-normal"
            />
          </motion.div>

          {/* ---------------------------------------------------------------
              Right: search card — glass-surface + a bookmark-ribbon tag as
              the page's one signature flourish, tied directly to the book
              metaphor rather than a generic corner badge
             --------------------------------------------------------------- */}
          <motion.div {...reveal(0.2)} className="lg:col-span-4">
            <div className="glass-surface relative space-y-5 overflow-visible rounded-2xl p-6 shadow-lg">
              <div className="bookmark-badge absolute -top-3 right-6 flex items-center gap-1 bg-secondary px-3 pb-2.5 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                <Bookmark className="h-3 w-3" aria-hidden="true" />
                Trending now
              </div>

              <div className="space-y-1 pt-1">
                <h2 className="text-lg font-bold text-primary dark:text-foreground">
                  Find your next read
                </h2>
                <p className="text-xs font-medium text-muted-foreground">
                  Search from millions of books at the best prices
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="relative">
                  <Search
                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <label htmlFor="hero-search" className="sr-only">
                    Search by title, author, or ISBN
                  </label>
                  <input
                    id="hero-search"
                    type="text"
                    placeholder="e.g. Engineering Mathematics or 9780134277141"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="focus-ring w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-xs font-medium text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  type="submit"
                  className="focus-ring w-full rounded-lg bg-gradient-flame py-2.5 text-xs font-bold uppercase tracking-wider text-secondary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  Search books
                </button>
              </form>

              <div className="space-y-2 border-t border-border/40 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Popular searches
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
