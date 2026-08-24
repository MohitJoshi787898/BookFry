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
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function SignupForm() {
  const { setScreen, setUserEmail } = useAuthModalStore();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      agreeTerms: true,
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (values: SignupFormData) => {
    setApiError(null);
    try {
      const data = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          roles: ['customer'],
        }),
      });

      setAuth(data.user, data.accessToken);
      await useCartStore.getState().syncCart();

      setUserEmail(values.email);
      setScreen('verify_email');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setApiError(error.message || 'Registration failed. Email may already be registered.');
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="lg:hidden h-12 w-12 rounded-2xl bg-secondary/10 border border-secondary/20 p-1 shrink-0 overflow-hidden shadow-xs mt-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/create-account.png" alt="BookFry Mascot" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/10 dark:bg-brand/20 text-brand dark:text-primary text-[10px] font-extrabold uppercase tracking-wider mb-1">
            <Sparkles className="h-3 w-3" />
            <span>Quick 10-Second Signup</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Create Your Account
          </h3>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5">
            Join thousands of students buying verified books at up to 80% off.
          </p>
        </div>
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

      {/* Buyer Signup Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              {...register('name')}
              className="w-full h-11 pl-10 pr-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none"
            />
          </div>
          {errors.name && <p className="text-[10px] font-bold text-danger">{errors.name.message}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="name@domain.com"
              {...register('email')}
              className="w-full h-11 pl-10 pr-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none"
            />
          </div>
          {errors.email && <p className="text-[10px] font-bold text-danger">{errors.email.message}</p>}
        </div>

        {/* Password and Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full h-11 pl-10 pr-9 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none"
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
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="w-full h-11 pl-10 pr-3 text-xs font-bold bg-background border border-border/90 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand outline-none"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] font-bold text-danger">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <PasswordStrength password={passwordValue} />

        {/* Terms Checkbox */}
        <div className="space-y-1 pt-1">
          <label className="flex items-start gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              {...register('agreeTerms')}
              className="accent-secondary rounded border-border mt-0.5"
            />
            <span>
              I agree to BookFry&apos;s <span className="text-secondary font-bold underline">Terms of Service</span> and{' '}
              <span className="text-secondary font-bold underline">Privacy Policy</span>.
            </span>
          </label>
          {errors.agreeTerms && <p className="text-[10px] font-bold text-danger">{errors.agreeTerms.message}</p>}
        </div>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={isSubmitting}
          className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Seller Portal Callout Banner */}
      <div className="p-3 rounded-2xl bg-secondary/5 border border-secondary/20 flex items-center justify-between gap-3">
        <div>
          <p className="font-extrabold text-xs text-foreground">Want to sell your used textbooks?</p>
          <p className="text-[10px] text-muted-foreground">List books for free & get direct UPI payouts.</p>
        </div>
        <button
          type="button"
          onClick={() => setScreen('seller_signup')}
          className="px-3 py-1.5 rounded-xl bg-secondary text-white font-extrabold text-[11px] hover:bg-secondary/90 shrink-0 transition-all shadow-2xs"
        >
          Register Store →
        </button>
      </div>

      {/* Switch to Login */}
      <div className="pt-2 border-t border-border/80 text-center text-xs text-muted-foreground font-medium">
        Already have a BookFry account?{' '}
        <button
          onClick={() => setScreen('login')}
          className="font-extrabold text-secondary hover:underline cursor-pointer"
        >
          Sign in here
        </button>
      </div>
    </div>
  );
}

export default SignupForm;
