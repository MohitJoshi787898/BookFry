'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupFormData } from '@/lib/validations/auth-schemas';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { apiClient } from '@/lib/api-client';
import {
  Store,
  CreditCard,
  Compass,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  IndianRupee,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PasswordStrength } from './password-strength';

interface SellerRegisterEmbedProps {
  onSwitchToBuyer?: () => void;
}

export function SellerRegisterEmbed({ onSwitchToBuyer }: SellerRegisterEmbedProps) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { agreeTerms: true },
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

  const handleFetchCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
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

      setAuth(data.user, data.accessToken);
      await useCartStore.getState().syncCart();
      router.push('/seller/dashboard');
      router.refresh();
    } catch (err) {
      const error = err as Error;
      setApiError(error.message || 'Registration failed. Email may already be in use.');
    }
  };

  const isDuplicate = apiError?.toLowerCase().includes('already exists') || apiError?.toLowerCase().includes('registered');

  return (
    <Card className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-xl border-border bg-card rounded-3xl font-sans">
      {/* Left Column (Seller Value Props & Status) */}
      <div className="md:col-span-5 bg-secondary/8 dark:bg-secondary/10 p-7 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-[10px] font-black uppercase tracking-wider">
            <Store className="h-3.5 w-3.5" />
            <span>Campus Bookstore Setup</span>
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
              Turn Textbooks Into Cash 📚
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              List syllabus books for free, connect directly with campus juniors, and receive instant UPI payouts.
            </p>
          </div>

          {/* Stepper overview */}
          <div className="space-y-2.5 pt-2">
            {[
              { num: 1, label: 'Account Credentials', desc: 'Name, email, password & mobile' },
              { num: 2, label: 'Storefront Identity', desc: 'Bookstore name & campus college' },
              { num: 3, label: 'Payout & Location', desc: 'UPI ID & pickup address' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-3">
                <div
                  className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                    step === s.num
                      ? 'bg-secondary text-white shadow-xs scale-105'
                      : step > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <div>
                  <p className={`text-xs font-bold ${step === s.num ? 'text-secondary' : 'text-foreground'}`}>
                    {s.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Value badges */}
        <div className="space-y-2.5 pt-6 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <IndianRupee className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="font-semibold text-foreground">0% Listing Commission</span>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <CreditCard className="h-4 w-4 text-secondary shrink-0" />
            <span className="font-semibold text-foreground">Direct Bank Payouts via UPI</span>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="font-semibold text-foreground">Verified Campus Seller Badge</span>
          </div>
        </div>
      </div>

      {/* Right Column (Multi-Step Form) */}
      <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-4">
        <div>
          <h3 className="font-serif text-2xl font-extrabold text-foreground">
            {step === 1 && 'Step 1: Create Seller Account'}
            {step === 2 && 'Step 2: Storefront Profile'}
            {step === 3 && 'Step 3: Instant UPI & Pickup'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {step === 1 && 'Enter your contact credentials to register as a seller.'}
            {step === 2 && 'Give your bookstore a name that fellow students recognize.'}
            {step === 3 && 'Where should courier pick up books and send earnings?'}
          </p>
        </div>

        {apiError && (
          <div
            role="alert"
            className="p-3 bg-danger/10 border border-danger/25 rounded-xl text-xs font-bold text-danger flex items-start gap-2"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p>{apiError}</p>
              {isDuplicate && (
                <Link href="/seller/register" className="underline font-black block mt-1">
                  Already have a buyer account? Sign in to upgrade to seller →
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {step === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    {...register('name')}
                    className="w-full h-10 px-3 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
                  />
                  {errors.name && <p className="text-[10px] font-bold text-danger mt-0.5">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    {...register('phone')}
                    className="w-full h-10 px-3 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
                  />
                  {errors.phone && <p className="text-[10px] font-bold text-danger mt-0.5">{errors.phone.message}</p>}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="student@university.edu.in or name@gmail.com"
                  {...register('email')}
                  className="w-full h-10 px-3 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
                />
                {errors.email && <p className="text-[10px] font-bold text-danger mt-0.5">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">Password *</label>
                  <input
                    type="password"
                    placeholder="Min 8 characters"
                    {...register('password')}
                    className="w-full h-10 px-3 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
                  />
                  {errors.password && <p className="text-[10px] font-bold text-danger mt-0.5">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    {...register('confirmPassword')}
                    className="w-full h-10 px-3 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
                  />
                  {errors.confirmPassword && (
                    <p className="text-[10px] font-bold text-danger mt-0.5">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
              <PasswordStrength password={passwordValue} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">Bookstore Display Name *</label>
                <input
                  type="text"
                  placeholder={`e.g. ${nameValue ? `${nameValue}'s Campus Books` : 'North Campus Book Exchange'}`}
                  {...register('storeName')}
                  className="w-full h-10 px-3 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
                />
                {errors.storeName && <p className="text-[10px] font-bold text-danger mt-0.5">{errors.storeName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">College / University</label>
                  <input
                    type="text"
                    placeholder="e.g. IIT Delhi, DU"
                    {...register('collegeName')}
                    className="w-full h-10 px-3 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">Course / Year</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech 3rd Year"
                    {...register('courseYear')}
                    className="w-full h-10 px-3 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">Storefront Bio</label>
                <textarea
                  rows={2}
                  placeholder="Tell buyers what semesters or genres you specialize in..."
                  {...register('bio')}
                  className="w-full p-2.5 text-xs font-bold bg-background border border-border rounded-xl text-foreground resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-extrabold uppercase text-muted-foreground">UPI ID for Direct Payouts *</label>
                  <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Instant Bank Transfer
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. rahul@upi or 9876543210@paytm"
                  {...register('upiId')}
                  className="w-full h-10 px-3 font-mono text-xs font-bold bg-background border border-border rounded-xl text-foreground"
                />
                {errors.upiId && <p className="text-[10px] font-bold text-danger mt-0.5">{errors.upiId.message}</p>}
              </div>

              <div className="p-3 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-foreground">Pickup Location</p>
                  <p className="text-[10px] text-muted-foreground">Coordinates for courier package pickup</p>
                </div>
                <button
                  type="button"
                  onClick={handleFetchCurrentLocation}
                  disabled={isLocating}
                  className="px-3 py-1.5 rounded-xl bg-secondary text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>{isLocating ? 'Locating...' : 'Auto-Fill (GPS)'}</span>
                </button>
              </div>

              {locationSuccess && (
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Pickup location auto-filled via GPS!</span>
                </p>
              )}

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City *"
                  {...register('city')}
                  className="h-10 px-2.5 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
                />
                <input
                  type="text"
                  placeholder="State *"
                  {...register('state')}
                  className="h-10 px-2.5 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
                />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="PIN Code *"
                  {...register('zipCode')}
                  className="h-10 px-2.5 text-xs font-mono font-bold bg-background border border-border rounded-xl text-foreground"
                />
              </div>

              <input
                type="text"
                placeholder="Street / Hostel / Room Number"
                {...register('street')}
                className="w-full h-10 px-3 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
              />

              <label className="flex items-start gap-2 text-xs font-medium text-muted-foreground cursor-pointer pt-1">
                <input type="checkbox" {...register('agreeTerms')} className="accent-secondary mt-0.5" />
                <span>I accept BookFry&apos;s Seller Agreement & Community Guidelines.</span>
              </label>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((p) => (p - 1) as 1 | 2 | 3)}
                className="h-11 px-4 rounded-xl border border-border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 h-11 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Continue to Step {step + 1}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Launching Store...</span>
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

        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          {onSwitchToBuyer && (
            <button
              type="button"
              onClick={onSwitchToBuyer}
              className="text-muted-foreground hover:text-foreground font-bold cursor-pointer"
            >
              ← Looking to buy books?
            </button>
          )}
          <Link href="/login" className="font-extrabold text-secondary hover:underline ml-auto">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default SellerRegisterEmbed;
