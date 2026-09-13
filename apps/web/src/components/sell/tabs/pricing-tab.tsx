'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SellBookFormData } from '@/lib/validations/sell-form.schema';
import { EarningsCalculatorCard } from '@/components/sell/earnings-calculator-card';

interface PricingTabProps {
  form: UseFormReturn<SellBookFormData>;
}

export function PricingTab({ form }: PricingTabProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const formValues = watch();

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
          Step 3: Pricing &amp; Payout Setup
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Set your competitive selling price. BookFry deposits payments directly into your UPI or bank account upon order delivery.
        </p>
      </div>

      {/* Price & Shipping Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* Price Input */}
        <div className="space-y-2">
          <label htmlFor="selling-price" className="text-sm sm:text-base font-bold text-foreground flex items-center gap-1">
            Selling Price (₹) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
              ₹
            </span>
            <input
              id="selling-price"
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 450"
              {...register('price')}
              className="w-full pl-9 pr-4 py-3 sm:py-3.5 text-lg font-bold font-mono bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Recommended: 40%–60% of publisher MRP for fastest sales.</p>
          {errors.price && <p className="text-xs text-rose-500 font-medium">{errors.price.message}</p>}
        </div>

        {/* Shipping Option */}
        <div className="space-y-2">
          <label className="text-sm sm:text-base font-bold text-foreground block">
            Shipping Preference
          </label>
          <label className="flex items-center gap-3.5 p-3.5 sm:p-4 border border-border rounded-xl bg-muted/30 cursor-pointer select-none hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              {...register('freeShipping')}
              className="accent-secondary h-5 w-5 rounded"
            />
            <div>
              <span className="text-sm sm:text-base font-bold text-foreground block">Free Delivery to Buyer</span>
              <span className="text-xs sm:text-sm text-muted-foreground block mt-0.5">Listings with free delivery sell 2.5x faster</span>
            </div>
          </label>
        </div>
      </div>

      {/* Dynamic Earnings Breakdown Card */}
      <EarningsCalculatorCard
        price={Number(formValues.price) || 0}
        freeShipping={formValues.freeShipping}
        shippingFee={Number(formValues.shippingFee) || 0}
      />

      {/* Payout Details Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-foreground">Direct Payout Channel</h4>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Where BookFry should disburse your earnings.</p>
        </div>

        {/* Radio Methods */}
        <div className="flex flex-wrap items-center gap-6 text-sm sm:text-base font-medium">
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-foreground">
            <input
              type="radio"
              value="upi"
              {...register('preferredPayment')}
              className="accent-secondary h-4 w-4"
            />
            <span className="font-semibold">UPI Instant Transfer (VPA)</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-foreground">
            <input
              type="radio"
              value="bank"
              {...register('preferredPayment')}
              className="accent-secondary h-4 w-4"
            />
            <span className="font-semibold">Bank Account (NEFT / IMPS)</span>
          </label>
        </div>

        {/* UPI Input */}
        {formValues.preferredPayment === 'upi' && (
          <div className="space-y-2 max-w-md p-4 sm:p-5 bg-muted/30 border border-border rounded-2xl">
            <label htmlFor="upi-id" className="text-xs sm:text-sm font-bold text-foreground block">
              UPI ID (Virtual Payment Address) <span className="text-rose-500">*</span>
            </label>
            <input
              id="upi-id"
              type="text"
              placeholder="e.g. mobile@okaxis or name@upi"
              {...register('upiId')}
              className="w-full px-4 py-3 text-base border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary font-mono"
            />
            {errors.upiId && <p className="text-xs text-rose-500 font-medium">{errors.upiId.message}</p>}
          </div>
        )}

        {/* Bank Details Inputs */}
        {formValues.preferredPayment === 'bank' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-muted/30 border border-border rounded-2xl">
            <div className="space-y-2">
              <label htmlFor="account-holder" className="text-xs sm:text-sm font-bold text-foreground block">
                Account Holder Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="account-holder"
                type="text"
                placeholder="Name as per bank records"
                {...register('accountHolder')}
                className="w-full px-4 py-3 text-base border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="bank-name" className="text-xs sm:text-sm font-bold text-foreground block">
                Bank Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="bank-name"
                type="text"
                placeholder="e.g. State Bank of India, HDFC"
                {...register('bankName')}
                className="w-full px-4 py-3 text-base border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="account-number" className="text-xs sm:text-sm font-bold text-foreground block">
                Account Number <span className="text-rose-500">*</span>
              </label>
              <input
                id="account-number"
                type="text"
                placeholder="e.g. 50100239102"
                {...register('accountNumber')}
                className="w-full px-4 py-3 text-base border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary font-mono"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="ifsc-code" className="text-xs sm:text-sm font-bold text-foreground block">
                IFSC Code <span className="text-rose-500">*</span>
              </label>
              <input
                id="ifsc-code"
                type="text"
                placeholder="e.g. SBIN0001234"
                {...register('ifscCode')}
                className="w-full px-4 py-3 text-base border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary font-mono uppercase"
              />
            </div>

            {errors.ifscCode && (
              <p className="text-xs text-rose-500 font-medium sm:col-span-2">{errors.ifscCode.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PricingTab;
