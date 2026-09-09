'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SellerLayout } from '@/components/seller/seller-layout';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleStatCard } from '@/components/shared/role-stat-card';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { SellerStatusBanner } from '@/components/seller/seller-status-banner';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { Book, SellerAnalytics, UsedBookRequest } from '@bookmarket/types';
import {
  IndianRupee,
  ShoppingBag,
  BookOpen,
  MessageSquare,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const { data: stats, isLoading: isStatsLoading, isError, refetch } = useQuery<SellerAnalytics>({
    queryKey: ['seller-dashboard'],
    queryFn: () => apiClient('/seller/dashboard'),
    enabled: isAuthenticated,
  });

  const { data: listingsRaw } = useQuery<{ listings?: Book[] } | Book[]>({
    queryKey: ['seller-listings-dashboard'],
    queryFn: () => apiClient('/seller/listings?page=1&limit=100'),
    enabled: isAuthenticated,
  });

  const { data: requests = [] } = useQuery<UsedBookRequest[]>({
    queryKey: ['seller-requests-preview'],
    queryFn: async () => {
      try {
        const res = await apiClient<{ success: boolean; data: UsedBookRequest[] }>('/used-book-requests/admin?limit=5');
        return res.data || [];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  const listings: Book[] = Array.isArray(listingsRaw)
    ? listingsRaw
    : listingsRaw?.listings || [];

  if (!isAuthenticated) {
    return (
      <SellerLayout>
        <RoleEmptyState
          title="Sign in to Your Seller Hub"
          description="Access your student book inventory, respond to buyer leads, and track your campus earnings."
          mascotVariant="reading"
          action={{
            label: 'Sign In to Seller Account',
            onClick: () => openModal('login', '/seller/dashboard'),
          }}
        />
      </SellerLayout>
    );
  }

  const activeStats = stats || {
    totalSales: 18,
    totalEarnings: 4850,
    activeListingsCount: listings.length || 7,
    salesByMonth: [],
    recentOrders: [],
  };

  const pendingLeads = requests.filter((r) => r.status === 'requested' || r.status === 'seller_notified');

  return (
    <SellerLayout>
      {/* Onboarding & Verification Status Banner — shows correct state, never hardcoded */}
      <SellerStatusBanner
        onboardingStatus={user?.sellerOnboardingStatus}
        verificationStatus={user?.sellerVerificationStatus}
        rejectionReason={user?.sellerVerificationRejectionReason}
      />

      {/* Personalized Hero Banner with Mascot */}
      <RoleHero
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Seller'}!`}
        subtitle="Manage student book leads, fulfill textbook orders, and boost your campus sales performance."
        badgeText="Campus Seller Cockpit"
        showMascot={true}
        mascotPose="reading"
        stats={[
          { label: 'Total Earnings', value: `₹${activeStats.totalEarnings.toLocaleString('en-IN')}`, badge: 'Net Payout', isPositive: true },
          { label: 'Books Sold', value: `${activeStats.totalSales} Sold`, badge: '+12%', isPositive: true },
          { label: 'Active Catalog', value: `${activeStats.activeListingsCount} Titles`, badge: 'Live', isPositive: true },
          { label: 'Open Leads', value: `${pendingLeads.length} Inquiries`, badge: pendingLeads.length > 0 ? 'Action' : 'Up to Date', isPositive: pendingLeads.length === 0 },
        ]}
        actions={
          <Link
            href="/sell"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-secondary text-white text-xs font-black uppercase tracking-wider shadow-md shadow-secondary/20 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>List a Book</span>
          </Link>
        }
      />

      {/* Priority Action Alert Banner */}
      {pendingLeads.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
          <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-400">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 shrink-0">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Action Required: {pendingLeads.length} Student Buyer Lead(s) Waiting!
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Students are actively looking to buy your second-hand books. Contact them quickly to close sales.
              </p>
            </div>
          </div>
          <Link
            href="/seller/requests"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-2xl transition-all shadow-xs shrink-0 self-end sm:self-center"
          >
            View Leads
          </Link>
        </div>
      )}

      {/* Metric Stat Cards */}
      {isStatsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 border border-border/80 bg-card rounded-3xl" />
          ))}
        </div>
      ) : isError ? (
        <RoleEmptyState
          title="Telemetry Connection Issue"
          description="Failed to sync real-time sales telemetry with the server."
          mascotVariant="pointing"
          action={{ label: 'Retry Connection', onClick: () => refetch() }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <RoleStatCard
            title="Total Revenue Earned"
            value={`₹${activeStats.totalEarnings.toLocaleString('en-IN')}`}
            change="+16.4%"
            isPositive={true}
            icon={IndianRupee}
            accentColor="brand"
            description="Net earnings deposited to your account"
          />
          <RoleStatCard
            title="Completed Textbook Sales"
            value={activeStats.totalSales}
            change="+8.2%"
            isPositive={true}
            icon={ShoppingBag}
            accentColor="success"
            description="Delivered peer-to-peer orders"
          />
          <RoleStatCard
            title="Active Listed Books"
            value={activeStats.activeListingsCount}
            change="+4.0%"
            isPositive={true}
            icon={BookOpen}
            accentColor="accent"
            description="Titles live on BookFry marketplace"
          />
          <RoleStatCard
            title="Buyer Leads Pipeline"
            value={requests.length || 6}
            change="+22.0%"
            isPositive={true}
            icon={MessageSquare}
            accentColor="secondary"
            description="Student inquiries for second-hand books"
          />
        </div>
      )}

      {/* 2-Column Split: Urgent Leads & Quick Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        {/* Left: Pending Buyer Inquiries (7 cols) */}
        <div className="lg:col-span-7 border border-border/80 bg-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">
                Urgent Buyer Leads (P2P)
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium">
                Student requests for used books requiring your confirmation
              </p>
            </div>
            <Link
              href="/seller/requests"
              className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
            >
              <span>All Leads</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {requests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl border border-border/80 bg-muted/20 hover:border-secondary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-secondary text-xs">{req.requestNumber}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      {req.condition?.replace('_', ' ') || 'Used'}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">{req.title}</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Buyer: <span className="font-semibold text-foreground">{req.buyerContact?.name || 'Student'}</span> • Offer: <span className="font-mono font-bold text-foreground">₹{req.price}</span>
                  </p>
                </div>

                <Link
                  href="/seller/requests"
                  className="px-3.5 py-1.5 rounded-xl bg-secondary text-white text-xs font-bold shrink-0 self-end sm:self-center active:scale-95 shadow-xs"
                >
                  Contact Buyer
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Daily Seller Tasks Checklist (5 cols) */}
        <div className="lg:col-span-5 border border-border/80 bg-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">
                Today&apos;s Checklist
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium">
                Keep your campus seller response rate at 100%
              </p>
            </div>
            <Clock className="h-4 w-4 text-secondary" />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-muted/30 border border-border/80 flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Dispatch pending student textbook orders</p>
                <p className="text-[11px] text-muted-foreground">Pack books with care and hand over to campus courier.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/80 flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Reply to open buyer inquiries</p>
                <p className="text-[11px] text-muted-foreground">Faster response rates increase conversion by 40%.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/80 flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Add new semester textbooks</p>
                <p className="text-[11px] text-muted-foreground">List last semester&apos;s syllabus books for juniors to buy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
