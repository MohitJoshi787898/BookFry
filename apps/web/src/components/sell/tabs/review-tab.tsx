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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Book & Condition Card */}
        <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-secondary font-bold text-sm border-b border-border pb-2">
            <BookOpen className="h-4 w-4" />
            <span>Book &amp; Condition Details</span>
          </div>
          <div className="text-xs space-y-2">
            <div>
              <span className="text-muted-foreground block">Title:</span>
              <span className="font-bold text-sm text-foreground">{values.title || 'Untitled'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Author:</span>
              <span className="font-medium text-foreground">{values.author || 'Not specified'}</span>
            </div>
            {values.isbn && (
              <div>
                <span className="text-muted-foreground block">ISBN:</span>
                <span className="font-mono text-foreground">{values.isbn}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground block">Condition:</span>
              <span className="font-bold text-secondary">{conditionLabels[values.condition] || values.condition}</span>
            </div>
            {values.conditionNotes && (
              <div>
                <span className="text-muted-foreground block">Condition Notes:</span>
                <p className="italic text-muted-foreground bg-muted/40 p-2 rounded-lg mt-0.5">&ldquo;{values.conditionNotes}&rdquo;</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground block">Photos Uploaded:</span>
              <span className="font-semibold text-foreground">{imageCount} {imageCount === 1 ? 'photo' : 'photos'}</span>
            </div>
          </div>
        </div>

        {/* Pricing, Payout & Location Card */}
        <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-secondary font-bold text-sm border-b border-border pb-2">
            <DollarSign className="h-4 w-4" />
            <span>Pricing, Payout &amp; Location</span>
          </div>
          <div className="text-xs space-y-2">
            <div>
              <span className="text-muted-foreground block">Selling Price:</span>
              <span className="font-bold font-mono text-base text-foreground">₹{Number(values.price || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Shipping:</span>
              <span className="font-semibold text-foreground">
                {values.freeShipping ? 'Free Delivery to Buyer' : `Buyer pays (₹${values.shippingFee || 0})`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Payout Method:</span>
              <span className="font-mono font-semibold text-foreground uppercase">
                {values.preferredPayment === 'upi' ? `UPI (${values.upiId || 'Not set'})` : `Bank NEFT (${values.bankName || 'Not set'})`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Seller Name &amp; Contact:</span>
              <span className="font-semibold text-foreground">{values.sellerName} • {values.sellerPhone}</span>
            </div>
            <div className="flex items-start gap-1">
              <MapPin className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">
                  {values.city || 'City'}, {values.state || 'State'} ({values.pincode || 'Pincode'})
                </span>
                {values.pickupAddress && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{values.pickupAddress}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Policies Checkboxes */}
      <div className="space-y-3.5 pt-4 border-t border-border select-none">
        <label className="flex items-start gap-3 text-xs sm:text-sm font-medium cursor-pointer">
          <input
            type="checkbox"
            {...register('confirmOwnership')}
            className="accent-secondary h-4 w-4 rounded mt-0.5"
          />
          <span className="text-foreground">
            I confirm that I own this book and that its condition accurately matches the grade and notes specified.
          </span>
        </label>
        {errors.confirmOwnership && (
          <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errors.confirmOwnership.message}</span>
          </p>
        )}

        <label className="flex items-start gap-3 text-xs sm:text-sm font-medium cursor-pointer">
          <input
            type="checkbox"
            {...register('agreePolicy')}
            className="accent-secondary h-4 w-4 rounded mt-0.5"
          />
          <span className="text-foreground">
            I agree to the BookFry Marketplace Seller Policies, Escrow Terms, 10% platform fee, and payout schedules.
          </span>
        </label>
        {errors.agreePolicy && (
          <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errors.agreePolicy.message}</span>
          </p>
        )}
      </div>

      {/* Seller Protection Assurance */}
      <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center gap-3 text-xs text-muted-foreground">
        <ShieldCheck className="h-5 w-5 text-secondary shrink-0" />
        <span>
          <strong>100% Escrow Protection:</strong> Once a buyer orders your book, payment is secured in escrow and deposited into your account immediately upon successful delivery verification.
        </span>
      </div>
    </div>
  );
}

export default ReviewTab;
