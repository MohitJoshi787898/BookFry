'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupFormData } from '@/lib/validations/auth-schemas';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { PasswordStrength } from './password-strength';
import { apiClient } from '@/lib/api-client';
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';

export function SignupForm() {
  const { setScreen, setUserEmail } = useAuthModalStore();
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
      await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          roles: ['customer', 'seller'],
        }),
      });

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
        <h3 className="font-serif text-2xl font-bold text-text-primary">Create Your Account</h3>
        <p className="text-xs text-text-secondary mt-1">
          Join India&apos;s leading student bookstore and peer-to-peer textbook marketplace.
        </p>
      </div>

      {/* API Error Alert */}
      {apiError && (
        <div className="p-3.5 rounded-md bg-danger/10 border border-danger/20 text-xs font-semibold text-danger">
          {apiError}
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              {...register('name')}
              className={`w-full pl-9 pr-3 py-2.5 text-sm bg-surface border rounded-md text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand ${
                errors.name ? 'border-danger' : 'border-border'
              }`}
            />
          </div>
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

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
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
            Create Password
          </label>
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

          {/* Real-time Password Strength Meter */}
          <PasswordStrength password={passwordValue} />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`w-full pl-9 pr-3 py-2.5 text-sm bg-surface border rounded-md text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand ${
                errors.confirmPassword ? 'border-danger' : 'border-border'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="space-y-1 pt-1">
          <label className="flex items-start space-x-2 text-xs font-medium text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              {...register('agreeTerms')}
              className="text-brand focus:ring-brand rounded border-border mt-0.5"
            />
            <span>
              I agree to BookFry&apos;s <span className="text-brand underline">Terms of Service</span> and{' '}
              <span className="text-brand underline">Privacy Policy</span>.
            </span>
          </label>
          {errors.agreeTerms && <p className="text-xs text-danger">{errors.agreeTerms.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-secondary hover:bg-secondary-600 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account & Continue</span>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="pt-4 border-t border-border text-center text-xs text-text-secondary">
        Already have an account?{' '}
        <button
          onClick={() => setScreen('login')}
          className="font-bold text-brand hover:underline font-sans"
        >
          Sign in here
        </button>
      </div>
    </div>
  );
}

export default SignupForm;
