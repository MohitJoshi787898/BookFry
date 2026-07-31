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
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, ArrowRight } from 'lucide-react';
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

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setApiError(error.message || 'Invalid email or password credentials.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Welcome back
        </h3>
        <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">
          Sign in to access your BookFry Vault, saved listings, and campus order tracking.
        </p>
      </div>

      {apiError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-2xl border border-danger/25 bg-danger/10 p-4 text-xs font-extrabold text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              autoComplete="email"
              placeholder="name@domain.com"
              {...register('email')}
              className={`w-full h-12 pl-11 pr-4 text-xs sm:text-sm font-bold bg-background border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.email ? 'border-danger' : 'border-border/90'
              }`}
            />
          </div>
          {errors.email && <p className="text-xs font-bold text-danger">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              Password
            </label>
            <button
              type="button"
              onClick={() => setScreen('forgot_password')}
              className="text-xs font-extrabold text-secondary hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full h-12 pl-11 pr-11 text-xs sm:text-sm font-bold bg-background border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.password ? 'border-danger' : 'border-border/90'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs font-bold text-danger">{errors.password.message}</p>}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="rounded border-border accent-secondary"
            />
            <span>Remember me on this browser</span>
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={isSubmitting}
          className="flex w-full h-12 items-center justify-center gap-2 rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <span>Sign in to Vault</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Switch Screen */}
      <div className="border-t border-border/80 pt-4 text-center text-xs text-muted-foreground font-medium">
        Don&apos;t have a BookFry account yet?{' '}
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
