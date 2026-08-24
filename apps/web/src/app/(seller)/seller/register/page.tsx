"use client";

import React from "react";
import { Navbar } from "@/components/shared/navbar";
import { SellerOnboardingWizard } from "@/components/auth/seller-onboarding-wizard";
import {
  Tag,
  ShieldCheck,
  RotateCcw,
  Truck,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SellerRegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden shadow-xl border-border bg-card rounded-3xl">
          {/* Left Column (Brand Editorial Hero) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-secondary/5 via-card to-muted/40 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border relative overflow-hidden">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Verified Seller Network</span>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
                  Sell Books Across India
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Join 12,000+ student sellers and bookstore owners passing on study materials and earning guaranteed payouts.
                </p>
              </div>

              <div className="w-full max-w-[220px] aspect-square mx-auto flex items-center justify-center bg-white/40 dark:bg-white/95 rounded-2xl p-4 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/create-account.png"
                  alt="BookFry Seller Account"
                  className="w-full h-full object-contain select-none"
                />
              </div>
            </div>

            {/* Seller Benefits Grid */}
            <div className="space-y-3 pt-4 border-t border-border text-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold shrink-0">
                  ⚡
                </div>
                <div>
                  <p className="font-bold text-foreground">Instant UPI Settlements</p>
                  <p className="text-[10px] text-muted-foreground">Direct bank/UPI transfer upon delivery</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-brand/10 text-brand dark:bg-brand/20 text-xs flex items-center justify-center font-bold shrink-0">
                  📦
                </div>
                <div>
                  <p className="font-bold text-foreground">Zero Upfront Listing Fees</p>
                  <p className="text-[10px] text-muted-foreground">List unlimited textbooks completely free</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Wizard Steps) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            <SellerOnboardingWizard />
          </div>
        </Card>
      </main>

      {/* Trust bar */}
      <div className="bg-card border-t border-b border-border/60 py-5 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-between text-left">
            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <Tag className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">100% Free Listing</h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">No hidden fees</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Doorstep Courier</h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">Convenient pickup</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Seller Protection</h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">Safe student escrow</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Direct UPI</h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">Same-day payouts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
