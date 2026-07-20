'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { AuthIllustrationPanel } from './auth-illustration-panel';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-primary-950/70 backdrop-blur-md transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-4xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] my-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            {/* Close Button Top Right */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background-subtle hover:bg-border text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand"
              aria-label="Close authentication window"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Desktop Left Illustration Panel (5 Columns) */}
            <div className="hidden lg:block lg:col-span-5">
              <AuthIllustrationPanel screen={screen} />
            </div>

            {/* Right Form Area (7 Columns) */}
            <div className="lg:col-span-7 p-6 sm:p-8 overflow-y-auto max-h-[90vh] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={screen}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  {screen === 'login' && <LoginForm />}
                  {screen === 'signup' && <SignupForm />}
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
