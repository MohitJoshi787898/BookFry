'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SellBookFormData } from '@/lib/validations/sell-form.schema';
import { ShieldCheck, AlertCircle, MapPin, DollarSign, BookOpen } from 'lucide-react';

interface ReviewTabProps {
  form: UseFormReturn<SellBookFormData>;
  stepNumber?: number;
  isAdmin?: boolean;
}

export function ReviewTab({ form, stepNumber = 6, isAdmin = false }: ReviewTabProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const values = watch();

  const conditionLabels: Record<string, string> = {
    new: 'Brand New (Factory Fresh)',
    like_new: 'Like New (Pristine)',
    good: 'Good Condition (Clean Pages)',
    fair: 'Fair Condition (Syllabus Copy)',
  };

  const activeCondition = isAdmin ? 'new' : values.condition;
  const imageCount = values.images?.length || 0;

  return (
    <div className="space-y-4 sm:space-y-5 font-sans">
      {/* Header */}
      <div className="border-b border-border/80 pb-3">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">
          Step {stepNumber}: Review Listing &amp; Declaration
        </h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
          Review all information carefully before publishing your book to the BookFry marketplace.
        </p>
      </div>

      {/* Structured Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Book & Condition Card */}
        <div className="p-3.5 sm:p-4 bg-muted/30 border border-border/80 rounded-xl space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-secondary font-bold text-xs sm:text-sm border-b border-border/60 pb-2">
            <BookOpen className="h-4 w-4" />
            <span>Book &amp; Condition Details</span>
          </div>
          <div className="text-xs space-y-2">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">Title</span>
              <span className="font-bold text-xs sm:text-sm text-foreground">{values.title || 'Untitled'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">Author</span>
              <span className="font-semibold text-xs text-foreground">{values.author || 'Not specified'}</span>
            </div>
            {values.isbn && (
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">ISBN</span>
                <span className="font-mono font-medium text-xs text-foreground">{values.isbn}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">Condition</span>
              <span className="font-bold text-xs text-secondary">
                {conditionLabels[activeCondition] || activeCondition}
                {isAdmin && ' (Admin Default)'}
              </span>
            </div>
            {!isAdmin && values.conditionNotes && (
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">Condition Notes</span>
                <p className="italic text-muted-foreground bg-background p-2 rounded-lg mt-1 text-[11px] border border-border/60">&ldquo;{values.conditionNotes}&rdquo;</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">Photos Uploaded</span>
              <span className="font-bold text-xs text-foreground">{imageCount} {imageCount === 1 ? 'photo' : 'photos'}</span>
            </div>
          </div>
        </div>

        {/* Pricing, Payout & Location Card */}
        <div className="p-3.5 sm:p-4 bg-muted/30 border border-border/80 rounded-xl space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-secondary font-bold text-xs sm:text-sm border-b border-border/60 pb-2">
            <DollarSign className="h-4 w-4" />
            <span>Pricing, Payout &amp; Location</span>
          </div>
          <div className="text-xs space-y-2">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">Selling Price</span>
              <span className="font-bold font-mono text-base sm:text-lg text-foreground">₹{Number(values.price || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">Shipping</span>
              <span className="font-semibold text-xs text-foreground">
                {values.freeShipping ? 'Free Delivery to Buyer' : `Buyer pays (₹${values.shippingFee || 0})`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">Payout Method</span>
              <span className="font-mono font-bold text-xs text-foreground uppercase">
                {values.preferredPayment === 'upi' ? `UPI (${values.upiId || 'Not set'})` : `Bank NEFT (${values.bankName || 'Not set'})`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">Seller Contact</span>
              <span className="font-semibold text-xs text-foreground">{values.sellerName || 'Seller'} {values.sellerPhone ? `• ${values.sellerPhone}` : ''}</span>
            </div>
            <div className="flex items-start gap-1.5 pt-0.5">
              <MapPin className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-foreground block">
                  {values.city || 'City'}, {values.state || 'State'} ({values.pincode || 'Pincode'})
                </span>
                {values.pickupAddress && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{values.pickupAddress}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Policies Checkboxes */}
      <div className="space-y-2.5 pt-3 border-t border-border/80 select-none">
        <label className="flex items-start gap-2.5 text-xs font-medium cursor-pointer p-2.5 sm:p-3 rounded-xl bg-muted/20 border border-border/80 hover:border-secondary/50 transition-colors">
          <input
            type="checkbox"
            {...register('confirmOwnership')}
            className="accent-secondary h-4 w-4 rounded mt-0.5 shrink-0"
          />
          <span className="text-foreground leading-snug text-[11px] sm:text-xs">
            I confirm that I own this book and that its condition accurately matches the grade and notes specified.
          </span>
        </label>
        {errors.confirmOwnership && (
          <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 pl-1">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errors.confirmOwnership.message}</span>
          </p>
        )}

        <label className="flex items-start gap-2.5 text-xs font-medium cursor-pointer p-2.5 sm:p-3 rounded-xl bg-muted/20 border border-border/80 hover:border-secondary/50 transition-colors">
          <input
            type="checkbox"
            {...register('agreePolicy')}
            className="accent-secondary h-4 w-4 rounded mt-0.5 shrink-0"
          />
          <span className="text-foreground leading-snug text-[11px] sm:text-xs">
            I agree to the BookFry Marketplace Seller Policies, Escrow Terms, 10% platform fee, and payout schedules.
          </span>
        </label>
        {errors.agreePolicy && (
          <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 pl-1">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errors.agreePolicy.message}</span>
          </p>
        )}
      </div>

      {/* Seller Protection Assurance */}
      <div className="p-3 sm:p-3.5 bg-muted/40 border border-border/80 rounded-xl flex items-center gap-2.5 text-[11px] sm:text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-secondary shrink-0" />
        <span>
          <strong className="text-foreground">100% Escrow Protection:</strong> Payment is secured in escrow and deposited into your account immediately upon delivery verification.
        </span>
      </div>
    </div>
  );
}

export default ReviewTab;
