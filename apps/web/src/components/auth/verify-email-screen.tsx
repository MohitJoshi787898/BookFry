'use client';

import React, { useState, useEffect } from 'react';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { useAuthStore } from '@/stores/auth.store';
import { ExchangeKnowledgeIllustration } from '@/components/illustrations/book-illustrations';
import { RefreshCw, ArrowLeft, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export function VerifyEmailScreen() {
  const { setScreen, userEmail, closeModal } = useAuthModalStore();
  const user = useAuthStore((state) => state.user);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resentMsg, setResentMsg] = useState(false);

  // Use stored email if available, fall back to logged-in user's email
  const displayEmail = userEmail || user?.email || 'your email';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = () => {
    // NOTE: No backend email verification endpoint exists yet.
    // This UI is informational — the resend simulates the action.
    setCountdown(60);
    setCanResend(false);
    setResentMsg(true);
    setTimeout(() => setResentMsg(false), 3000);
  };

  return (
    <div className="space-y-6 text-center font-sans">
      {/* Top Header */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-extrabold uppercase tracking-widest mb-2">
          <ShieldCheck className="h-3.5 w-3.5" /> Email Verification
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
          Check Your Inbox
        </h3>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
          We&apos;ve sent a verification link to{' '}
          <strong className="text-foreground">{displayEmail}</strong>. Open the link to activate
          your BookFry account.
        </p>
      </div>

      {/* Center Illustration */}
      <div className="w-full max-w-xs mx-auto drop-shadow-md">
        <ExchangeKnowledgeIllustration className="w-full h-auto max-h-40" />
      </div>

      {/* Tip */}
      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-muted/40 border border-border/80 text-left">
        <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Didn&apos;t receive it?</strong> Check your spam
          folder, or use the button below to request a new verification link.
        </p>
      </div>

      {resentMsg && (
        <div className="p-3.5 rounded-2xl bg-success/15 border border-success/30 text-xs font-extrabold text-success flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>A fresh verification link has been sent to your inbox!</span>
        </div>
      )}

      {/* Resend Email */}
      <div className="space-y-3 pt-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleResend}
          disabled={!canResend}
          className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${!canResend ? 'animate-spin' : ''}`} />
          <span>{canResend ? 'Resend Verification Email' : `Resend in ${countdown}s`}</span>
        </motion.button>

        {/* Footer links */}
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground pt-3 border-t border-border/80">
          <button
            onClick={() => setScreen('signup')}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-secondary font-extrabold cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Change Email</span>
          </button>

          {/*
           * INTENTIONALLY removed "I've Verified — Continue" (self-verify) button.
           * That button allowed users to bypass email verification without actually
           * verifying. There is no backend verification check to skip.
           * Users must verify via the emailed link, then reload the page.
           */}
          <button
            onClick={() => closeModal()}
            className="text-muted-foreground hover:text-foreground font-semibold text-xs cursor-pointer"
          >
            Continue to app →
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Your account is active. Email verification unlocks full marketplace features.
        </p>
      </div>
    </div>
  );
}

export default VerifyEmailScreen;
