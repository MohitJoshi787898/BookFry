'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth-schemas';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { ArrowLeft, CheckCircle2, Loader2, Mail, Send } from 'lucide-react';
import { motion } from 'framer-motion';

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
    await new Promise((res) => setTimeout(res, 1000));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center font-sans">
        <div className="mx-auto h-16 w-16 rounded-3xl bg-success/15 border border-success/30 text-success flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-extrabold text-success uppercase tracking-wider bg-success/10 px-3 py-1 rounded-full border border-success/20 inline-block">
            Reset Link Dispatched
          </span>
          <h3 className="font-serif text-2xl font-extrabold text-foreground">Check Your Email Inbox</h3>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed max-w-sm mx-auto">
            We&apos;ve sent a secure password reset link to{' '}
            <strong className="text-foreground">{emailValue}</strong>. Click the link inside to set a new password.
          </p>
        </div>

        <div className="pt-4 border-t border-border/80">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setScreen('login')}
            className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Sign In</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <button
          onClick={() => setScreen('login')}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-muted-foreground hover:text-secondary transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </button>
        <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Forgot Your Password?</h3>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
          Enter your registered email address and we will send you a secure password reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Registered Email Address
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

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending Reset Link...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Send Reset Instructions</span>
            </>
          )}
        </motion.button>
      </form>

      <div className="pt-4 border-t border-border/80 text-center text-xs text-muted-foreground font-medium">
        Remember your password?{' '}
        <button
          onClick={() => setScreen('login')}
          className="font-extrabold text-secondary hover:underline cursor-pointer"
        >
          Sign in now
        </button>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
