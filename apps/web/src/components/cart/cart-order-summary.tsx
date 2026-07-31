'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Loader2, ShieldCheck, Package, BadgeCheck, Sparkles, MapPin } from 'lucide-react';
import { Address } from '@bookmarket/types';

interface CartOrderSummaryProps {
  itemCount: number;
  subtotal: number;
  appliedCoupon: string | null;
  couponDiscountAmount: number;
  shippingFee: number;
  estimatedTax: number;
  savings: number;
  total: number;
  activeAddress?: Address;
  isCheckingOut: boolean;
  onProceedCheckout: () => void;
  onChangeAddressClick: () => void;
}

export function CartOrderSummary({
  itemCount,
  subtotal,
  appliedCoupon,
  couponDiscountAmount,
  shippingFee,
  estimatedTax,
  savings,
  total,
  activeAddress,
  isCheckingOut,
  onProceedCheckout,
  onChangeAddressClick,
}: CartOrderSummaryProps) {
  const parseAddress = (str: string) => {
    const parts = str.split(' - ');
    return parts.length > 1
      ? { labelName: parts[0], streetOnly: parts.slice(1).join(' - ') }
      : { labelName: 'Shipping Address', streetOnly: str };
  };

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      {/* Address Card */}
      <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xs p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-foreground">
            <MapPin className="h-4 w-4 text-secondary" /> Delivery Location
          </h4>
          <button
            onClick={onChangeAddressClick}
            className="text-xs font-extrabold text-secondary hover:underline cursor-pointer"
          >
            {activeAddress ? 'Change' : 'Add Address'}
          </button>
        </div>

        {activeAddress ? (
          <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/60 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-extrabold text-foreground">
                {parseAddress(activeAddress.street).labelName}
              </p>
              {activeAddress.isDefault && (
                <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-[9px] font-extrabold text-secondary uppercase">
                  Default
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">
              {parseAddress(activeAddress.street).streetOnly}
            </p>
            <p className="text-xs text-muted-foreground font-semibold">
              {activeAddress.city}, {activeAddress.state} – {activeAddress.zipCode}
            </p>
          </div>
        ) : (
          <div className="text-center py-4 border border-dashed border-border/80 rounded-2xl bg-muted/30">
            <p className="text-xs font-bold text-muted-foreground mb-2">No address selected</p>
            <button
              onClick={onChangeAddressClick}
              className="px-4 py-1.5 bg-secondary text-secondary-foreground font-extrabold text-xs rounded-xl hover:bg-secondary/90 transition-all active:scale-95 shadow-2xs"
            >
              Set Shipping Address
            </button>
          </div>
        )}
      </div>

      {/* Main Order Summary Card */}
      <div className="rounded-3xl border border-border/90 bg-gradient-to-b from-card via-card to-muted/20 p-6 shadow-xl dark:shadow-2xl overflow-hidden space-y-5">
        <div className="border-b border-border/80 pb-4">
          <h3 className="font-serif text-xl font-extrabold text-foreground">Order Summary</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Prices inclusive of verified student discounts
          </p>
        </div>

        {/* Breakdown Rows */}
        <div className="space-y-3.5 text-xs sm:text-sm font-sans">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal ({itemCount} {itemCount === 1 ? 'book' : 'books'})</span>
            <span className="font-extrabold text-foreground font-mono">₹{subtotal.toFixed(2)}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-success font-extrabold">
              <span>Coupon Discount ({appliedCoupon})</span>
              <span className="font-mono">−₹{couponDiscountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-muted-foreground">
            <span>Delivery Shipping</span>
            <span className={`font-extrabold ${shippingFee === 0 ? 'text-success' : 'text-foreground font-mono'}`}>
              {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between text-muted-foreground">
            <span>Estimated GST (8%)</span>
            <span className="font-extrabold text-foreground font-mono">₹{estimatedTax.toFixed(2)}</span>
          </div>

          {savings > 0 && (
            <div className="flex justify-between px-3.5 py-2.5 rounded-2xl bg-success/10 border border-success/20 text-success font-extrabold text-xs">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Total Saved
              </span>
              <span className="font-mono text-sm">₹{savings.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t border-border/80 pt-4 flex justify-between font-extrabold text-base sm:text-lg text-foreground">
            <span>Total Payable</span>
            <span className="font-mono text-secondary text-xl">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout CTA */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onProceedCheckout}
          disabled={isCheckingOut}
          className="w-full h-13 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {isCheckingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Zap className="h-4 w-4 fill-current" /> Proceed to Checkout
            </>
          )}
        </motion.button>

        <p className="text-[11px] text-center text-muted-foreground font-medium">
          Protected by BookFry P2P Escrow Guarantee
        </p>

        {/* Security Badges */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-center">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span className="text-[10px] font-extrabold text-muted-foreground">Peer Escrow</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-extrabold text-muted-foreground">Tracked</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <BadgeCheck className="h-4 w-4 text-secondary" />
            <span className="text-[10px] font-extrabold text-muted-foreground">Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
