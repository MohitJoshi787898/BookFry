'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/navbar';
import { RoleSelectorTab, RegistrationRole } from '@/components/auth/role-selector-tab';
import { BuyerRegisterCard } from '@/components/auth/buyer-register-card';
import { SellerRegisterEmbed } from '@/components/auth/seller-register-embed';
import { usePlatformSettings } from '@/hooks/use-platform-settings';
import { Tag, Truck, ShieldCheck, RotateCcw, Info } from 'lucide-react';

function RegisterContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sellerRegistrationEnabled } = usePlatformSettings();
  const initialRoleParam = searchParams.get('role');
  const [activeRole, setActiveRole] = useState<RegistrationRole>('buyer');

  useEffect(() => {
    if (sellerRegistrationEnabled && initialRoleParam === 'seller') {
      setActiveRole('seller');
    } else {
      setActiveRole('buyer');
    }
  }, [initialRoleParam, sellerRegistrationEnabled]);

  const handleRoleChange = (role: RegistrationRole) => {
    if (role === 'seller' && !sellerRegistrationEnabled) return;
    setActiveRole(role);
    router.replace(`/register?role=${role}`, { scroll: false });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Notice if user arrived via old /register?role=seller deep link while disabled */}
      {!sellerRegistrationEnabled && initialRoleParam === 'seller' && (
        <div className="w-full max-w-md mx-auto mb-4 p-3 bg-secondary/10 border border-secondary/25 rounded-2xl flex items-center gap-2 text-xs text-foreground font-medium">
          <Info className="h-4 w-4 text-secondary shrink-0" />
          <span>
            Dedicated seller onboarding is temporarily paused. Create a buyer account to purchase or list books.
          </span>
        </div>
      )}

      {sellerRegistrationEnabled && (
        <RoleSelectorTab activeRole={activeRole} onChange={handleRoleChange} />
      )}

      {activeRole === 'buyer' || !sellerRegistrationEnabled ? (
        <BuyerRegisterCard
          onSwitchToSeller={sellerRegistrationEnabled ? () => handleRoleChange('seller') : undefined}
        />
      ) : (
        <SellerRegisterEmbed onSwitchToBuyer={() => handleRoleChange('buyer')} />
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-96 w-full max-w-4xl bg-card border border-border rounded-3xl animate-pulse" />}>
          <RegisterContainer />
        </Suspense>
      </main>

      {/* Trust & Guarantee Ribbon */}
      <footer className="bg-card border-t border-border/60 py-5 font-sans">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-between text-left">
            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <Tag className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Up to 80% Off</h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">Verified Books</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Fast Delivery</h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">Direct Campus Dispatch</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Safe Escrow</h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">100% Guaranteed</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Easy Returns</h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">Hassle-Free Policy</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
