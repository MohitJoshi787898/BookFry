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
    <div className="rounded-3xl border border-secondary/30 bg-gradient-to-br from-primary/10 via-secondary/5 to-card p-6 shadow-xl space-y-4 font-sans backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-secondary text-secondary-foreground rounded-2xl shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-foreground">Estimated Earnings Breakdown</h4>
            <p className="text-[11px] text-muted-foreground">Instant payout upon buyer order completion</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
          100% Payout Safety
        </span>
      </div>

      <div className="space-y-2.5 text-xs font-sans">
        <div className="flex justify-between text-muted-foreground">
          <span className="font-medium">Book Listing Price</span>
          <span className="font-bold font-mono text-foreground text-sm">₹{validPrice.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">
            Platform Service Fee (10%)
            <span title="Covers secure escrow, customer support, and marketplace maintenance">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
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

      <div className="pt-4 border-t border-border/60 flex justify-between items-center">
        <div>
          <span className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">You Will Receive:</span>
          <span className="text-3xl font-black font-mono text-secondary">₹{netEarnings.toFixed(2)}</span>
        </div>
        <div className="text-right text-[11px] text-muted-foreground max-w-[150px] leading-relaxed font-medium">
          Direct instant payout to your UPI or Bank Account.
        </div>
      </div>

      <div className="flex items-center space-x-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border/40 font-medium">
        <ShieldCheck className="h-4 w-4 text-secondary" />
        <span>Guaranteed payment protection backed by BookFry Escrow</span>
      </div>
    </div>
  );
}

export default EarningsCalculatorCard;
