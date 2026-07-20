'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations/auth-schemas';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { PasswordStrength } from './password-strength';
import { CheckCircle2, Eye, EyeOff, Loader2, Lock } from 'lucide-react';

export function ResetPasswordForm() {
  const { setScreen } = useAuthModalStore();
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch('password');

  const onSubmit = async () => {
    // Simulate reset password API call
    await new Promise((res) => setTimeout(res, 1000));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center font-sans">
        <div className="mx-auto h-16 w-16 rounded-full bg-success/10 text-success flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h3 className="font-serif text-2xl font-bold text-text-primary">Password Reset Successful</h3>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
            Your BookFry account password has been updated. You can now sign in with your new password.
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          <button
            onClick={() => setScreen('login')}
            className="w-full py-3 bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow"
          >
            Sign In with New Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h3 className="font-serif text-2xl font-bold text-text-primary">Reset Your Password</h3>
        <p className="text-xs text-text-secondary mt-1">
          Create a new strong password for your BookFry account.
        </p>
      </div>

      {/* Reset Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
            New Password
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

          <PasswordStrength password={passwordValue} />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
            Confirm New Password
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Resetting Password...</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordForm;
