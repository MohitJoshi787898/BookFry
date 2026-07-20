'use client';

import React, { useState, useEffect } from 'react';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { ExchangeKnowledgeIllustration } from '@/components/illustrations/book-illustrations';
import { RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';

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
        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">
          Step 2 of 2: Email Verification
        </span>
        <h3 className="font-serif text-2xl font-bold text-text-primary">Verify Your Email Address</h3>
        <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
          We&apos;ve sent a verification link to{' '}
          <strong className="text-text-primary">{userEmail || 'your email'}</strong>. Please open the link to activate your BookFry seller profile.
        </p>
      </div>

      {/* Center Illustration */}
      <div className="w-full max-w-xs mx-auto drop-shadow">
        <ExchangeKnowledgeIllustration className="w-full h-auto max-h-44" />
      </div>

      {ResentMsgSentBanner()}

      {/* Resend Email & Change Email Options */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleResend}
          disabled={!canResend}
          className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${!canResend ? 'animate-spin' : ''}`} />
          <span>{canResend ? 'Resend Verification Email' : `Resend Email in (${countdown}s)`}</span>
        </button>

        <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-border">
          <button
            onClick={() => setScreen('signup')}
            className="inline-flex items-center space-x-1 text-text-muted hover:text-brand font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Change Email</span>
          </button>
          <button
            onClick={() => {
              closeModal();
            }}
            className="font-bold text-brand hover:underline"
          >
            I&apos;ve Verified — Continue
          </button>
        </div>
      </div>
    </div>
  );

  function ResentMsgSentBanner() {
    if (!resentMsg) return null;
    return (
      <div className="p-3 bg-success/10 border border-success/20 rounded-md text-xs font-semibold text-success flex items-center justify-center space-x-2">
        <CheckCircle2 className="h-4 w-4" />
        <span>A fresh verification link has been sent to your inbox!</span>
      </div>
    );
  }
}

export default VerifyEmailScreen;
