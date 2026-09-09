'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { AuthIllustrationPanel } from './auth-illustration-panel';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';
import { SellerOnboardingWizard } from './seller-onboarding-wizard';
import { ForgotPasswordForm } from './forgot-password-form';
import { VerifyEmailScreen } from './verify-email-screen';
import { ResetPasswordForm } from './reset-password-form';
import { X } from 'lucide-react';

export function AuthModal() {
  const { isOpen, screen, closeModal } = useAuthModalStore();

  // Close on ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center font-sans">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            aria-hidden="true"
          />

          {/* Desktop & Mobile Responsive Container */}
          <motion.div
            initial={{ opacity: 0, y: '100%', scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: '100%', scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full sm:max-w-5xl bg-card border-t sm:border border-border/90 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 lg:grid-cols-12 max-h-[94vh] my-0 sm:my-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            {/* Mobile Drag Indicator Handle */}
            <div className="lg:hidden w-12 h-1.5 rounded-full bg-muted-foreground/30 mx-auto mt-3 mb-1 shrink-0" />

            {/* Close Button Top Right */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 h-9 w-9 flex items-center justify-center rounded-2xl bg-muted/80 hover:bg-card border border-border/60 text-muted-foreground hover:text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
              aria-label="Close authentication window"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Desktop Left Hero Illustration Panel (5 Columns) */}
            <div className="hidden lg:block lg:col-span-5">
              <AuthIllustrationPanel screen={screen} />
            </div>

            {/* Right Form Area (7 Columns) */}
            <div className="lg:col-span-7 p-6 sm:p-8 sm:py-8 lg:p-9 overflow-y-auto max-h-[88vh] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={screen}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full"
                >
                  {screen === 'login' && <LoginForm />}
                  {screen === 'signup' && <SignupForm />}
                  {screen === 'seller_signup' && <SellerOnboardingWizard />}
                  {screen === 'forgot_password' && <ForgotPasswordForm />}
                  {screen === 'verify_email' && <VerifyEmailScreen />}
                  {screen === 'reset_password' && <ResetPasswordForm />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;
