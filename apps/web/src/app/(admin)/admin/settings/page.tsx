'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import {
  Save,
  CreditCard,
  Truck,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';

interface PlatformSettings {
  commissionPercent: number;
  flatShippingFee: number;
  taxPercent: number;
  returnWindowDays: number;
  maintenanceMode: boolean;
}

export default function AdminSettingsPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const { data: settingsData } = useQuery<PlatformSettings>({
    queryKey: ['admin-settings'],
    queryFn: () => apiClient('/admin/settings'),
    enabled: !!isAdmin,
  });

  const [commission, setCommission] = useState(10);
  const [shippingFee, setShippingFee] = useState(40);
  const [gstRate, setGstRate] = useState(18);
  const [returnWindow, setReturnWindow] = useState(7);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settingsData) {
      setCommission(settingsData.commissionPercent ?? 10);
      setShippingFee(settingsData.flatShippingFee ?? 40);
      setGstRate(settingsData.taxPercent ?? 18);
      setReturnWindow(settingsData.returnWindowDays ?? 7);
      setMaintenanceMode(settingsData.maintenanceMode ?? false);
    }
  }, [settingsData]);

  const updateSettingsMutation = useMutation({
    mutationFn: (payload: Partial<PlatformSettings>) =>
      apiClient('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <AdminEmptyState
          title="Access Restricted"
          description="Super Administrator role required to modify platform parameters."
          mascotVariant="reading"
        />
      </AdminLayout>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      commissionPercent: Number(commission),
      flatShippingFee: Number(shippingFee),
      taxPercent: Number(gstRate),
      returnWindowDays: Number(returnWindow),
      maintenanceMode,
    });
  };

  return (
    <AdminLayout>
      <AdminHero
        title="Marketplace System & Store Settings"
        subtitle="Configure platform commission fees, GST tax rates, shipping rates, return window days, and payment gateway options."
        badgeText="System Control & Parameters"
        stats={[
          { label: 'Platform Fee', value: `${commission}%`, badge: 'Commission', isPositive: true },
          { label: 'Shipping Rate', value: `₹${shippingFee}`, badge: 'Flat Delivery', isPositive: true },
          { label: 'GST Tax Rate', value: `${gstRate}%`, badge: 'Tax Rate', isPositive: true },
          { label: 'System Mode', value: maintenanceMode ? 'Maintenance' : 'Online Store', badge: maintenanceMode ? 'Alert' : 'Active', isPositive: !maintenanceMode },
        ]}
      />

      <div className="w-full font-sans space-y-6">
        {saved && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2 shadow-xs">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>Platform settings saved and applied system-wide!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Financial & Commission Settings */}
          <div className="border border-border/80 bg-card rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="font-serif text-base sm:text-lg font-bold text-foreground flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-secondary" />
                <span>Financial Rates &amp; Taxation</span>
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full border border-secondary/20">
                Rates
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-muted-foreground mb-1.5 uppercase text-[10px]">
                  BookFry Platform Fee (%)
                </label>
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-mono font-bold text-sm focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1.5 uppercase text-[10px]">
                  Flat Campus Shipping (₹)
                </label>
                <input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-mono font-bold text-sm focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1.5 uppercase text-[10px]">
                  GST Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-mono font-bold text-sm focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Gateways */}
          <div className="border border-border/80 bg-card rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="font-serif text-base sm:text-lg font-bold text-foreground flex items-center space-x-2">
                <Truck className="h-5 w-5 text-secondary" />
                <span>Active Checkout Payout Gateways</span>
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full border border-secondary/20">
                Gateways
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center space-x-3 p-3.5 border border-border/80 rounded-2xl bg-muted/30 cursor-pointer hover:bg-muted/60 transition-all">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-secondary rounded" />
                <span className="font-bold text-foreground">UPI Payments (Razorpay / PhonePe / GPay)</span>
              </label>

              <label className="flex items-center space-x-3 p-3.5 border border-border/80 rounded-2xl bg-muted/30 cursor-pointer hover:bg-muted/60 transition-all">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-secondary rounded" />
                <span className="font-bold text-foreground">Credit / Debit Cards &amp; NetBanking</span>
              </label>

              <label className="flex items-center space-x-3 p-3.5 border border-border/80 rounded-2xl bg-muted/30 cursor-pointer hover:bg-muted/60 transition-all">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-secondary rounded" />
                <span className="font-bold text-foreground">Campus Cash on Delivery (COD) for Verified Pincodes</span>
              </label>
            </div>
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="border border-border/80 bg-card rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="font-serif text-base sm:text-lg font-bold text-foreground flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Platform Maintenance Mode</span>
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Guard
              </span>
            </div>

            <label className="flex items-center space-x-3 text-xs font-semibold cursor-pointer p-3.5 border border-border/80 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-all">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-4 w-4 text-secondary rounded"
              />
              <span className="text-foreground font-bold">
                Enable Maintenance Mode (Pauses buyer checkout while keeping store catalog visible)
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-black rounded-2xl transition-all shadow-md shadow-secondary/20 text-xs uppercase tracking-wider flex items-center space-x-2 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {updateSettingsMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{updateSettingsMutation.isPending ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
