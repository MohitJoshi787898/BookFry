'use client';

import React from 'react';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';
import { SellerAnalytics } from '@bookmarket/types';

interface SellerStatsCardsProps {
  stats?: SellerAnalytics;
  isLoading?: boolean;
  activeCount: number;
  totalCount: number;
}

export function SellerStatsCards({
  stats,
  isLoading = false,
  activeCount,
  totalCount,
}: SellerStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 font-sans">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm animate-pulse flex items-center justify-between"
          >
            <div className="space-y-2 flex-1">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-7 w-32 bg-muted rounded" />
              <div className="h-2.5 w-20 bg-muted rounded" />
            </div>
            <div className="h-11 w-11 bg-muted rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  const earnings = stats?.totalEarnings ?? 0;
  const totalSales = stats?.totalSales ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 font-sans">
      {/* 1. Net Earnings */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
            Total Net Earnings
          </span>
          <p className="text-2xl font-black text-brand dark:text-primary">
            ₹{earnings.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-success font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>Verified Payouts</span>
          </div>
        </div>
        <div className="p-3 bg-brand/10 text-brand dark:bg-brand/20 dark:text-primary rounded-xl group-hover:scale-105 transition-transform shrink-0">
          <DollarSign className="h-5 w-5" />
        </div>
      </div>

      {/* 2. Total Books Sold */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
            Books Sold
          </span>
          <p className="text-2xl font-black text-text-primary">
            {totalSales} <span className="text-xs font-semibold text-text-secondary">copies</span>
          </p>
          <p className="text-[11px] text-text-muted">Direct Student Orders</p>
        </div>
        <div className="p-3 bg-success/10 text-success rounded-xl group-hover:scale-105 transition-transform shrink-0">
          <ShoppingBag className="h-5 w-5" />
        </div>
      </div>

      {/* 3. Active Listings */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
            Active Listings
          </span>
          <p className="text-2xl font-black text-text-primary">
            {activeCount} <span className="text-xs font-semibold text-text-secondary">active</span>
          </p>
          <p className="text-[11px] text-text-muted">{totalCount} total in catalog</p>
        </div>
        <div className="p-3 bg-accent/10 text-secondary rounded-xl group-hover:scale-105 transition-transform shrink-0">
          <Package className="h-5 w-5" />
        </div>
      </div>

      {/* 4. Store Health / Circular Impact */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
            Eco Impact
          </span>
          <p className="text-2xl font-black text-text-primary">
            {Math.max(1, totalSales + activeCount)}{' '}
            <span className="text-xs font-semibold text-text-secondary">recycled</span>
          </p>
          <p className="text-[11px] text-success font-semibold">🌱 Circular Learning</p>
        </div>
        <div className="p-3 bg-brand/10 text-brand dark:bg-brand/20 dark:text-primary rounded-xl group-hover:scale-105 transition-transform shrink-0">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
