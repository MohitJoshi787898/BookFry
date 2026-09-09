'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { apiClient } from '@/lib/api-client';
import { SellerLayout } from '@/components/seller/seller-layout';
import {
  Store,
  Phone,
  CreditCard,
  MapPin,
  Compass,
  BookOpen,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const sellerProfileSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  bio: z.string().optional(),
  phone: z.string().min(10, 'Enter a valid 10-digit phone number'),
  upiId: z.string().min(3, 'Enter a valid UPI ID'),
  collegeName: z.string().optional(),
  courseYear: z.string().optional(),
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(6, 'Enter a valid 6-digit PIN code').max(6, 'PIN code must be 6 digits'),
});

type SellerProfileFormData = z.infer<typeof sellerProfileSchema>;

export default function SellerRegisterPage() {
  const router = useRouter();
  const { isAuthenticated, user, setUser } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<SellerProfileFormData>({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: {
      storeName: user?.sellerProfile?.storeName || '',
      bio: user?.sellerProfile?.bio || '',
      phone: user?.phone || '',
    },
  });

  const handleGPSAutofill = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await apiClient<{
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
          }>(`/users/reverse-geocode?lat=${latitude}&lon=${longitude}`);

          if (res) {
            if (res.city) setValue('city', res.city, { shouldValidate: true });
            if (res.state) setValue('state', res.state, { shouldValidate: true });
            if (res.zipCode) setValue('zipCode', res.zipCode, { shouldValidate: true });
            if (res.street) setValue('street', res.street, { shouldValidate: true });
            setLocationSuccess(true);
          }
        } catch {
          setLocationError('Could not fetch address details via GPS. Please enter manually.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. You can type your address manually.'
            : 'GPS location error. Please enter manually.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Pre-fill form fields from existing user data
  useEffect(() => {
    if (user) {
      if (user.sellerProfile?.storeName) setValue('storeName', user.sellerProfile.storeName);
      if (user.sellerProfile?.bio) setValue('bio', user.sellerProfile.bio);
      if (user.phone) setValue('phone', user.phone);
      if (user.sellerProfile?.payoutDetails?.upiId) {
        setValue('upiId', user.sellerProfile.payoutDetails.upiId);
      }
      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        setValue('street', defaultAddr.street || '');
        setValue('city', defaultAddr.city || '');
        setValue('state', defaultAddr.state || '');
        setValue('zipCode', defaultAddr.zipCode || '');
      }
    }
  }, [user, setValue]);

  // If not authenticated, prompt login
  if (!isAuthenticated) {
    return (
      <SellerLayout>
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 font-sans">
          <Store className="h-12 w-12 text-secondary/50" />
          <h2 className="font-serif text-xl font-bold text-foreground">
            Sign In to Complete Your Seller Setup
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            You need to be logged in to complete your seller profile.
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => openModal('login', '/seller/register')}
            className="px-5 py-2.5 bg-secondary text-white rounded-2xl text-sm font-bold shadow-md"
          >
            Sign In →
          </motion.button>
        </div>
      </SellerLayout>
    );
  }

  // If seller onboarding is already complete, redirect to dashboard
  if (user?.sellerOnboardingStatus === 'complete') {
    router.replace('/seller/dashboard');
    return null;
  }

  const onSubmit = async (values: SellerProfileFormData) => {
    setApiError(null);
    try {
      // PATCH /users/seller-profile — the correct, existing endpoint
      const updatedUser = await apiClient('/users/seller-profile', {
        method: 'PATCH',
        body: JSON.stringify({
          storeName: values.storeName,
          bio: values.bio,
          phone: values.phone,
          upiId: values.upiId,
          collegeName: values.collegeName,
          courseYear: values.courseYear,
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
        }),
      });

      // Update the auth store with the fresh user profile
      setUser(updatedUser);
      setSuccess(true);

      // Brief success display then redirect to dashboard
      setTimeout(() => {
        router.push('/seller/dashboard');
      }, 1500);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setApiError(error.message || 'Failed to save your seller profile. Please try again.');
    }
  };

  if (success) {
    return (
      <SellerLayout>
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 font-sans text-center">
          <div className="h-14 w-14 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Seller Profile Complete! 🎉
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your store is set up. Redirecting you to your Seller Hub...
          </p>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-2xl mx-auto space-y-6 font-sans pb-16">
        {/* Page Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-extrabold uppercase tracking-wider mb-2">
            <Store className="h-3 w-3" />
            <span>Seller Setup</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Complete Your Seller Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in your store details, UPI ID, and pickup address to start selling on BookFry.
          </p>
        </div>

        {apiError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-2xl border border-danger/25 bg-danger/10 p-3 text-xs font-bold text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Store Info */}
          <section className="border border-border/80 rounded-3xl p-5 sm:p-6 bg-card shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <BookOpen className="h-4 w-4 text-secondary" />
              <h2 className="text-sm font-extrabold text-foreground">Store Information</h2>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Store Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul's Engineering Books"
                {...register('storeName')}
                className="w-full h-11 px-3.5 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none"
              />
              {errors.storeName && (
                <p className="text-[10px] font-bold text-danger">{errors.storeName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Store Bio / Description
              </label>
              <textarea
                rows={3}
                placeholder="Tell buyers what kind of books you sell, your college, etc."
                {...register('bio')}
                className="w-full px-3.5 py-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  College / Institution
                </label>
                <input
                  type="text"
                  placeholder="e.g. IIT Delhi"
                  {...register('collegeName')}
                  className="w-full h-11 px-3.5 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  Current Year / Semester
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3rd Year, Sem 5"
                  {...register('courseYear')}
                  className="w-full h-11 px-3.5 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none"
                />
              </div>
            </div>
          </section>

          {/* Contact & Payout */}
          <section className="border border-border/80 rounded-3xl p-5 sm:p-6 bg-card shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <CreditCard className="h-4 w-4 text-secondary" />
              <h2 className="text-sm font-extrabold text-foreground">Contact & Instant Payout</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    {...register('phone')}
                    className="w-full h-11 pl-10 pr-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none"
                  />
                </div>
                {errors.phone && (
                  <p className="text-[10px] font-bold text-danger">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  UPI ID * <span className="text-[9px] normal-case">(for instant payouts)</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    {...register('upiId')}
                    className="w-full h-11 pl-10 pr-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none"
                  />
                </div>
                {errors.upiId && (
                  <p className="text-[10px] font-bold text-danger">{errors.upiId.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Pickup Address */}
          <section className="border border-border/80 rounded-3xl p-5 sm:p-6 bg-card shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <h2 className="text-sm font-extrabold text-foreground">Book Pickup Address & Campus Location</h2>
              </div>

              <button
                type="button"
                onClick={handleGPSAutofill}
                disabled={isLocating}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold transition-all border border-secondary/25 cursor-pointer disabled:opacity-50"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <Compass className="h-3.5 w-3.5" />
                    <span>Auto-Fill with GPS</span>
                  </>
                )}
              </button>
            </div>

            {locationSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Pickup address auto-filled using your current GPS coordinates!</span>
              </div>
            )}

            {locationError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{locationError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Street / Hostel / Room Number *
              </label>
              <input
                type="text"
                placeholder="e.g. Hostel C, Room 204"
                {...register('street')}
                className="w-full h-11 px-3.5 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none"
              />
              {errors.street && (
                <p className="text-[10px] font-bold text-danger">{errors.street.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  City *
                </label>
                <input
                  type="text"
                  placeholder="New Delhi"
                  {...register('city')}
                  className="w-full h-11 px-3.5 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none"
                />
                {errors.city && (
                  <p className="text-[10px] font-bold text-danger">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  State *
                </label>
                <input
                  type="text"
                  placeholder="Delhi"
                  {...register('state')}
                  className="w-full h-11 px-3.5 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none"
                />
                {errors.state && (
                  <p className="text-[10px] font-bold text-danger">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  PIN Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="110001"
                  {...register('zipCode')}
                  className="w-full h-11 px-3.5 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none"
                />
                {errors.zipCode && (
                  <p className="text-[10px] font-bold text-danger">{errors.zipCode.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSubmitting}
            className="flex w-full h-12 items-center justify-center gap-2 rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Save & Go to Seller Hub</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </form>
      </div>
    </SellerLayout>
  );
}
