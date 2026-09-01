'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorLayout } from '@/components/vendor/vendor-layout';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleFilterBar } from '@/components/shared/role-filter-bar';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { AdminDialog } from '@/components/admin/admin-dialog';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Book } from '@bookmarket/types';
import { Layers, Plus, RefreshCw } from 'lucide-react';

export default function VendorInventoryPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [restockBook, setRestockBook] = useState<Book | null>(null);
  const [addUnits, setAddUnits] = useState(10);

  const { data: listingsRaw = [], isError, refetch } = useQuery<Book[]>({
    queryKey: ['vendor-inventory-data'],
    queryFn: async () => {
      const res = await apiClient<{ listings?: Book[] } | Book[]>('/seller/listings?page=1&limit=100');
      return Array.isArray(res) ? res : res?.listings || [];
    },
    enabled: isAuthenticated,
  });

  const restockMutation = useMutation({
    mutationFn: ({ id, newStock }: { id: string; newStock: number }) =>
      apiClient(`/books/${id}`, { method: 'PATCH', body: JSON.stringify({ stock: newStock }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-inventory-data'] });
      setRestockBook(null);
    },
  });

  if (!isAuthenticated) {
    return (
      <VendorLayout>
        <RoleEmptyState
          title="Sign In to Manage Inventory"
          description="Track stock replenishment, low stock warnings, and warehouse levels."
          mascotVariant="reading"
        />
      </VendorLayout>
    );
  }

  const lowStock = listingsRaw.filter((b) => (b.stock || 0) <= 3 && (b.stock || 0) > 0);
  const outOfStock = listingsRaw.filter((b) => (b.stock || 0) === 0);
  const healthyStock = listingsRaw.filter((b) => (b.stock || 0) > 3);

  const filtered = listingsRaw.filter((b) => {
    if (stockFilter === 'low' && ((b.stock || 0) > 3 || (b.stock || 0) === 0)) return false;
    if (stockFilter === 'out' && (b.stock || 0) > 0) return false;
    if (stockFilter === 'healthy' && (b.stock || 0) <= 3) return false;
    if (searchQuery.trim()) {
      return b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const filterChips = [
    { id: '', label: 'All Inventory', count: listingsRaw.length },
    { id: 'low', label: 'Low Stock (<3)', count: lowStock.length },
    { id: 'out', label: 'Out of Stock (0)', count: outOfStock.length },
    { id: 'healthy', label: 'Healthy Stock', count: healthyStock.length },
  ];

  return (
    <VendorLayout>
      <RoleHero
        title="Inventory Levels &amp; Stock Health"
        subtitle="Real-time monitoring of textbook SKU quantities, warehouse buffer warnings, and quick bulk restock triggers."
        badgeText="Inventory Management Engine"
        stats={[
          { label: 'Total SKUs', value: listingsRaw.length, badge: 'Tracked', isPositive: true },
          { label: 'Low Stock', value: lowStock.length, badge: lowStock.length > 0 ? 'Urgent' : 'Zero', isPositive: lowStock.length === 0 },
          { label: 'Out of Stock', value: outOfStock.length, badge: outOfStock.length > 0 ? 'Action' : 'Zero', isPositive: outOfStock.length === 0 },
          { label: 'Total Units', value: listingsRaw.reduce((sum, b) => sum + (b.stock || 0), 0), badge: 'In Stock', isPositive: true },
        ]}
      />

      <RoleFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search SKU, book title, or author..."
        filterChips={filterChips}
        activeFilter={stockFilter}
        onFilterSelect={setStockFilter}
      />

      {isError ? (
        <RoleEmptyState
          title="Inventory Load Error"
          description="Failed to load warehouse inventory records."
          mascotVariant="pointing"
          action={{ label: 'Retry Fetch', onClick: () => refetch() }}
        />
      ) : filtered.length === 0 ? (
        <RoleEmptyState
          title="No Inventory Items Found"
          description="Try switching filters or clearing your search term."
          mascotVariant="searching"
        />
      ) : (
        <div className="space-y-3 font-sans">
          {filtered.map((book) => {
            const stock = book.stock || 0;
            const isLow = stock <= 3 && stock > 0;
            const isOut = stock === 0;

            return (
              <div
                key={book.id}
                className="p-4 sm:p-5 rounded-3xl border border-border/80 bg-card hover:border-secondary/40 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        isOut
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          : isLow
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {isOut ? 'Out of Stock' : isLow ? 'Low Stock Warning' : 'Healthy Inventory'}
                    </span>
                    <span className="font-mono font-bold text-xs text-muted-foreground">₹{book.price}</span>
                  </div>

                  <h3 className="font-serif text-sm sm:text-base font-bold text-foreground truncate">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">by {book.author}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Warehouse Stock</span>
                    <span className={`font-mono font-black text-sm sm:text-base ${isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-foreground'}`}>
                      {stock} units
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setRestockBook(book);
                      setAddUnits(10);
                    }}
                    className="px-3.5 py-2 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Restock</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RESTOCK MODAL */}
      {restockBook && (
        <AdminDialog
          isOpen={true}
          onClose={() => setRestockBook(null)}
          size="md"
          title={`Restock ${restockBook.title}`}
          subtitle="Add warehouse units to current inventory"
          icon={<Layers className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button type="button" onClick={() => setRestockBook(null)} className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl">Cancel</button>
              <button
                type="button"
                disabled={restockMutation.isPending}
                onClick={() => restockMutation.mutate({ id: restockBook.id, newStock: (restockBook.stock || 0) + Number(addUnits) })}
                className="px-5 py-2 bg-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {restockMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Add {addUnits} Units</span>
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">Current Stock:</span>
              <span className="font-mono font-bold text-foreground">{restockBook.stock || 0} units</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Units to Add to Warehouse *</label>
              <input
                type="number"
                min={1}
                value={addUnits}
                onChange={(e) => setAddUnits(Math.max(1, Number(e.target.value)))}
                className="w-full p-2.5 border border-border/80 rounded-xl bg-background text-foreground text-xs font-mono font-bold focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>
          </div>
        </AdminDialog>
      )}
    </VendorLayout>
  );
}
