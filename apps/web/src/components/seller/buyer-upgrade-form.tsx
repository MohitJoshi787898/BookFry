'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import {
  Store,
  Phone,
  CreditCard,
  MapPin,
  Compass,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

const upgradeSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  bio: z.string().optional(),
  phone: z.string().min(10, 'Enter a valid 10-digit mobile number'),
  upiId: z.string().min(3, 'Enter a valid UPI ID (e.g. name@upi)'),
  collegeName: z.string().optional(),
  courseYear: z.string().optional(),
  street: z.string().min(3, 'Street/Hostel address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(6, 'PIN code must be 6 digits').max(6, 'PIN code must be 6 digits'),
});

type UpgradeFormData = z.infer<typeof upgradeSchema>;

export function BuyerUpgradeForm() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpgradeFormData>({
    resolver: zodResolver(upgradeSchema),
    defaultValues: {
      storeName: user?.sellerProfile?.storeName || `${user?.name || 'My'}'s Campus Books`,
      bio: user?.sellerProfile?.bio || '',
      phone: user?.phone || '',
      upiId: user?.sellerProfile?.payoutDetails?.upiId || '',
    },
  });

  useEffect(() => {
    if (user) {
      if (user.phone) setValue('phone', user.phone);
      if (user.sellerProfile?.storeName) setValue('storeName', user.sellerProfile.storeName);
      if (user.sellerProfile?.bio) setValue('bio', user.sellerProfile.bio);
      if (user.sellerProfile?.payoutDetails?.upiId) {
        setValue('upiId', user.sellerProfile.payoutDetails.upiId);
      }
      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        if (defaultAddr.street) setValue('street', defaultAddr.street);
        if (defaultAddr.city) setValue('city', defaultAddr.city);
        if (defaultAddr.state) setValue('state', defaultAddr.state);
        if (defaultAddr.zipCode) setValue('zipCode', defaultAddr.zipCode);
      }
    }
  }, [user, setValue]);

  const handleGPSAutofill = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await apiClient<{
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
          }>(`/users/reverse-geocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          if (res) {
            if (res.city) setValue('city', res.city, { shouldValidate: true });
            if (res.state) setValue('state', res.state, { shouldValidate: true });
            if (res.zipCode) setValue('zipCode', res.zipCode, { shouldValidate: true });
            if (res.street) setValue('street', res.street, { shouldValidate: true });
            setLocationSuccess(true);
          }
        } finally {
          setIsLocating(false);
        }
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSubmit = async (values: UpgradeFormData) => {
    setApiError(null);
    try {
      const updatedUser = await apiClient('/users/seller-profile', {
        method: 'PATCH',
        body: JSON.stringify(values),
      });

      setUser(updatedUser);
      setSuccess(true);
      setTimeout(() => {
        router.push('/seller/dashboard');
      }, 1200);
    } catch (err) {
      const error = err as Error;
      setApiError(error.message || 'Failed to update seller profile. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center font-sans">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 mb-3">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="font-serif text-2xl font-extrabold text-foreground">
          Bookstore Activated! 🎉
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Your seller account is ready. Redirecting you to your Seller Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Personalized Welcome Callout */}
      <div className="p-4 rounded-3xl bg-secondary/10 border border-secondary/25 flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-secondary text-white flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-foreground">
            Welcome, {user?.name || 'Reader'}! Ready to start selling?
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            You are logged in with <strong>{user?.email}</strong>. Simply set up your store name and UPI payout ID to activate your seller privileges. No duplicate account needed.
          </p>
        </div>
      </div>

      {apiError && (
        <div role="alert" className="p-3.5 rounded-2xl border border-danger/25 bg-danger/10 text-xs font-bold text-danger flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Storefront Section */}
        <section className="border border-border rounded-3xl p-5 bg-card shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <Store className="h-4 w-4 text-secondary" />
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Store Identity</h4>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">Bookstore Display Name *</label>
            <input
              type="text"
              placeholder="e.g. Rahul's Campus Books"
              {...register('storeName')}
              className="w-full h-11 px-3.5 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
            />
            {errors.storeName && <p className="text-[10px] font-bold text-danger mt-0.5">{errors.storeName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">College / Institution</label>
              <input
                type="text"
                placeholder="e.g. IIT Delhi, DU"
                {...register('collegeName')}
                className="w-full h-11 px-3.5 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">Course / Semester</label>
              <input
                type="text"
                placeholder="e.g. 3rd Year, Sem 5"
                {...register('courseYear')}
                className="w-full h-11 px-3.5 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">Storefront Bio</label>
            <textarea
              rows={2}
              placeholder="Tell student buyers what categories or subjects you offer..."
              {...register('bio')}
              className="w-full p-3 text-xs font-bold bg-background border border-border rounded-xl text-foreground resize-none"
            />
          </div>
        </section>

        {/* Contact & Payout Section */}
        <section className="border border-border rounded-3xl p-5 bg-card shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <CreditCard className="h-4 w-4 text-secondary" />
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Mobile & Instant UPI Payout</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">WhatsApp / Phone *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="10-digit mobile"
                  {...register('phone')}
                  className="w-full h-11 pl-10 pr-3.5 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
                />
              </div>
              {errors.phone && <p className="text-[10px] font-bold text-danger mt-0.5">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">UPI ID * (for earnings)</label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="name@okaxis or mobile@upi"
                  {...register('upiId')}
                  className="w-full h-11 pl-10 pr-3.5 text-xs font-mono font-bold bg-background border border-border rounded-xl text-foreground"
                />
              </div>
              {errors.upiId && <p className="text-[10px] font-bold text-danger mt-0.5">{errors.upiId.message}</p>}
            </div>
          </div>
        </section>

        {/* Pickup Address Section */}
        <section className="border border-border rounded-3xl p-5 bg-card shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary" />
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Book Pickup Address</h4>
            </div>
            <button
              type="button"
              onClick={handleGPSAutofill}
              disabled={isLocating}
              className="px-3 py-1 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{isLocating ? 'Locating...' : 'Auto-Fill (GPS)'}</span>
            </button>
          </div>

          {locationSuccess && (
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Location auto-filled via current GPS coordinates!</span>
            </p>
          )}

          <div>
            <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">Street / Hostel / Room *</label>
            <input
              type="text"
              placeholder="e.g. Hostel C, Room 204"
              {...register('street')}
              className="w-full h-11 px-3.5 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
            />
            {errors.street && <p className="text-[10px] font-bold text-danger mt-0.5">{errors.street.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">City *</label>
              <input
                type="text"
                placeholder="New Delhi"
                {...register('city')}
                className="w-full h-11 px-3 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
              />
              {errors.city && <p className="text-[10px] font-bold text-danger mt-0.5">{errors.city.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">State *</label>
              <input
                type="text"
                placeholder="Delhi"
                {...register('state')}
                className="w-full h-11 px-3 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
              />
              {errors.state && <p className="text-[10px] font-bold text-danger mt-0.5">{errors.state.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">PIN Code *</label>
              <input
                type="text"
                maxLength={6}
                placeholder="110001"
                {...register('zipCode')}
                className="w-full h-11 px-3 font-mono text-xs font-bold bg-background border border-border rounded-xl text-foreground"
              />
              {errors.zipCode && <p className="text-[10px] font-bold text-danger mt-0.5">{errors.zipCode.message}</p>}
            </div>
          </div>
        </section>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Activating Bookstore...</span>
            </>
          ) : (
            <>
              <span>Save & Launch Seller Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}

export default BuyerUpgradeForm;
