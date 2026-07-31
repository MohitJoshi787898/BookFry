'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, ChevronDown, BadgeCheck, AlertCircle, Check, Sparkles, ChevronRight } from 'lucide-react';

interface CartCouponSectionProps {
  appliedCoupon: string | null;
  couponError: string | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
}

export function CartCouponSection({
  appliedCoupon,
  couponError,
  onApplyCoupon,
  onRemoveCoupon,
}: CartCouponSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [couponInput, setCouponInput] = useState('');

  const handleApply = () => {
    if (couponInput.trim()) {
      onApplyCoupon(couponInput.trim());
    }
  };

  const presetCoupons = [
    { code: 'BOOKFRYNEW', label: '10% OFF', desc: 'Flat 10% off for first-time book orders' },
    { code: 'FESTIVE20', label: '20% OFF', desc: '20% discount on order totals over ₹499' },
  ];

  return (
    <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xs overflow-hidden shadow-xs mb-4">
      {/* Header Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-extrabold text-foreground hover:bg-muted/40 transition-colors"
        aria-expanded={isExpanded}
      >
        <span className="flex items-center gap-3">
          <span className="h-9 w-9 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <Tag className="h-4 w-4" />
          </span>
          {appliedCoupon ? (
            <span className="text-success flex items-center gap-1.5 font-extrabold">
              <BadgeCheck className="h-4 w-4" /> Coupon &ldquo;{appliedCoupon}&rdquo; Applied
            </span>
          ) : (
            <span>Apply Coupon / Gift Voucher</span>
          )}
        </span>
        <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="coupon-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-3 border-t border-border/60 space-y-4">
              {/* Input Row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="ENTER PROMO CODE"
                  className="flex-1 h-11 px-4 rounded-2xl border border-border bg-background text-xs font-extrabold uppercase text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary tracking-wider"
                />
                <button
                  onClick={handleApply}
                  className="h-11 px-5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95 shrink-0 shadow-xs"
                >
                  Apply
                </button>
              </div>

              {/* Feedback messages */}
              {couponError && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-xs font-extrabold">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {couponError}
                </div>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-success/10 border border-success/20 text-success text-xs font-extrabold">
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Coupon &ldquo;{appliedCoupon}&rdquo; active!
                  </span>
                  <button
                    onClick={() => {
                      onRemoveCoupon();
                      setCouponInput('');
                    }}
                    className="text-danger hover:underline font-extrabold text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Quick Preset Coupons */}
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-secondary" /> Available Offers
                </p>
                {presetCoupons.map((coupon) => (
                  <button
                    key={coupon.code}
                    onClick={() => {
                      setCouponInput(coupon.code);
                      onApplyCoupon(coupon.code);
                    }}
                    className="w-full flex items-center justify-between p-3 border border-dashed border-secondary/35 bg-secondary/5 hover:bg-secondary/10 rounded-2xl transition-all text-left group"
                  >
                    <div className="space-y-0.5">
                      <span className="px-2.5 py-0.5 bg-secondary text-secondary-foreground rounded-full text-[10px] font-extrabold uppercase">
                        {coupon.code}
                      </span>
                      <p className="text-xs text-muted-foreground font-medium mt-1">{coupon.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      <span className="text-xs font-extrabold text-secondary">{coupon.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-secondary group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
