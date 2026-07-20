'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { useAuthStore } from '@/stores/auth.store';
import { Tag, Plus, CheckCircle2, ShieldAlert, Copy } from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrderValue: number;
  usageCount: number;
  maxUsage: number;
  status: 'active' | 'expired';
}

const mockPromos: PromoCode[] = [
  { id: '1', code: 'WELCOME100', type: 'flat', value: 100, minOrderValue: 499, usageCount: 142, maxUsage: 500, status: 'active' },
  { id: '2', code: 'CAMPUS20', type: 'percentage', value: 20, minOrderValue: 299, usageCount: 88, maxUsage: 200, status: 'active' },
  { id: '3', code: 'BOOKFRY50', type: 'flat', value: 50, minOrderValue: 199, usageCount: 310, maxUsage: 1000, status: 'active' },
  { id: '4', code: 'MONSOON15', type: 'percentage', value: 15, minOrderValue: 399, usageCount: 50, maxUsage: 50, status: 'expired' },
];

export default function AdminPromotionsPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');

  const [promos, setPromos] = useState<PromoCode[]>(mockPromos);
  const [code, setCode] = useState('');
  const [value, setValue] = useState(100);
  const [type, setType] = useState<'percentage' | 'flat'>('flat');
  const [minOrder, setMinOrder] = useState(299);

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newPromo: PromoCode = {
      id: String(Date.now()),
      code: code.toUpperCase().trim(),
      type,
      value: Number(value),
      minOrderValue: Number(minOrder),
      usageCount: 0,
      maxUsage: 500,
      status: 'active',
    };

    setPromos([newPromo, ...promos]);
    setCode('');
  };

  const columns: Column<PromoCode>[] = [
    {
      header: 'Coupon Code',
      cell: (p) => (
        <div className="inline-flex items-center space-x-2 font-mono font-bold text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded">
          <span>{p.code}</span>
          <Copy className="h-3 w-3 text-text-muted hover:text-brand cursor-pointer" onClick={() => navigator.clipboard.writeText(p.code)} />
        </div>
      ),
    },
    {
      header: 'Discount Value',
      cell: (p) => (
        <span className="font-bold text-text-primary">
          {p.type === 'percentage' ? `${p.value}% OFF` : `₹${p.value} OFF`}
        </span>
      ),
    },
    {
      header: 'Min Order Amount',
      cell: (p) => <span className="font-mono">₹{p.minOrderValue}</span>,
    },
    {
      header: 'Usage Metrics',
      cell: (p) => (
        <span className="text-xs text-text-secondary font-mono">
          {p.usageCount} / {p.maxUsage} claimed
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (p) => (
        <span
          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            p.status === 'active'
              ? 'bg-success/10 text-success border border-success/20'
              : 'bg-danger/10 text-danger border border-danger/20'
          }`}
        >
          <CheckCircle2 className="h-3 w-3" />
          <span>{p.status}</span>
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border font-sans">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center space-x-2">
            <Tag className="h-7 w-7 text-brand" />
            <span>Promotions & Coupon Codes</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Create discount codes, campus promotional offers, and order cashback vouchers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
        {/* Create Coupon Form Card */}
        <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-4 h-fit">
          <h2 className="font-serif text-lg font-bold text-text-primary flex items-center space-x-2 border-b border-border pb-3">
            <Plus className="h-5 w-5 text-brand" />
            <span>Create Coupon Code</span>
          </h2>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">
                Coupon Code Name
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. EXAM2026"
                className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary uppercase font-mono font-bold focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">
                  Discount Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'percentage' | 'flat')}
                  className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary focus:ring-2 focus:ring-brand"
                >
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">
                  Discount Value
                </label>
                <input
                  type="number"
                  required
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary font-mono focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">
                Minimum Order Amount (₹)
              </label>
              <input
                type="number"
                required
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
                className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary font-mono focus:ring-2 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-bold rounded transition-all shadow text-xs uppercase tracking-wider"
            >
              Issue Coupon Code
            </button>
          </form>
        </div>

        {/* Existing Coupons Table */}
        <div className="lg:col-span-2">
          <AdminDataTable
            title="Active Promotional Coupons"
            subtitle="Campus discounts & vouchers"
            data={promos}
            columns={columns}
            searchField="code"
            searchPlaceholder="Search coupon code..."
          />
        </div>
      </div>
    </AdminLayout>
  );
}
