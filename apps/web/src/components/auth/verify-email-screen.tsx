'use client';

import React, { useState, useEffect } from 'react';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { ExchangeKnowledgeIllustration } from '@/components/illustrations/book-illustrations';
import { RefreshCw, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function VerifyEmailScreen() {
  const { setScreen, userEmail, closeModal } = useAuthModalStore();
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resentMsg, setResentMsg] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = () => {
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
          <ShieldCheck className="h-3.5 w-3.5" /> Step 2 of 2: Email Verification
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">Verify Your Email</h3>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
          We&apos;ve sent a verification link to{' '}
          <strong className="text-foreground">{userEmail || 'your email'}</strong>. Please open the link to activate your BookFry account.
        </p>
      </div>

      {/* Center Illustration */}
      <div className="w-full max-w-xs mx-auto drop-shadow-md">
        <ExchangeKnowledgeIllustration className="w-full h-auto max-h-40" />
      </div>

      {resentMsg && (
        <div className="p-3.5 rounded-2xl bg-success/15 border border-success/30 text-xs font-extrabold text-success flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>A fresh verification link has been sent to your inbox!</span>
        </div>
      )}

      {/* Resend Email & Change Email Options */}
      <div className="space-y-3 pt-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleResend}
          disabled={!canResend}
          className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${!canResend ? 'animate-spin' : ''}`} />
          <span>{canResend ? 'Resend Verification Email' : `Resend Email in (${countdown}s)`}</span>
        </motion.button>

        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground pt-3 border-t border-border/80">
          <button
            onClick={() => setScreen('signup')}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-secondary font-extrabold cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Change Email</span>
          </button>
          <button
            onClick={() => {
              closeModal();
            }}
            className="font-extrabold text-secondary hover:underline cursor-pointer"
          >
            I&apos;ve Verified — Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailScreen;
