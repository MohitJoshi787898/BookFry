'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Truck, Flame } from 'lucide-react';

interface CartFreeShippingBarProps {
  subtotal: number;
  threshold?: number;
}

export function CartFreeShippingBar({ subtotal, threshold = 499 }: CartFreeShippingBarProps) {
  const isFree = subtotal >= threshold || subtotal === 0;
  const progressPercent = Math.min((subtotal / threshold) * 100, 100);
  const remaining = threshold - subtotal;

  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs mb-4 font-sans">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isFree ? 'bg-success/15 text-success' : 'bg-secondary/15 text-secondary'}`}>
            {isFree ? <Sparkles className="h-4 w-4 animate-pulse" /> : <Truck className="h-4 w-4" />}
          </div>
          <div>
            {isFree ? (
              <span className="text-xs sm:text-sm font-extrabold text-success flex items-center gap-1.5">
                Free Delivery Unlocked! 🎉
              </span>
            ) : (
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                Add <span className="font-extrabold text-secondary">₹{remaining.toFixed(0)}</span> more for <span className="font-extrabold text-foreground">FREE Express Shipping</span>
              </span>
            )}
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-muted border border-border text-[11px] font-extrabold text-foreground font-mono shrink-0">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Animated Bar */}
      <div className="h-2.5 w-full bg-muted/80 rounded-full overflow-hidden p-0.5 border border-border/40">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full transition-colors duration-300 ${
            isFree ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-flame'
          }`}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium mt-3 pt-1 border-t border-border/40">
        <span className="flex items-center gap-1">
          <Flame className="h-3 w-3 text-secondary fill-secondary" /> Standard Delivery: 2–4 Days
        </span>
        <span>Target: ₹{threshold}</span>
      </div>
    </div>
  );
}
