'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { Settings, ShieldAlert, Save, ShieldCheck, CreditCard, Truck, AlertTriangle } from 'lucide-react';

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
        <div className="text-center py-16 border border-border bg-surface rounded-md font-sans space-y-4">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-text-primary">Access Restricted</h2>
        </div>
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border font-sans">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center space-x-2">
            <Settings className="h-7 w-7 text-brand" />
            <span>Marketplace System & Store Settings</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Configure platform commission fees, GST tax rates, shipping rates, and payment gateway options.
          </p>
        </div>
      </div>

      <div className="max-w-4xl font-sans space-y-6">
        {saved && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-md text-xs font-bold text-success flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Platform settings saved and applied system-wide!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Financial & Commission Settings */}
          <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-text-primary flex items-center space-x-2 border-b border-border pb-3">
              <CreditCard className="h-5 w-5 text-brand" />
              <span>Platform Financial & Tax Settings</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  BookFry Platform Fee (%)
                </label>
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary font-mono font-bold focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Flat Shipping Rate (₹)
                </label>
                <input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary font-mono font-bold focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  GST Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary font-mono font-bold focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
          </div>

          {/* Payment Gateways */}
          <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-text-primary flex items-center space-x-2 border-b border-border pb-3">
              <Truck className="h-5 w-5 text-brand" />
              <span>Payment Gateways & Payout Methods</span>
            </h2>

            <div className="space-y-3 text-xs">
              <label className="flex items-center space-x-3 p-3 border border-border rounded bg-background-subtle cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-brand rounded" />
                <span className="font-bold text-text-primary">UPI Payments (Razorpay / PhonePe / GPay)</span>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-border rounded bg-background-subtle cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-brand rounded" />
                <span className="font-bold text-text-primary">Credit / Debit Cards & NetBanking</span>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-border rounded bg-background-subtle cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-brand rounded" />
                <span className="font-bold text-text-primary">Cash on Delivery (COD) for Verified Pin Codes</span>
              </label>
            </div>
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-text-primary flex items-center space-x-2 border-b border-border pb-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Platform Maintenance Mode</span>
            </h2>

            <label className="flex items-center space-x-3 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-4 w-4 text-brand rounded"
              />
              <span className="text-text-primary">Enable Maintenance Mode (Restricts buyer purchases)</span>
            </label>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-brand hover:bg-brand-hover text-white font-bold rounded transition-all shadow text-xs uppercase tracking-wider flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Platform Settings</span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
