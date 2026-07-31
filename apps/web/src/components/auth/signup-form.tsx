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
import { Eye, EyeOff, Loader2, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';
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
          roles: ['customer', 'seller'],
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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Create Your Account
        </h3>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
          Join India&apos;s leading student bookstore and peer-to-peer textbook marketplace.
        </p>
      </div>

      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-danger/25 bg-danger/10 p-4 text-xs font-extrabold text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              {...register('name')}
              className={`w-full h-12 pl-11 pr-4 text-xs sm:text-sm font-bold bg-background border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.name ? 'border-danger' : 'border-border/90'
              }`}
            />
          </div>
          {errors.name && <p className="text-xs font-bold text-danger">{errors.name.message}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
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
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Create Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`w-full h-12 pl-11 pr-11 text-xs sm:text-sm font-bold bg-background border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.password ? 'border-danger' : 'border-border/90'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs font-bold text-danger">{errors.password.message}</p>}

          <PasswordStrength password={passwordValue} />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`w-full h-12 pl-11 pr-4 text-xs sm:text-sm font-bold bg-background border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.confirmPassword ? 'border-danger' : 'border-border/90'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-bold text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="space-y-1 pt-1">
          <label className="flex items-start gap-2.5 text-xs font-medium text-muted-foreground cursor-pointer">
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
          {errors.agreeTerms && <p className="text-xs font-bold text-danger">{errors.agreeTerms.message}</p>}
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

      {/* Switch to Login */}
      <div className="pt-4 border-t border-border/80 text-center text-xs text-muted-foreground font-medium">
        Already have an account?{' '}
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
