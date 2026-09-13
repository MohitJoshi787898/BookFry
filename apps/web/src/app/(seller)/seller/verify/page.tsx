'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { apiClient } from '@/lib/api-client';
import { SellerLayout } from '@/components/seller/seller-layout';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Store,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SellerVerifyPage() {
  const { isAuthenticated, user, setUser } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitVerification = async () => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const updatedUser = await apiClient('/users/seller-verification', {
        method: 'POST',
      });
      setUser(updatedUser);
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setApiError(error.message || 'Failed to submit verification request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SellerLayout>
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 font-sans text-center">
          <ShieldCheck className="h-12 w-12 text-secondary/50" />
          <h2 className="font-serif text-xl font-bold text-foreground">
            Sign In to Request Seller Verification
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Sign in to your BookFry seller account to check verification status or submit for review.
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => openModal('login', '/seller/verify')}
            className="px-5 py-2.5 bg-secondary text-white rounded-2xl text-sm font-bold shadow-md cursor-pointer"
          >
            Sign In →
          </motion.button>
        </div>
      </SellerLayout>
    );
  }

  // Profile incomplete — cannot submit for verification
  if (user?.sellerOnboardingStatus === 'incomplete') {
    return (
      <SellerLayout>
        <div className="max-w-xl mx-auto space-y-6 font-sans py-8">
          <div className="p-6 rounded-3xl border border-danger/25 bg-danger/8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-danger/15 text-danger">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Profile Incomplete
                </h3>
                <p className="text-xs text-muted-foreground">
                  You must complete your basic seller profile before requesting admin verification.
                </p>
              </div>
            </div>
            <Link
              href="/seller/register"
              className="inline-flex items-center gap-2 px-4 py-2 bg-danger text-white rounded-xl text-xs font-bold shadow-xs hover:bg-danger/90"
            >
              <span>Complete Profile First</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </SellerLayout>
    );
  }

  // Already verified
  if (user?.sellerVerificationStatus === 'approved') {
    return (
      <SellerLayout>
        <div className="max-w-xl mx-auto space-y-6 font-sans py-8 text-center">
          <div className="p-8 rounded-3xl border border-success/30 bg-success/10 space-y-4">
            <div className="h-16 w-16 mx-auto rounded-3xl bg-success/20 border border-success/30 flex items-center justify-center text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="font-serif text-2xl font-extrabold text-foreground">
              You are a Verified BookFry Seller!
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Your profile has been approved by the BookFry quality team. All your active book listings carry the trusted verified seller badge.
            </p>
            <div className="pt-2">
              <Link
                href="/seller/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-2xl text-xs font-bold shadow-sm"
              >
                <span>Back to Seller Hub</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </SellerLayout>
    );
  }

  // Rejected by admin — show reason and resolution actions
  if (user?.sellerVerificationStatus === 'rejected') {
    return (
      <SellerLayout>
        <div className="max-w-xl mx-auto space-y-6 font-sans py-8">
          <div className="p-8 rounded-3xl border border-danger/30 bg-danger/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-danger/20 text-danger shrink-0">
                <AlertCircle className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-extrabold text-foreground">
                  Verification Rejected
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your previous verification request was not approved.
                </p>
              </div>
            </div>

            {user.sellerVerificationRejectionReason && (
              <div className="p-4 rounded-2xl bg-background border border-danger/25 text-xs text-foreground space-y-1">
                <span className="font-black uppercase tracking-wider text-[10px] text-danger block">
                  Admin Feedback:
                </span>
                <p className="font-semibold text-muted-foreground">
                  {user.sellerVerificationRejectionReason}
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/seller/register"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-danger text-white rounded-xl text-xs font-bold shadow-xs hover:bg-danger/90"
              >
                <span>Edit Profile Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleSubmitVerification}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl text-xs font-bold shadow-xs hover:bg-secondary/90 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Resubmitting...</span>
                  </>
                ) : (
                  <span>Resubmit for Review</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </SellerLayout>
    );
  }

  // Pending admin review
  if (user?.sellerVerificationStatus === 'pending' || submitted) {
    return (
      <SellerLayout>
        <div className="max-w-xl mx-auto space-y-6 font-sans py-8 text-center">
          <div className="p-8 rounded-3xl border border-amber-500/30 bg-amber-500/10 space-y-4">
            <div className="h-16 w-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="h-8 w-8 animate-pulse" />
            </div>
            <h2 className="font-serif text-2xl font-extrabold text-foreground">
              Verification Under Review
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We have received your verification request! An administrator is reviewing your store information. Review typically completes within 24–48 hours.
            </p>
            <div className="pt-2">
              <Link
                href="/seller/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-white rounded-2xl text-xs font-bold shadow-sm"
              >
                <span>Go to Seller Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </SellerLayout>
    );
  }


  return (
    <SellerLayout>
      <div className="max-w-2xl mx-auto space-y-6 font-sans pb-16">
        {/* Header */}
        <div>
          <Link
            href="/seller/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Seller Account Verification
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit your completed store details for admin review to become an approved campus seller.
          </p>
        </div>

        {apiError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-2xl border border-danger/25 bg-danger/10 p-3.5 text-xs font-bold text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Store Summary Card */}
        <div className="border border-border/80 rounded-3xl p-6 bg-card shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <Store className="h-4 w-4 text-secondary" />
            <span>Review Submission Details</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Store Name
              </span>
              <p className="font-bold text-foreground mt-0.5">
                {user?.sellerProfile?.storeName || user?.name}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Phone Number
              </span>
              <p className="font-bold text-foreground mt-0.5">{user?.phone || 'Not provided'}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                UPI Payout ID
              </span>
              <p className="font-bold text-foreground mt-0.5">
                {user?.sellerProfile?.payoutDetails?.upiId || 'Not set'}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Profile Status
              </span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                ✓ Ready for Review
              </p>
            </div>
          </div>
        </div>

        {/* Verification Submission Action */}
        <div className="p-6 rounded-3xl border border-secondary/20 bg-secondary/5 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Official BookFry Admin Review
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Once submitted, a BookFry administrator will review your campus credentials and store setup.
                There is no automatic self-verification — all verifications are reviewed to protect student buyers.
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmitVerification}
            disabled={isSubmitting}
            className="flex w-full h-12 items-center justify-center gap-2 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-extrabold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting for Review...</span>
              </>
            ) : (
              <>
                <span>Submit Profile for Admin Verification</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </SellerLayout>
  );
}
