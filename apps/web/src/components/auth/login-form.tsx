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
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';

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
        body: JSON.stringify({ email: values.email, password: values.password }),
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
      {/* Header */}
      <div>
        <h3 className="font-serif text-2xl font-bold text-text-primary">Welcome Back to BookFry</h3>
        <p className="text-xs text-text-secondary mt-1">
          Sign in to manage your listings, orders, and seller dashboard.
        </p>
      </div>

      {/* API Error Alert */}
      {apiError && (
        <div className="p-3.5 rounded-md bg-danger/10 border border-danger/20 text-xs font-semibold text-danger">
          {apiError}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="email"
              placeholder="name@domain.com"
              {...register('email')}
              className={`w-full pl-9 pr-3 py-2.5 text-sm bg-surface border rounded-md text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand ${
                errors.email ? 'border-danger' : 'border-border'
              }`}
            />
          </div>
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              Password
            </label>
            <button
              type="button"
              onClick={() => setScreen('forgot_password')}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`w-full pl-9 pr-10 py-2.5 text-sm bg-surface border rounded-md text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand ${
                errors.password ? 'border-danger' : 'border-border'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-xs font-medium text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="text-brand focus:ring-brand rounded border-border"
            />
            <span>Remember me on this browser</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In to Continue</span>
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="pt-4 border-t border-border text-center text-xs text-text-secondary">
        Don&apos;t have a BookFry account yet?{' '}
        <button
          onClick={() => setScreen('signup')}
          className="font-bold text-brand hover:underline font-sans"
        >
          Create free account
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
