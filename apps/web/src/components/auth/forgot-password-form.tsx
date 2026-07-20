'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth-schemas';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { HeroBookStackIllustration } from '@/components/illustrations/book-illustrations';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';

export function ForgotPasswordForm() {
  const { setScreen } = useAuthModalStore();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const emailValue = watch('email');

  const onSubmit = async () => {
    // Simulate API request delay for password reset link
    await new Promise((res) => setTimeout(res, 1000));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center font-sans">
        <div className="w-full max-w-xs mx-auto">
          <HeroBookStackIllustration className="w-full h-auto max-h-48 drop-shadow" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1 text-success text-sm font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4" />
            <span>Reset Link Sent</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-text-primary">Check Your Email Inbox</h3>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
            We&apos;ve sent a secure password reset link to{' '}
            <strong className="text-text-primary">{emailValue}</strong>. Click the link inside the email to choose a new password.
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          <button
            onClick={() => setScreen('login')}
            className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Sign In</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <button
          onClick={() => setScreen('login')}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-text-muted hover:text-brand transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </button>
        <h3 className="font-serif text-2xl font-bold text-text-primary">Forgot Your Password?</h3>
        <p className="text-xs text-text-secondary mt-1">
          Enter your registered email address and we will send you a secure password reset link.
        </p>
      </div>

      {/* Forgot Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
            Registered Email Address
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending Reset Link...</span>
            </>
          ) : (
            <span>Send Reset Instructions</span>
          )}
        </button>
      </form>

      {/* Back to login option */}
      <div className="pt-4 border-t border-border text-center text-xs text-text-secondary">
        Remember your password?{' '}
        <button
          onClick={() => setScreen('login')}
          className="font-bold text-brand hover:underline font-sans"
        >
          Sign in now
        </button>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
