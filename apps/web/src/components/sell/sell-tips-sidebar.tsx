'use client';

import React from 'react';
import { Camera, BookOpen, Check, Percent, MessageSquare } from 'lucide-react';

export function SellTipsSidebar() {
  return (
    <aside className="hidden xl:block w-80 shrink-0 space-y-6 font-sans">
      {/* Tips Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs uppercase tracking-wider font-black text-foreground">
          Tips for a Better Listing
        </h3>

        <div className="space-y-4 font-sans text-xs text-muted-foreground font-medium">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-[#F26522]/10 text-[#F26522] shrink-0">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-0.5">Use clear, well-lit photos</h4>
              <p className="text-[10px] leading-relaxed text-muted-foreground">Capture covers and spine in bright environment.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-[#F26522]/10 text-[#F26522] shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-0.5">Add all relevant details</h4>
              <p className="text-[10px] leading-relaxed text-muted-foreground">Mention publisher edition and target course curriculum.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-[#F26522]/10 text-[#F26522] shrink-0">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-0.5">Be honest about condition</h4>
              <p className="text-[10px] leading-relaxed text-muted-foreground">Accurate condition tags prevent buyer dispute returns.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-[#F26522]/10 text-[#F26522] shrink-0">
              <Percent className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-0.5">Competitive pricing sells faster</h4>
              <p className="text-[10px] leading-relaxed text-muted-foreground">Price pre-owned books at 40-60% of original MRP.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-[#F26522]/10 text-[#F26522] shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-0.5">Respond quickly to buyers</h4>
              <p className="text-[10px] leading-relaxed text-muted-foreground">Fast checkouts double seller ratings and listing ranks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Sell Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs uppercase tracking-wider font-black text-foreground">
          Why sell on BookFry?
        </h3>

        <div className="space-y-3.5 font-sans text-xs text-muted-foreground font-semibold">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">✓</div>
            <span className="text-foreground">0% Listing Fee</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">✓</div>
            <span className="text-foreground">Trusted by 50K+ Sellers</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">✓</div>
            <span className="text-foreground">Safe &amp; Secure Payments</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">✓</div>
            <span className="text-foreground">100% Seller Protection</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">✓</div>
            <span className="text-foreground">Quick Payouts Ledger</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default SellTipsSidebar;
