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
  Building,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SellerOnboardingWizard() {
  const { setScreen, setUserEmail } = useAuthModalStore();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
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

      setUserEmail(values.email);
      setScreen('verify_email');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setApiError(error.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Wizard Header */}
      <div className="flex items-start gap-3">
        <div className="lg:hidden h-12 w-12 rounded-2xl bg-secondary/10 border border-secondary/20 p-1 shrink-0 overflow-hidden shadow-xs mt-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/create-account.png" alt="BookFry Mascot" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-extrabold uppercase tracking-wider mb-1">
            <Store className="h-3 w-3" />
            <span>Seller Onboarding</span>
          </div>
          <h3 className="font-serif text-2xl font-extrabold text-foreground tracking-tight">
            {step === 1 && 'Create Seller Account'}
            {step === 2 && 'Set Up Your Book Store'}
            {step === 3 && 'Pickup & Instant Payout'}
          </h3>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">
            {step === 1 && 'Step 1 of 3: Enter your primary login & contact information.'}
            {step === 2 && 'Step 2 of 3: Give your bookstore an identity for student buyers.'}
            {step === 3 && 'Step 3 of 3: Add pickup address & UPI ID for instant book payouts.'}
          </p>
        </div>
      </div>

      {/* Modern Stepper Progress Bar */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { num: 1, label: 'Account' },
          { num: 2, label: 'Store' },
          { num: 3, label: 'Payout' },
        ].map((item) => (
          <div key={item.num} className="space-y-1">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= item.num ? 'bg-secondary' : 'bg-muted'
              }`}
            />
            <span
              className={`text-[10px] font-extrabold block text-center ${
                step === item.num ? 'text-secondary' : 'text-muted-foreground'
              }`}
            >
              {item.num}. {item.label}
            </span>
          </div>
        ))}
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

      {/* Multi-Step Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-1">
        <AnimatePresence mode="wait">
          {/* STEP 1: Personal Account Info */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      {...register('name')}
                      className="w-full h-10 pl-9 pr-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none"
                    />
                  </div>
                  {errors.name && <p className="text-[10px] font-bold text-danger">{errors.name.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    WhatsApp / Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      {...register('phone')}
                      className="w-full h-10 pl-9 pr-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none"
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] font-bold text-danger">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    {...register('email')}
                    className="w-full h-10 pl-9 pr-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none"
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-danger">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      className="w-full h-10 pl-9 pr-9 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[10px] font-bold text-danger">{errors.password.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className="w-full h-10 pl-9 pr-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[10px] font-bold text-danger">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <PasswordStrength password={passwordValue} />
            </motion.div>
          )}

          {/* STEP 2: Store Identity */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  Store / Shop Display Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`e.g. ${nameValue ? `${nameValue}'s Campus Books` : 'Delhi University Book Exchange'}`}
                    {...register('storeName')}
                    className="w-full h-10 pl-9 pr-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  This public store name will appear on all your listed books.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  Campus / Store Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. 3rd year Engineering student selling semester 1-6 textbooks in crisp condition."
                  {...register('bio')}
                  className="w-full p-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none resize-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/5 border border-secondary/20 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Verified student sellers with campus descriptions receive <strong className="text-foreground">2.5x more buyer inquiries</strong>.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Location & Instant Payout */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  UPI ID for Instant Payouts *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. rahul@okaxis or 9876543210@paytm"
                    {...register('upiId')}
                    className="w-full h-10 pl-9 pr-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none font-mono"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Direct payment is automatically sent to this UPI ID when you fulfill buyer orders.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="New Delhi"
                    {...register('city')}
                    className="w-full h-10 px-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    State *
                  </label>
                  <input
                    type="text"
                    placeholder="Delhi"
                    {...register('state')}
                    className="w-full h-10 px-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    placeholder="110007"
                    {...register('zipCode')}
                    className="w-full h-10 px-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  Pickup / Campus Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. North Campus, University Enclave, Near Metro Gate 3"
                  {...register('street')}
                  className="w-full h-10 px-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary outline-none"
                />
              </div>

              <div className="space-y-1 pt-1">
                <label className="flex items-start gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('agreeTerms')}
                    className="accent-secondary rounded border-border mt-0.5"
                  />
                  <span>
                    I agree to BookFry&apos;s <span className="text-secondary font-bold underline">Terms</span> &{' '}
                    <span className="text-secondary font-bold underline">Seller Guidelines</span>.
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-[10px] font-bold text-danger">{errors.agreeTerms.message}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 pt-2">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="h-11 px-4 rounded-xl border border-border bg-background hover:bg-muted text-text-primary text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 h-11 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Step {step + 1}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Launching Seller Store...</span>
                </>
              ) : (
                <>
                  <span>🚀 Launch My Seller Store</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Switch to Buyer Signup or Login */}
      <div className="pt-2 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground font-medium">
        <button
          type="button"
          onClick={() => setScreen('signup')}
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          ← Looking to buy books?
        </button>

        <button
          type="button"
          onClick={() => setScreen('login')}
          className="font-extrabold text-secondary hover:underline"
        >
          Sign in here
        </button>
      </div>
    </div>
  );
}

export default SellerOnboardingWizard;
