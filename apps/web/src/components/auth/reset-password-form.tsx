'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations/auth-schemas';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { apiClient } from '@/lib/api-client';
import { PasswordStrength } from './password-strength';
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, KeyRound, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export function ResetPasswordForm() {
  const { setScreen, userEmail } = useAuthModalStore();
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch('password');

  const onSubmit = async (values: ResetPasswordFormData) => {
    setApiError(null);
    try {
      await apiClient('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: userEmail,
          otp: values.otp.trim(),
          password: values.password,
        }),
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setApiError(error.message || 'Failed to reset password. Please verify the code and try again.');
    }
  };

  const handleResendOtp = async () => {
    if (!userEmail || resending) return;
    setApiError(null);
    setResending(true);
    try {
      await apiClient('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: userEmail }),
      });
      setResendSuccess('A fresh reset code has been dispatched to your email.');
      setTimeout(() => setResendSuccess(null), 4000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setApiError(error.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center font-sans">
        <div className="mx-auto h-16 w-16 rounded-3xl bg-success/15 border border-success/30 text-success flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">Password Reset Successful</h3>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your BookFry account password has been updated successfully. You can now sign in with your new credentials.
          </p>
        </div>

        <div className="pt-4 border-t border-border/80">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setScreen('login')}
            className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In with New Password</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans">
      <div>
        <button
          onClick={() => setScreen('forgot_password')}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-muted-foreground hover:text-secondary transition-colors mb-2 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Change Email</span>
        </button>
        <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Set New Password</h3>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5">
          Enter the 6-digit code sent to <strong className="text-foreground">{userEmail || 'your email'}</strong> and choose a new password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && (
          <div className="p-3 rounded-2xl bg-danger/10 border border-danger/20 text-xs font-bold text-danger flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {resendSuccess && (
          <div className="p-3 rounded-2xl bg-success/15 border border-success/30 text-xs font-extrabold text-success flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{resendSuccess}</span>
          </div>
        )}

        {/* OTP Code */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              6-Digit Reset Code
            </label>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="text-[11px] font-bold text-secondary hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
              <span>Resend Code</span>
            </button>
          </div>
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              {...register('otp')}
              className={`w-full h-12 pl-11 pr-4 text-center tracking-[0.4em] font-mono text-base font-black bg-background border rounded-2xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.otp ? 'border-danger' : 'border-border/90'
              }`}
            />
          </div>
          {errors.otp && <p className="text-xs font-bold text-danger">{errors.otp.message}</p>}
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            New Password
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
            Confirm New Password
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

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              <span>Update Password</span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}

export default ResetPasswordForm;

