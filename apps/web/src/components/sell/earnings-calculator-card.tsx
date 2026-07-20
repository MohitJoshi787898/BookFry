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
    <div className="rounded-lg border border-brand/20 bg-gradient-to-br from-brand/5 to-surface p-5 shadow-sm space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-brand text-white rounded-md">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-text-primary">Estimated Earnings Breakdown</h4>
            <p className="text-[11px] text-text-muted">Instant payout upon buyer order completion</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full">
          100% Payout Safety
        </span>
      </div>

      <div className="space-y-2 text-xs font-sans">
        <div className="flex justify-between text-text-secondary">
          <span>Book Listing Price</span>
          <span className="font-bold text-text-primary">₹{validPrice.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-text-secondary">
          <span className="flex items-center gap-1">
            Platform Service Fee (10%)
            <span title="Covers secure escrow, customer support, and marketplace maintenance">
              <HelpCircle className="h-3 w-3 text-text-muted" />
            </span>
          </span>
          <span className="font-medium text-danger">-₹{platformFee.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-text-secondary">
          <span>Shipping Option</span>
          <span className="font-medium text-text-primary">
            {freeShipping ? 'Free Shipping (Seller Cover)' : `Buyer Pays Shipping (₹${shippingFee})`}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-border flex justify-between items-center">
        <div>
          <span className="text-xs text-text-muted block font-semibold">You Will Receive:</span>
          <span className="text-2xl font-bold font-mono text-brand">₹{netEarnings.toFixed(2)}</span>
        </div>
        <div className="text-right text-[11px] text-text-muted max-w-[140px] leading-tight">
          Direct payout to your preferred payment method.
        </div>
      </div>

      <div className="flex items-center space-x-1 text-[11px] text-text-secondary pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-brand" />
        <span>Guaranteed payment protection backed by BookFry Escrow</span>
      </div>
    </div>
  );
}

export default EarningsCalculatorCard;
