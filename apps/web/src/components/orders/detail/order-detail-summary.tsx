"use client";

import React from "react";
import { Order } from "@bookmarket/types";
import { Receipt, Sparkles, Tag, ShieldCheck } from "lucide-react";

interface OrderDetailSummaryProps {
  order: Order;
}

export function OrderDetailSummary({ order }: OrderDetailSummaryProps) {
  const subtotal = order.subtotal || 0;
  const discountAmount = order.discountAmount || 0;
  const shippingFee = order.shippingFee || 0;
  const tax = order.tax || 0;
  const total = order.total || 0;

  return (
    <div className="rounded-3xl bg-card border border-border/80 p-6 sm:p-8 shadow-xl mb-8 font-sans">
      <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
        <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2.5">
          <Receipt className="h-5 w-5 text-secondary" />
          <span>Payment & Price Breakdown</span>
        </h2>
        <span className="text-xs font-mono font-bold text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/50">
          Tax Invoice Summary
        </span>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Items Subtotal</span>
          <span className="font-mono font-bold text-foreground">₹{subtotal.toFixed(2)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
            <span className="flex items-center gap-1.5 text-xs">
              <Tag className="h-4 w-4" />
              <span>Coupon Discount ({order.couponCode || "PROMO"})</span>
            </span>
            <span className="font-mono text-sm">-₹{discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-muted-foreground">
          <span>Campus Shipping & Delivery</span>
          <span className="font-mono font-bold text-foreground">
            {shippingFee === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 uppercase font-black text-xs bg-emerald-500/10 px-2 py-0.5 rounded">
                FREE
              </span>
            ) : (
              `₹${shippingFee.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex justify-between items-center text-muted-foreground">
          <span>Estimated GST / Tax (8%)</span>
          <span className="font-mono font-bold text-foreground">₹{tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-border/60 pt-5 mt-2 flex justify-between items-center">
          <div>
            <span className="font-serif text-lg sm:text-xl font-extrabold text-foreground block">
              Total Amount Paid
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Inclusive of GST and Peer Escrow protection
            </span>
          </div>
          <span className="font-mono text-2xl sm:text-3xl font-black text-secondary">
            ₹{total.toFixed(2)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 justify-center">
            <Sparkles className="h-4 w-4" />
            <span>You saved ₹{discountAmount.toFixed(0)} on this BookFry order!</span>
          </div>
        )}
      </div>
    </div>
  );
}

