'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { SellerLayout } from '@/components/seller/seller-layout';
import { BuyerUpgradeForm } from '@/components/seller/buyer-upgrade-form';
import { SellerRegisterEmbed } from '@/components/auth/seller-register-embed';
import { usePlatformSettings } from '@/hooks/use-platform-settings';
import { Store, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SellerRegisterPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { sellerRegistrationEnabled } = usePlatformSettings();

  useEffect(() => {
    // If user is already a seller with complete onboarding, redirect directly to dashboard
    if (isAuthenticated && user?.roles?.includes('seller') && user?.sellerOnboardingStatus === 'complete') {
      router.replace('/seller/dashboard');
    }
  }, [isAuthenticated, user, router]);

  return (
    <SellerLayout>
      <div className="max-w-3xl mx-auto space-y-6 font-sans pb-16">
        {/* Header navigation & title */}
        <div>
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Marketplace</span>
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/25 text-secondary text-[10px] font-black uppercase tracking-wider">
              <Store className="h-3 w-3" />
              <span>Campus Seller Portal</span>
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {isAuthenticated ? 'Set Up Your BookFry Bookstore' : 'Open Your Campus Book Store'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isAuthenticated
              ? 'Complete your store details and UPI ID to start selling textbooks on campus.'
              : 'Sign up in minutes to list textbooks for free and receive direct UPI payouts.'}
          </p>
        </div>

        {/* Content router: authenticated buyer upgrade vs unauthenticated registration */}
        {isAuthenticated ? (
          <BuyerUpgradeForm />
        ) : sellerRegistrationEnabled ? (
          <div className="w-full">
            <SellerRegisterEmbed />
          </div>
        ) : (
          <div className="w-full p-8 border border-border/80 bg-card rounded-3xl shadow-sm text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto text-secondary">
              <Store className="h-6 w-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="font-serif text-xl font-bold text-foreground">
                Seller Registrations Temporarily Paused
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dedicated bookstore registrations are temporarily closed during our launch phase. You can create a student buyer account to browse textbooks or sell your pre-owned books directly on the marketplace.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl bg-secondary text-white font-bold text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-xs"
              >
                Create Buyer Account
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition-all"
              >
                Existing User Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
