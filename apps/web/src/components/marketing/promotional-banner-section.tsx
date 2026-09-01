'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';

export interface PromotionalBannerSectionProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  badge?: string;
  image?: string;
}

export function PromotionalBannerSection({
  title = 'Limited Time Campus Book Deal',
  subtitle = 'Get an extra 15% off pre-owned Engineering & Medical exam bundles across India.',
  eyebrow = 'Special Offer',
  ctaLabel = 'Claim Offer Now',
  ctaUrl = '/books?discount=30',
  badge = 'Save Big',
  image = '/mascot_celebrate_178491148655455.png',
}: PromotionalBannerSectionProps) {
  return (
    <section aria-label={title} className="py-8 sm:py-12 bg-background border-b border-border/80">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-secondary/80 p-6 sm:p-10 shadow-xl text-primary-foreground font-sans">
          {/* Ambient Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-secondary/30 blur-3xl"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-secondary-foreground text-[10px] sm:text-xs font-extrabold uppercase tracking-widest">
                <Tag className="h-3.5 w-3.5" />
                <span>{eyebrow}</span>
                {badge && (
                  <span className="bg-secondary px-2 py-0.5 rounded-full text-[9px] text-white">
                    {badge}
                  </span>
                )}
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {title}
              </h2>

              {subtitle && (
                <p className="text-xs sm:text-base font-medium opacity-90 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {subtitle}
                </p>
              )}

              <div className="pt-2 flex justify-center lg:justify-start">
                <Link
                  href={ctaUrl}
                  className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 active:scale-95"
                >
                  <span>{ctaLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {image && (
              <div className="lg:col-span-4 flex justify-center order-first lg:order-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={title}
                  className="w-48 sm:w-56 object-contain drop-shadow-xl select-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PromotionalBannerSection;
