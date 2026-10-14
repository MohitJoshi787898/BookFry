'use client';

import React from 'react';
import { Wallet, ShieldCheck, HelpCircle } from 'lucide-react';

interface EarningsCalculatorCardProps {
  price: number;
  freeShipping: boolean;
  shippingFee: number;
}

export function EarningsCalculatorCard({
  price,
  freeShipping,
  shippingFee,
}: EarningsCalculatorCardProps) {
  const platformFeeRate = 0.1; // 10% marketplace fee
  const validPrice = Math.max(0, price || 0);
  const platformFee = validPrice * platformFeeRate;
  const netEarnings = Math.max(0, validPrice - platformFee);

  return (
    <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 sm:p-4 shadow-2xs space-y-2.5 font-sans">
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-secondary/10 text-secondary rounded-lg shrink-0">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-serif text-xs sm:text-sm font-bold text-foreground">Estimated Earnings Breakdown</h4>
            <p className="text-[10px] text-muted-foreground">Instant payout upon buyer order completion</p>
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
          100% Payout Safety
        </span>
      </div>

      <div className="space-y-1.5 text-[11px] sm:text-xs font-sans">
        <div className="flex justify-between text-muted-foreground">
          <span className="font-medium">Book Listing Price</span>
          <span className="font-bold font-mono text-foreground">₹{validPrice.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span className="flex items-center gap-1 font-medium">
            Platform Service Fee (10%)
            <span title="Covers secure escrow, customer support, and marketplace maintenance">
              <HelpCircle className="h-3 w-3 text-muted-foreground" />
            </span>
          </span>
          <span className="font-bold font-mono text-rose-500">-₹{platformFee.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span className="font-medium">Shipping Option</span>
          <span className="font-bold text-foreground">
            {freeShipping ? 'Free Shipping (Seller Cover)' : `Buyer Pays Shipping (₹${shippingFee})`}
          </span>
        </div>
      </div>

      <div className="pt-2.5 border-t border-border/60 flex justify-between items-center">
        <div>
          <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">You Will Receive:</span>
          <span className="text-lg sm:text-xl font-black font-mono text-secondary">₹{netEarnings.toFixed(2)}</span>
        </div>
        <div className="text-right text-[10px] text-muted-foreground max-w-[140px] leading-snug font-medium">
          Direct instant payout to your UPI or Bank Account.
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1.5 border-t border-border/40 font-medium">
        <ShieldCheck className="h-3.5 w-3.5 text-secondary shrink-0" />
        <span>Guaranteed payment protection backed by BookFry Escrow</span>
      </div>
    </div>
  );
}

export default EarningsCalculatorCard;
