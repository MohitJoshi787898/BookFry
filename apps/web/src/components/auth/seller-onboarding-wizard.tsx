'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupFormData } from '@/lib/validations/auth-schemas';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { PasswordStrength } from './password-strength';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Store,
  Phone,
  CreditCard,
  Building2,
  CheckCircle2,
  MapPin,
  Compass,
  GraduationCap,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SellerOnboardingWizard() {
  const { closeModal, setUserEmail, setScreen } = useAuthModalStore();
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      agreeTerms: true,
    },
    mode: 'onChange',
  });

  const passwordValue = watch('password');
  const nameValue = watch('name');

  const nextStep = async () => {
    setApiError(null);
    if (step === 1) {
      const isValid = await trigger(['name', 'email', 'password', 'confirmPassword', 'phone']);
      if (isValid) setStep(2);
    } else if (step === 2) {
      const isValid = await trigger(['storeName']);
      if (isValid) setStep(3);
    }
  };

  const prevStep = () => {
    setApiError(null);
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  // Browser Geolocation Auto-Detection with Reverse Geocoding
  const handleFetchCurrentLocation = () => {
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
          setLocationError('Could not fetch address details for this location. Please enter manually.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. You can manually enter your city & pincode.');
        } else {
          setLocationError('GPS signal timed out. Please enter your pickup address manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const onSubmit = async (values: SignupFormData) => {
    setApiError(null);
    try {
      const data = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          roles: ['customer', 'seller'],
          phone: values.phone,
          storeName: values.storeName || `${values.name}'s Books`,
          bio: values.bio,
          upiId: values.upiId,
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
        }),
      });

      // Synchronize authenticated user and persistent cart
      setAuth(data.user, data.accessToken);
      await useCartStore.getState().syncCart();
      setUserEmail(values.email);

      // Close modal cleanly and route seller to their configured dashboard hub
      closeModal();
      router.push('/seller/dashboard');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setApiError(error.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Premium Header with Mascot & Badges */}
      <div className="flex items-start gap-3.5">
        <div className="h-14 w-14 rounded-2xl bg-secondary/10 border border-secondary/25 p-1.5 shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/create-account.png" alt="BookFry Mascot" className="w-full h-full object-contain" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-[10px] font-black uppercase tracking-wider">
              <Store className="h-3 w-3" />
              <span>Campus Seller Registration</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              <span>Zero Listing Fee</span>
            </span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-none">
            {step === 1 && 'Create Seller Account'}
            {step === 2 && 'Set Up Your Book Store'}
            {step === 3 && 'Pickup & Instant Payout'}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            {step === 1 && 'Step 1 of 3: Enter your name, mobile, and secure login password.'}
            {step === 2 && 'Step 2 of 3: Choose a public store name for fellow student buyers.'}
            {step === 3 && 'Step 3 of 3: Auto-detect pickup location and enter your UPI ID.'}
          </p>
        </div>
      </div>

      {/* Tactile 3-Step Progress Indicator */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {[
          { num: 1, label: 'Account Info', icon: User },
          { num: 2, label: 'Store Identity', icon: Building2 },
          { num: 3, label: 'Location & UPI', icon: CreditCard },
        ].map((item) => {
          const IconComponent = item.icon;
          const isActive = step === item.num;
          const isDone = step > item.num;

          return (
            <div key={item.num} className="space-y-1.5">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-500'
                    : isActive
                    ? 'bg-secondary ring-2 ring-secondary/20'
                    : 'bg-muted'
                }`}
              />
              <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold">
                <IconComponent
                  className={`h-3 w-3 ${
                    isDone
                      ? 'text-emerald-500'
                      : isActive
                      ? 'text-secondary'
                      : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`${
                    isDone
                      ? 'text-foreground'
                      : isActive
                      ? 'text-secondary font-black'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-danger/25 bg-danger/10 p-3.5 text-xs font-bold text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Main Multi-Step Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AnimatePresence mode="wait">
          {/* STEP 1: Account Credentials */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-3.5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      {...register('name')}
                      className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
                    />
                  </div>
                  {errors.name && <p className="text-[11px] font-bold text-danger">{errors.name.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    WhatsApp / Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      {...register('phone')}
                      className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] font-bold text-danger">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  Campus / Personal Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="student@university.edu.in or name@gmail.com"
                    {...register('email')}
                    className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
                  />
                </div>
                {errors.email && <p className="text-[11px] font-bold text-danger">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[11px] font-bold text-danger">{errors.password.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] font-bold text-danger">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <PasswordStrength password={passwordValue} />
            </motion.div>
          )}

          {/* STEP 2: Store Identity & Campus Details */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-3.5"
            >
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  Public Store / Bookstore Display Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`e.g. ${nameValue ? `${nameValue}'s Campus Books` : 'North Campus Book Exchange'}`}
                    {...register('storeName')}
                    className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  This public bookstore name is displayed on all your listed textbooks and profile card.
                </p>
                {errors.storeName && <p className="text-[11px] font-bold text-danger">{errors.storeName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    College / University (Optional)
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g. IIT Delhi, DU, NIT"
                      {...register('collegeName')}
                      className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    Degree / Semester (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech 3rd Year, MBA Sem 2"
                    {...register('courseYear')}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  Bookstore Bio / Short Pitch
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Engineering & Medical books in excellent condition. Fast campus delivery!"
                  {...register('bio')}
                  className="w-full p-3.5 text-xs sm:text-sm font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none resize-none transition-all"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/10 border border-secondary/25 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-foreground leading-relaxed">
                  <strong>Pro-Tip:</strong> Verified student sellers with college details get <strong>3x more buyer inquiries</strong> from their peers.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Smart Geolocation & Instant UPI Payout */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-3.5"
            >
              {/* Instant UPI Payout Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    UPI ID for Instant Direct Payouts *
                  </label>
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Instant Bank Transfer
                  </span>
                </div>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. rahul@okaxis or 9876543210@paytm"
                    {...register('upiId')}
                    className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm font-mono font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Your textbook earnings are deposited directly to this UPI ID upon order delivery.
                </p>
                {errors.upiId && <p className="text-[11px] font-bold text-danger">{errors.upiId.message}</p>}
              </div>

              {/* Smart GPS Auto-Detection Header & Quick-Button */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-secondary/10 via-brand/10 to-transparent border border-secondary/25 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-secondary shrink-0" />
                    <div>
                      <p className="text-xs font-black text-foreground">Pickup Location & Campus Proximity</p>
                      <p className="text-[10px] text-muted-foreground">Nearby students discover books within walking distance</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFetchCurrentLocation}
                    disabled={isLocating}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-black uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Detecting GPS...</span>
                      </>
                    ) : (
                      <>
                        <Compass className="h-3.5 w-3.5" />
                        <span>Use My Location (GPS)</span>
                      </>
                    )}
                  </button>
                </div>

                {locationSuccess && (
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Location auto-filled via GPS coordinates!</span>
                  </p>
                )}

                {locationError && (
                  <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{locationError}</span>
                  </p>
                )}
              </div>

              {/* City, State, PIN Code Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="New Delhi"
                    {...register('city')}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
                  />
                  {errors.city && <p className="text-[11px] font-bold text-danger">{errors.city.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    State *
                  </label>
                  <input
                    type="text"
                    placeholder="Delhi"
                    {...register('state')}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
                  />
                  {errors.state && <p className="text-[11px] font-bold text-danger">{errors.state.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="110007"
                    {...register('zipCode')}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm font-mono font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
                  />
                  {errors.zipCode && <p className="text-[11px] font-bold text-danger">{errors.zipCode.message}</p>}
                </div>
              </div>

              {/* Pickup Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  Hostel / Campus / Street Pickup Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. North Campus, Jubilee Hall Hostel, Near Gate 2"
                  {...register('street')}
                  className="w-full h-11 px-3.5 text-xs sm:text-sm font-bold bg-background border border-border/90 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="space-y-1 pt-1">
                <label className="flex items-start gap-2.5 text-xs font-medium text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('agreeTerms')}
                    className="accent-secondary h-4 w-4 rounded border-border mt-0.5 shrink-0"
                  />
                  <span>
                    I accept BookFry&apos;s <span className="text-secondary font-bold underline">Seller Agreement</span> &{' '}
                    <span className="text-secondary font-bold underline">Community Guidelines</span>.
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-[11px] font-bold text-danger">{errors.agreeTerms.message}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls with generous tap targets */}
        <div className="flex items-center gap-3 pt-2">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="h-12 px-5 rounded-2xl border border-border/90 bg-background hover:bg-muted text-foreground text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 h-12 rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Continue to Step {step + 1}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Launching Bookstore...</span>
                </>
              ) : (
                <>
                  <span>🚀 Launch Bookstore & Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Footer Screen Switch */}
      <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground font-medium">
        <button
          type="button"
          onClick={() => setScreen('signup')}
          className="text-muted-foreground hover:text-foreground hover:underline font-bold cursor-pointer"
        >
          ← Looking to buy books?
        </button>

        <button
          type="button"
          onClick={() => setScreen('login')}
          className="font-extrabold text-secondary hover:underline cursor-pointer"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}

export default SellerOnboardingWizard;
