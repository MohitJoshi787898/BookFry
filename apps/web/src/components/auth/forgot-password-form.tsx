'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth-schemas';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Loader2, Mail, Send, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function ForgotPasswordForm() {
  const { setScreen, setUserEmail } = useAuthModalStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    setApiError(null);
    try {
      await apiClient('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: values.email }),
      });
      setUserEmail(values.email);
      setScreen('reset_password');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setApiError(error.message || 'Unable to process reset request. Please check email.');
    }
  };

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
        {apiError && (
          <div className="p-3 rounded-2xl bg-danger/10 border border-danger/20 text-xs font-bold text-danger flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

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
              <span>Sending Reset Code...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Send Reset Code</span>
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
