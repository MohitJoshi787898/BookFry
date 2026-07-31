'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Zap, Loader2, X, Sparkles } from 'lucide-react';

interface CartMobileStickyBarProps {
  itemCount: number;
  subtotal: number;
  appliedCoupon: string | null;
  couponDiscountAmount: number;
  shippingFee: number;
  estimatedTax: number;
  savings: number;
  total: number;
  isCheckingOut: boolean;
  onProceedCheckout: () => void;
}

export function CartMobileStickyBar({
  itemCount,
  subtotal,
  appliedCoupon,
  couponDiscountAmount,
  shippingFee,
  estimatedTax,
  savings,
  total,
  isCheckingOut,
  onProceedCheckout,
}: CartMobileStickyBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Fixed Sticky Bottom Bar */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <button onClick={() => setIsOpen(true)} className="flex-1 text-left cursor-pointer">
          <p className="flex items-center gap-1 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
            <ChevronUp className="h-3 w-3 text-secondary animate-bounce" /> Total ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </p>
          <p className="text-base font-extrabold text-foreground font-mono">₹{total.toFixed(2)}</p>
          {savings > 0 && (
            <p className="text-[10px] font-extrabold text-success">Saved ₹{savings.toFixed(0)}</p>
          )}
        </button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onProceedCheckout}
          disabled={isCheckingOut}
          className="flex-1 h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60 cursor-pointer"
        >
          {isCheckingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Zap className="h-4 w-4 fill-current" /> Checkout
            </>
          )}
        </motion.button>
      </div>

      {/* Mobile Summary Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sheet-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl border-t border-border/80 p-6 space-y-5 lg:hidden shadow-2xl"
              style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
              role="dialog"
              aria-modal="true"
            >
              {/* Drag Handle & Header */}
              <div className="relative flex items-center justify-between pb-2 border-b border-border/60">
                <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/30 absolute left-1/2 -translate-x-1/2 -top-3" />
                <h3 className="font-serif text-lg font-extrabold text-foreground">Order Breakdown</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-card"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Price Details */}
              <div className="space-y-3 text-xs sm:text-sm font-sans">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-extrabold text-foreground font-mono">₹{subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-success font-extrabold">
                    <span>Coupon Discount</span>
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
                      <Sparkles className="h-3.5 w-3.5" /> Total Saved
                    </span>
                    <span className="font-mono text-sm">₹{savings.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-border/80 pt-3 flex justify-between font-extrabold text-base text-foreground">
                  <span>Total Amount</span>
                  <span className="font-mono text-secondary text-lg">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setIsOpen(false);
                  onProceedCheckout();
                }}
                disabled={isCheckingOut}
                className="w-full h-13 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-sm uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isCheckingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-current" /> Proceed to Checkout
                  </>
                )}
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
