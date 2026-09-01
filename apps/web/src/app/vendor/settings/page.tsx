'use client';

import React, { useState } from 'react';
import { VendorLayout } from '@/components/vendor/vendor-layout';
import { RoleHero } from '@/components/shared/role-hero';
import { Save, CheckCircle, Building, Landmark, Truck } from 'lucide-react';

export default function VendorSettingsPage() {

  const [businessName, setBusinessName] = useState('Standard Academic Bookstore');
  const [gstin, setGstin] = useState('07AAAAA0000A1Z5');
  const [warehouseAddress, setWarehouseAddress] = useState('Plot 42, Okhla Industrial Area Phase III, New Delhi, 110020');
  const [bankAccount, setBankAccount] = useState('98765432109876');
  const [ifsc, setIfsc] = useState('HDFC0001234');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <VendorLayout>
      <RoleHero
        title="Vendor Store &amp; Warehouse Settings"
        subtitle="Manage business identity, GSTIN registration, warehouse pickup address, and direct bank settlement details."
        badgeText="Merchant Account Configuration"
        stats={[
          { label: 'Merchant Status', value: 'Verified', badge: 'Active Partner', isPositive: true },
          { label: 'GSTIN Verified', value: '07AAAA...', badge: 'Compliant', isPositive: true },
          { label: 'Pickup SLA', value: 'Same Day', badge: 'Courier Ready', isPositive: true },
          { label: 'Bank Settlement', value: 'Verified', badge: 'Auto Payout', isPositive: true },
        ]}
      />

      <div className="w-full font-sans space-y-6">
        {saved && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2 shadow-xs">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>Vendor configuration updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Business Profile */}
          <div className="border border-border/80 bg-card rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
            <h2 className="font-serif text-base sm:text-lg font-bold text-foreground flex items-center space-x-2">
              <Building className="h-5 w-5 text-secondary" />
              <span>Business Profile &amp; GSTIN Registration</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-muted-foreground mb-1.5 uppercase text-[10px]">
                  Registered Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-semibold focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1.5 uppercase text-[10px]">
                  GSTIN Number *
                </label>
                <input
                  type="text"
                  required
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-mono uppercase font-bold focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Warehouse Pickup Address */}
          <div className="border border-border/80 bg-card rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
            <h2 className="font-serif text-base sm:text-lg font-bold text-foreground flex items-center space-x-2">
              <Truck className="h-5 w-5 text-secondary" />
              <span>Warehouse Logistics &amp; Pickup Address</span>
            </h2>

            <div className="text-xs">
              <label className="block font-bold text-muted-foreground mb-1.5 uppercase text-[10px]">
                Full Street &amp; Warehouse Address (For DTDC / India Post Courier Pickup) *
              </label>
              <textarea
                rows={3}
                required
                value={warehouseAddress}
                onChange={(e) => setWarehouseAddress(e.target.value)}
                className="w-full p-3.5 border border-border/80 rounded-2xl bg-background text-foreground font-medium focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>
          </div>

          {/* Bank Settlement Details */}
          <div className="border border-border/80 bg-card rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
            <h2 className="font-serif text-base sm:text-lg font-bold text-foreground flex items-center space-x-2">
              <Landmark className="h-5 w-5 text-secondary" />
              <span>Direct Bank Settlement (NEFT / RTGS)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-muted-foreground mb-1.5 uppercase text-[10px]">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-mono font-bold focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1.5 uppercase text-[10px]">
                  Bank IFSC Code *
                </label>
                <input
                  type="text"
                  required
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-mono uppercase font-bold focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-black rounded-2xl transition-all shadow-md shadow-secondary/20 text-xs uppercase tracking-wider flex items-center space-x-2 active:scale-95 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Store Configuration</span>
          </button>
        </form>
      </div>
    </VendorLayout>
  );
}
