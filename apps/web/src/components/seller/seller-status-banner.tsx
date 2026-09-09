'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { SellerOnboardingStatus, SellerVerificationStatus } from '@bookmarket/types';

interface SellerStatusBannerProps {
  onboardingStatus?: SellerOnboardingStatus;
  verificationStatus?: SellerVerificationStatus;
  rejectionReason?: string;
}

/**
 * Renders the appropriate status banner based on seller onboarding and verification state.
 * Shown at the top of the seller dashboard. Returns null if seller is verified and complete.
 */
export function SellerStatusBanner({
  onboardingStatus,
  verificationStatus,
  rejectionReason,
}: SellerStatusBannerProps) {
  // Profile incomplete — must complete before anything else
  if (onboardingStatus === 'incomplete') {
    return (
      <div
        role="alert"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl border border-danger/25 bg-danger/8 font-sans"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-danger/15 shrink-0">
            <AlertCircle className="h-5 w-5 text-danger" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-foreground">
              Complete Your Seller Profile
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Your seller profile is missing required information (store name, phone, UPI ID).
              Complete your profile to start listing books.
            </p>
          </div>
        </div>
        <Link
          href="/seller/register"
          className="px-4 py-2 bg-danger hover:bg-danger/90 text-white font-black text-xs rounded-2xl transition-all shadow-xs shrink-0 self-end sm:self-center flex items-center gap-1.5"
        >
          <span>Complete Profile</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  // Profile complete, verification rejected — must fix and resubmit
  if (verificationStatus === 'rejected') {
    return (
      <div
        role="alert"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl border border-danger/25 bg-danger/8 font-sans"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-danger/15 shrink-0">
            <XCircle className="h-5 w-5 text-danger" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-foreground">Verification Rejected</h4>
            {rejectionReason && (
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Reason: <span className="text-foreground font-semibold">{rejectionReason}</span>
              </p>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Update your seller profile and resubmit for review.
            </p>
          </div>
        </div>
        <Link
          href="/seller/register"
          className="px-4 py-2 bg-danger hover:bg-danger/90 text-white font-black text-xs rounded-2xl transition-all shadow-xs shrink-0 self-end sm:self-center flex items-center gap-1.5"
        >
          <span>Fix & Resubmit</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  // Profile complete, not yet submitted for verification
  if (verificationStatus === 'not_submitted') {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl border border-secondary/25 bg-secondary/8 font-sans">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-secondary/15 shrink-0">
            <ShieldCheck className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-foreground">Ready for Verification</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Your profile is complete. Submit it for admin review to get the &quot;Verified
              Seller&quot; badge and increase buyer trust.
            </p>
          </div>
        </div>
        <Link
          href="/seller/verify"
          className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white font-black text-xs rounded-2xl transition-all shadow-xs shrink-0 self-end sm:self-center flex items-center gap-1.5"
        >
          <span>Submit Verification</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  // Pending admin review
  if (verificationStatus === 'pending') {
    return (
      <div className="flex items-start gap-3 p-4 sm:p-5 rounded-3xl border border-amber-500/25 bg-amber-500/8 font-sans">
        <div className="p-2.5 rounded-2xl bg-amber-500/15 shrink-0">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-foreground">Verification Under Review</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            Your seller profile is under admin review. This usually takes 1–2 business days.
            You&apos;ll receive a notification once reviewed.
          </p>
        </div>
      </div>
    );
  }

  // Approved — show nothing (or a success badge handled elsewhere)
  if (verificationStatus === 'approved') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-success/25 bg-success/8 font-sans">
        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
        <p className="text-xs font-bold text-success">
          ✓ Verified BookFry Seller — Buyers see your verification badge on all listings.
        </p>
      </div>
    );
  }

  return null;
}

export default SellerStatusBanner;
