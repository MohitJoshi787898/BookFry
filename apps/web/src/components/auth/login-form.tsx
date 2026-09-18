'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations/auth-schemas';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { useCartStore } from '@/stores/cart.store';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { setScreen, closeModal, redirectTo } = useAuthModalStore();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormData) => {
    setApiError(null);
    try {
      const data = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      setAuth(data.user, data.accessToken);
      await useCartStore.getState().syncCart();

      closeModal();

      const isAdmin = data.user.roles?.includes('admin');
      const isSeller = data.user.roles?.includes('seller');
      const onboardingIncomplete = data.user.sellerOnboardingStatus === 'incomplete';

      if (redirectTo) {
        // Honor explicit redirect — e.g. from a protected page that triggered login
        router.push(redirectTo);
      } else if (isAdmin) {
        // Platform Administrator — direct to administrative control center
        router.push('/admin/dashboard');
      } else if (isSeller && onboardingIncomplete) {
        // Seller with incomplete profile must complete onboarding before accessing dashboard
        router.push('/seller/register');
      } else if (isSeller) {
        // Fully onboarded seller — go to their hub
        router.push('/seller/dashboard');
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setApiError(error.message || 'Invalid email or password credentials.');
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="lg:hidden h-12 w-12 rounded-2xl bg-secondary/10 border border-secondary/20 p-1 shrink-0 overflow-hidden shadow-xs mt-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/welcome-back1.png" alt="BookFry Mascot" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/10 dark:bg-brand/20 text-brand dark:text-primary text-[10px] font-extrabold uppercase tracking-wider mb-1">
            <Sparkles className="h-3 w-3" />
            <span>Universal Sign In</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Welcome back
          </h3>
          <p className="mt-0.5 text-xs sm:text-sm font-medium text-muted-foreground">
            Sign in to access your BookFry orders, saved vault, and seller dashboard.
          </p>
        </div>
      </div>

      {apiError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-2xl border border-danger/25 bg-danger/10 p-3 text-xs font-bold text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="email"
              autoComplete="email"
              placeholder="name@domain.com"
              {...register('email')}
              className={`w-full h-11 pl-10 pr-4 text-xs sm:text-sm font-bold bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.email ? 'border-danger' : 'border-border/90'
              }`}
            />
          </div>
          {errors.email && <p className="text-[10px] font-bold text-danger">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              Password
            </label>
            <button
              type="button"
              onClick={() => setScreen('forgot_password')}
              className="text-xs font-bold text-secondary hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full h-11 pl-10 pr-10 text-xs sm:text-sm font-bold bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.password ? 'border-danger' : 'border-border/90'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {errors.password && <p className="text-[10px] font-bold text-danger">{errors.password.message}</p>}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="rounded border-border accent-secondary"
            />
            <span>Remember me on this device</span>
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={isSubmitting}
          className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Seller Portal Link Banner */}
      <div className="p-3 rounded-2xl bg-secondary/5 border border-secondary/20 flex items-center justify-between gap-3">
        <div>
          <p className="font-extrabold text-xs text-foreground">Want to sell books & earn?</p>
          <p className="text-[10px] text-muted-foreground">List textbooks in 60s with student escrow.</p>
        </div>
        <button
          type="button"
          onClick={() => setScreen('seller_signup')}
          className="px-3 py-1.5 rounded-xl bg-secondary text-white font-extrabold text-[11px] hover:bg-secondary/90 shrink-0 transition-all shadow-2xs"
        >
          Register Store →
        </button>
      </div>

      {/* Switch Screen */}
      <div className="border-t border-border/80 pt-2 text-center text-xs text-muted-foreground font-medium">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={() => setScreen('signup')}
          className="font-extrabold text-secondary hover:underline cursor-pointer"
        >
          Create free account
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
