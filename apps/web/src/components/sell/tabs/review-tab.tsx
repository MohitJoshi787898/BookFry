'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SellBookFormData } from '@/lib/validations/sell-form.schema';
import { ShieldCheck, AlertCircle, MapPin, DollarSign, BookOpen } from 'lucide-react';

interface ReviewTabProps {
  form: UseFormReturn<SellBookFormData>;
}

export function ReviewTab({ form }: ReviewTabProps) {
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

  const imageCount = values.images?.length || 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
          Step 6: Review Listing &amp; Declaration
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Review all information carefully before publishing your book to the BookFry marketplace.
        </p>
      </div>

      {/* Structured Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Book & Condition Card */}
        <div className="p-4 sm:p-6 bg-card border border-border rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-secondary font-bold text-sm sm:text-base border-b border-border pb-3">
            <BookOpen className="h-5 w-5" />
            <span>Book &amp; Condition Details</span>
          </div>
          <div className="text-xs sm:text-sm space-y-3">
            <div>
              <span className="text-muted-foreground block text-xs">Title:</span>
              <span className="font-bold text-base sm:text-lg text-foreground">{values.title || 'Untitled'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Author:</span>
              <span className="font-semibold text-sm sm:text-base text-foreground">{values.author || 'Not specified'}</span>
            </div>
            {values.isbn && (
              <div>
                <span className="text-muted-foreground block text-xs">ISBN:</span>
                <span className="font-mono font-medium text-foreground">{values.isbn}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground block text-xs">Condition:</span>
              <span className="font-bold text-sm sm:text-base text-secondary">{conditionLabels[values.condition] || values.condition}</span>
            </div>
            {values.conditionNotes && (
              <div>
                <span className="text-muted-foreground block text-xs">Condition Notes:</span>
                <p className="italic text-muted-foreground bg-muted/40 p-3 rounded-xl mt-1 text-xs sm:text-sm">&ldquo;{values.conditionNotes}&rdquo;</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground block text-xs">Photos Uploaded:</span>
              <span className="font-bold text-foreground">{imageCount} {imageCount === 1 ? 'photo' : 'photos'}</span>
            </div>
          </div>
        </div>

        {/* Pricing, Payout & Location Card */}
        <div className="p-4 sm:p-6 bg-card border border-border rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-secondary font-bold text-sm sm:text-base border-b border-border pb-3">
            <DollarSign className="h-5 w-5" />
            <span>Pricing, Payout &amp; Location</span>
          </div>
          <div className="text-xs sm:text-sm space-y-3">
            <div>
              <span className="text-muted-foreground block text-xs">Selling Price:</span>
              <span className="font-bold font-mono text-xl sm:text-2xl text-foreground">₹{Number(values.price || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Shipping:</span>
              <span className="font-semibold text-foreground">
                {values.freeShipping ? 'Free Delivery to Buyer' : `Buyer pays (₹${values.shippingFee || 0})`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Payout Method:</span>
              <span className="font-mono font-bold text-foreground uppercase">
                {values.preferredPayment === 'upi' ? `UPI (${values.upiId || 'Not set'})` : `Bank NEFT (${values.bankName || 'Not set'})`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Seller Name &amp; Contact:</span>
              <span className="font-semibold text-foreground">{values.sellerName} • {values.sellerPhone}</span>
            </div>
            <div className="flex items-start gap-1.5 pt-1">
              <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">
                  {values.city || 'City'}, {values.state || 'State'} ({values.pincode || 'Pincode'})
                </span>
                {values.pickupAddress && (
                  <p className="text-xs text-muted-foreground mt-1">{values.pickupAddress}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Policies Checkboxes */}
      <div className="space-y-4 pt-4 border-t border-border select-none">
        <label className="flex items-start gap-3.5 text-xs sm:text-sm font-medium cursor-pointer p-3 rounded-xl bg-card border border-border hover:border-secondary/50 transition-colors min-h-[48px]">
          <input
            type="checkbox"
            {...register('confirmOwnership')}
            className="accent-secondary h-5 w-5 rounded mt-0.5 shrink-0"
          />
          <span className="text-foreground leading-snug">
            I confirm that I own this book and that its condition accurately matches the grade and notes specified.
          </span>
        </label>
        {errors.confirmOwnership && (
          <p className="text-xs sm:text-sm text-rose-500 font-medium flex items-center gap-1.5 pl-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.confirmOwnership.message}</span>
          </p>
        )}

        <label className="flex items-start gap-3.5 text-xs sm:text-sm font-medium cursor-pointer p-3 rounded-xl bg-card border border-border hover:border-secondary/50 transition-colors min-h-[48px]">
          <input
            type="checkbox"
            {...register('agreePolicy')}
            className="accent-secondary h-5 w-5 rounded mt-0.5 shrink-0"
          />
          <span className="text-foreground leading-snug">
            I agree to the BookFry Marketplace Seller Policies, Escrow Terms, 10% platform fee, and payout schedules.
          </span>
        </label>
        {errors.agreePolicy && (
          <p className="text-xs sm:text-sm text-rose-500 font-medium flex items-center gap-1.5 pl-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.agreePolicy.message}</span>
          </p>
        )}
      </div>

      {/* Seller Protection Assurance */}
      <div className="p-4 sm:p-5 bg-muted/40 border border-border rounded-2xl flex items-center gap-3.5 text-xs sm:text-sm text-muted-foreground">
        <ShieldCheck className="h-6 w-6 text-secondary shrink-0" />
        <span>
          <strong className="text-foreground">100% Escrow Protection:</strong> Once a buyer orders your book, payment is secured in escrow and deposited into your account immediately upon successful delivery verification.
        </span>
      </div>
    </div>
  );
}

export default ReviewTab;
