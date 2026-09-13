'use client';

import React, { useState, useEffect } from 'react';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { RefreshCw, ArrowLeft, CheckCircle2, ShieldCheck, Mail, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function VerifyEmailScreen() {
  const { setScreen, userEmail, closeModal } = useAuthModalStore();
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const displayEmail = userEmail || user?.email || '';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit code');
      return;
    }
    setErrorMsg(null);
    setIsVerifying(true);

    try {
      const res = await apiClient<{ user: typeof user; message: string }>('/auth/verify-email-otp', {
        method: 'POST',
        body: JSON.stringify({
          email: displayEmail,
          otp: otp.trim(),
        }),
      });

      if (res?.user && accessToken) {
        setAuth(res.user, accessToken);
      }
      setSuccessMsg('Email verified successfully! Welcome to BookFry.');
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Invalid or expired verification code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setErrorMsg(null);
    setIsResending(true);

    try {
      await apiClient('/auth/send-verification-otp', {
        method: 'POST',
        body: JSON.stringify({ email: displayEmail }),
      });
      setCountdown(60);
      setCanResend(false);
      setSuccessMsg('A fresh 6-digit verification code has been dispatched.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-5 text-center font-sans">
      {/* Top Header */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-extrabold uppercase tracking-widest mb-2">
          <ShieldCheck className="h-3.5 w-3.5" /> Email Verification
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
          Enter Verification Code
        </h3>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
          We&apos;ve sent a 6-digit security code to{' '}
          <strong className="text-foreground">{displayEmail || 'your email'}</strong>.
        </p>
      </div>

      {/* Verification OTP Form */}
      <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-sm mx-auto">
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block text-left">
            6-Digit Security Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="• • • • • •"
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setOtp(val);
              if (val.length === 6) {
                setErrorMsg(null);
              }
            }}
            className="w-full h-14 text-center tracking-[0.6em] text-2xl font-mono font-black bg-background border rounded-2xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-secondary border-border/90"
            autoFocus
          />
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-danger/10 border border-danger/20 text-xs font-bold text-danger flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-success/15 border border-success/30 text-xs font-extrabold text-success flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={isVerifying || otp.length !== 6}
          className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>Verify & Continue</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Resend & Secondary Actions */}
      <div className="space-y-3 pt-1 max-w-sm mx-auto">
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || isResending}
          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
          <span>{canResend ? 'Resend Verification Code' : `Resend code in ${countdown}s`}</span>
        </button>

        {/* Tip */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-muted/40 border border-border/80 text-left">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
            <strong className="text-foreground">In testing mode?</strong> Check your terminal console for the auto-logged OTP code.
          </p>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground pt-3 border-t border-border/80">
          <button
            onClick={() => setScreen('signup')}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-secondary font-extrabold cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Change Email</span>
          </button>

          <button
            onClick={() => closeModal()}
            className="text-muted-foreground hover:text-foreground font-semibold text-xs cursor-pointer"
          >
            Continue to app →
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailScreen;

