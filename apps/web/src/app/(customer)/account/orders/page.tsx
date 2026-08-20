"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { apiClient } from "@/lib/api-client";
import { Order } from "@bookmarket/types";
import { ReturnRequestModal } from "@/components/shared/return-request-modal";
import { OrdersHeroHeader } from "@/components/orders/orders-hero-header";
import { OrdersFilterBar, OrderFilterTab } from "@/components/orders/orders-filter-bar";
import { OrdersPolicyBanner } from "@/components/orders/orders-policy-banner";
import { OrdersCardItem } from "@/components/orders/orders-card-item";
import { OrdersSkeleton } from "@/components/orders/orders-skeleton";
import { OrdersEmptyState } from "@/components/orders/orders-empty-state";
import { AlertCircle } from "lucide-react";

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderFilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ["buyer-orders"],
    queryFn: () => apiClient("/orders"),
  });

  // Tab Filtering & Search
  const filteredOrders = orders.filter((order) => {
    // 1. Tab filter
    if (activeTab === "in_progress" && !["pending", "confirmed", "shipped"].includes(order.status)) {
      return false;
    }
    if (activeTab === "delivered" && order.status !== "delivered") {
      return false;
    }
    if (activeTab === "returns" && !["return_requested", "return_approved", "return_rejected"].includes(order.status)) {
      return false;
    }
    if (activeTab === "cancelled" && !["cancelled", "refunded"].includes(order.status)) {
      return false;
    }

    // 2. Search query filter (Order number or item title)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchOrderNum = order.orderNumber.toLowerCase().includes(q);
      const matchTitle = order.items.some((item) => item.title.toLowerCase().includes(q));
      return matchOrderNum || matchTitle;
    }

    return true;
  });

  const tabCounts: Record<OrderFilterTab, number> = {
    all: orders.length,
    in_progress: orders.filter((o) => ["pending", "confirmed", "shipped"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    returns: orders.filter((o) => ["return_requested", "return_approved", "return_rejected"].includes(o.status)).length,
    cancelled: orders.filter((o) => ["cancelled", "refunded"].includes(o.status)).length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner Header */}
        <OrdersHeroHeader orders={orders} />

        {/* Used Book Requests Banner Link */}
        <div className="my-4 p-4 rounded-2xl bg-brand/10 border border-brand/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Looking for your Used Book Requests?</h3>
            <p className="text-xs text-text-secondary">Requests sent directly to sellers for second-hand books are managed on a dedicated page.</p>
          </div>
          <Link
            href="/account/requests"
            className="px-4 py-2 bg-brand text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-brand-hover transition-colors shrink-0 shadow-xs"
          >
            View Used Requests
          </Link>
        </div>

        {/* 7-Day Return Policy Banner */}
        <OrdersPolicyBanner />

        {/* Filter Tabs & Search */}
        <OrdersFilterBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          counts={tabCounts}
        />

        {/* Orders Content */}
        {isLoading ? (
          <OrdersSkeleton />
        ) : isError ? (
          <div className="text-center py-12 rounded-3xl bg-card border border-border/80 p-8 space-y-4 my-6 shadow-sm">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-foreground font-serif">Failed to load order history</h2>
            <p className="text-sm text-muted-foreground">Check your connection or session credentials.</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 rounded-2xl bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-md"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <OrdersEmptyState searchQuery={searchQuery} onClearSearch={() => setSearchQuery("")} />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrdersCardItem
                key={order.id}
                order={order}
                onOpenReturnModal={(ord) => setReturnModalOrder(ord)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Return Request Modal */}
      {returnModalOrder && (
        <ReturnRequestModal
          orderId={returnModalOrder.id}
          orderNumber={returnModalOrder.orderNumber}
          returnWindowDays={7}
          onClose={() => setReturnModalOrder(null)}
        />
      )}
    </div>
  );
}
