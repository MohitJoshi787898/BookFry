'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { SellerSidebar } from '@/components/seller/seller-sidebar';
import { SellerStatsCards } from '@/components/seller/seller-stats-cards';
import { SellerListingsList } from '@/components/seller/seller-listings-list';
import { SellerAddBookForm } from '@/components/seller/seller-add-book-form';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { Book, SellerAnalytics, Category } from '@bookmarket/types';
import { CheckCircle2, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const queryClient = useQueryClient();

  const [isPublishing, setIsPublishing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Queries
  const { data: stats, isLoading: isStatsLoading } = useQuery<SellerAnalytics>({
    queryKey: ['seller-dashboard'],
    queryFn: () => apiClient('/seller/dashboard'),
    enabled: isAuthenticated,
  });

  const {
    data: listingsRaw,
    isLoading: isListingsLoading,
    refetch: refetchListings,
  } = useQuery<{ listings?: Book[] } | Book[]>({
    queryKey: ['seller-listings-dashboard'],
    queryFn: () => apiClient('/seller/listings?page=1&limit=100'),
    enabled: isAuthenticated,
  });

  const listings: Book[] = Array.isArray(listingsRaw)
    ? listingsRaw
    : listingsRaw?.listings || [];

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient('/categories'),
  });

  // Submit new book listing
  const handlePublishListing = async (formData: FormData) => {
    setIsPublishing(true);
    try {
      await apiClient('/books', {
        method: 'POST',
        body: formData,
      });

      setSuccessToast('Book listed successfully! It is now live in your catalog.');
      refetchListings();
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Submit listing error:', err);
      alert('Failed to submit listing. Please verify the details and try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Archive listing
  const handleArchiveListing = async (id: string) => {
    if (confirm('Are you sure you want to archive this listing?')) {
      try {
        await apiClient(`/books/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'archived' }),
        });
        refetchListings();
        queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      } catch (err) {
        console.error('Archive error:', err);
      }
    }
  };

  const activeCount = listings.filter((b) => b.status === 'active').length;

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      {/* Main Full-Width Dashboard Container */}
      <div className="flex-grow w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 xl:gap-8">
        
        {/* Left Sidebar Navigation */}
        <SellerSidebar user={user} totalListings={listings.length} />

        {/* Right Main Dashboard Area (Fluid Full-Width) */}
        <main className="flex-1 min-w-0 space-y-6 sm:space-y-8">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
                  Seller Dashboard
                </h1>
                <span className="bg-brand/10 text-brand dark:bg-brand/20 dark:text-primary text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Hub
                </span>
              </div>
              <p className="text-xs text-text-secondary font-sans">
                BookFry • India&apos;s Book Marketplace • <span className="text-brand dark:text-primary font-medium italic">क्योंकि.. पढ़ाई रुकनी नहीं चाहिए</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold font-sans">
              <Link
                href="/seller/orders"
                className="px-4 py-2.5 bg-background hover:bg-muted border border-border rounded-xl text-text-primary transition-all shadow-xs"
              >
                Manage Orders
              </Link>
              <Link
                href="/seller/earnings"
                className="px-4 py-2.5 bg-background hover:bg-muted border border-border rounded-xl text-text-primary transition-all shadow-xs"
              >
                Earnings Ledger
              </Link>
              <Link
                href="/sell"
                className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Quick Sell</span>
              </Link>
            </div>
          </div>

          {/* Success Alert */}
          {successToast && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Unauthenticated State Warning */}
          {!isAuthenticated ? (
            <div className="bg-card border border-warning/30 rounded-2xl p-8 text-center space-y-4 shadow-sm">
              <ShieldAlert className="h-12 w-12 text-warning mx-auto" />
              <div className="space-y-1">
                <h2 className="font-serif text-xl font-bold text-text-primary">
                  Authentication Required
                </h2>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  Please log in to your verified seller account to access listings, sales analytics, and order fulfillment.
                </p>
              </div>
              <button
                onClick={() => openModal('login', '/seller/dashboard')}
                className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl text-xs transition-all shadow-sm"
              >
                Sign In to Seller Account
              </button>
            </div>
          ) : (
            <>
              {/* 1. Metrics / Analytics Row */}
              <SellerStatsCards
                stats={stats}
                isLoading={isStatsLoading}
                activeCount={activeCount}
                totalCount={listings.length}
              />

              {/* 2. Main Full-Width Split: Listings (7 cols) + Add Book Form (5 cols) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
                <div className="xl:col-span-7">
                  <SellerListingsList
                    listings={listings}
                    isLoading={isListingsLoading}
                    onArchive={handleArchiveListing}
                  />
                </div>

                <div className="xl:col-span-5">
                  <SellerAddBookForm
                    categories={categories}
                    onSubmit={handlePublishListing}
                    isPublishing={isPublishing}
                  />
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}
