'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SellBookFormData } from '@/lib/validations/sell-form.schema';

interface InventoryTabProps {
  form: UseFormReturn<SellBookFormData>;
}

export function InventoryTab({ form }: InventoryTabProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
          Step 4: Inventory &amp; Pickup Location
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Specify available stock and where our verified logistics partner can collect the package.
        </p>
      </div>

      {/* Stock Quantity */}
      <div className="space-y-1.5">
        <label htmlFor="stock-quantity" className="text-sm font-semibold text-foreground flex items-center gap-1">
          Available Copies for Sale <span className="text-rose-500">*</span>
        </label>
        <input
          id="stock-quantity"
          type="number"
          min={1}
          max={100}
          {...register('quantity')}
          className="w-full max-w-[200px] px-3.5 py-2.5 sm:py-3 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary font-mono font-bold"
        />
        <p className="text-xs text-muted-foreground">Most individual sellers list 1 copy. Batch sellers can list up to 100.</p>
        {errors.quantity && <p className="text-xs text-rose-500 font-medium">{errors.quantity.message}</p>}
      </div>

      {/* Seller Contact Details */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Seller Verification &amp; Contact</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Used for order tracking, buyer dispatch notices, and dispute safety.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <label htmlFor="seller-name" className="text-sm font-semibold text-foreground flex items-center gap-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="seller-name"
              type="text"
              placeholder="Your full name"
              {...register('sellerName')}
              className="w-full px-3.5 py-2.5 sm:py-3 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {errors.sellerName && <p className="text-xs text-rose-500 font-medium">{errors.sellerName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="seller-email" className="text-sm font-semibold text-foreground flex items-center gap-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              id="seller-email"
              type="email"
              placeholder="name@domain.com"
              {...register('sellerEmail')}
              className="w-full px-3.5 py-2.5 sm:py-3 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {errors.sellerEmail && <p className="text-xs text-rose-500 font-medium">{errors.sellerEmail.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="seller-phone" className="text-sm font-semibold text-foreground flex items-center gap-1">
              WhatsApp / Mobile Number <span className="text-rose-500">*</span>
            </label>
            <input
              id="seller-phone"
              type="tel"
              placeholder="10-digit mobile number"
              {...register('sellerPhone')}
              className="w-full px-3.5 py-2.5 sm:py-3 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary font-mono"
            />
            {errors.sellerPhone && <p className="text-xs text-rose-500 font-medium">{errors.sellerPhone.message}</p>}
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('hidePhone')}
                className="accent-secondary h-4 w-4 rounded"
              />
              <span>Hide my WhatsApp from public ad details</span>
            </label>
          </div>
        </div>
      </div>

      {/* Pickup Location Details */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Pickup Location &amp; Courier Dispatch</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Where our courier partner will collect the book once ordered.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="pickup-pincode" className="text-sm font-semibold text-foreground flex items-center gap-1">
              Pincode <span className="text-rose-500">*</span>
            </label>
            <input
              id="pickup-pincode"
              type="text"
              maxLength={6}
              placeholder="e.g. 110001"
              {...register('pincode')}
              className="w-full px-3.5 py-2.5 sm:py-3 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary font-mono"
            />
            {errors.pincode && <p className="text-xs text-rose-500 font-medium">{errors.pincode.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pickup-city" className="text-sm font-semibold text-foreground flex items-center gap-1">
              City / District <span className="text-rose-500">*</span>
            </label>
            <input
              id="pickup-city"
              type="text"
              placeholder="Auto-filled city"
              {...register('city')}
              className="w-full px-3.5 py-2.5 sm:py-3 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {errors.city && <p className="text-xs text-rose-500 font-medium">{errors.city.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pickup-state" className="text-sm font-semibold text-foreground flex items-center gap-1">
              State <span className="text-rose-500">*</span>
            </label>
            <input
              id="pickup-state"
              type="text"
              placeholder="Auto-filled state"
              {...register('state')}
              className="w-full px-3.5 py-2.5 sm:py-3 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {errors.state && <p className="text-xs text-rose-500 font-medium">{errors.state.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <label htmlFor="pickup-address" className="text-sm font-semibold text-foreground block">
            Complete Street / Campus Address (Private)
          </label>
          <textarea
            id="pickup-address"
            rows={3}
            placeholder="Hostel / Flat No, Street, Landmark, College Campus..."
            {...register('pickupAddress')}
            className="w-full px-3.5 py-2.5 sm:py-3 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary leading-relaxed"
          />
          <p className="text-xs text-muted-foreground">
            Shared privately only with verified delivery couriers once a buyer completes payment.
          </p>
        </div>
      </div>
    </div>
  );
}

export default InventoryTab;
