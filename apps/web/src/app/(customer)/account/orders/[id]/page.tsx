"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { apiClient } from "@/lib/api-client";
import { Order } from "@bookmarket/types";
import { ReturnRequestModal } from "@/components/shared/return-request-modal";
import { OrderDetailHeader } from "@/components/orders/detail/order-detail-header";
import { OrderDetailTracker } from "@/components/orders/detail/order-detail-tracker";
import { OrderDetailItems } from "@/components/orders/detail/order-detail-items";
import { OrderDetailSummary } from "@/components/orders/detail/order-detail-summary";
import { OrderDetailDelivery } from "@/components/orders/detail/order-detail-delivery";
import { MobileOrderBottomBar } from "@/components/orders/detail/mobile-order-bottom-bar";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface OrderDetailPageProps {
  params?: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params: paramsPromise }: OrderDetailPageProps) {
  const clientParams = useParams();
  const unwrappedParams = paramsPromise ? React.use(paramsPromise) : null;
  const orderId = (unwrappedParams?.id || clientParams?.id) as string;
  const [showReturnModal, setShowReturnModal] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery<Order>({
    queryKey: ["order-detail", orderId],
    queryFn: () => apiClient(`/orders/${orderId}`),
    enabled: !!orderId,
  });

  const handlePrintInvoice = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <main className="flex-grow max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pb-28 sm:pb-12">
        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-64 rounded-3xl bg-card border border-border/80" />
            <div className="h-44 rounded-3xl bg-card border border-border/80" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <div className="h-64 rounded-3xl bg-card border border-border/80" />
                <div className="h-56 rounded-3xl bg-card border border-border/80" />
              </div>
              <div className="lg:col-span-4">
                <div className="h-80 rounded-3xl bg-card border border-border/80" />
              </div>
            </div>
          </div>
        ) : isError || !order ? (
          <div className="text-center py-16 rounded-3xl bg-card border border-border/80 p-8 space-y-4 my-8 shadow-sm">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
            <h2 className="text-2xl font-bold font-serif text-foreground">Order Not Found</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              We couldn&apos;t retrieve the details for this order. It may have been moved or removed.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Orders</span>
              </Link>
              <button
                onClick={() => refetch()}
                className="px-6 py-2.5 rounded-2xl border border-border text-xs font-bold text-foreground hover:bg-muted transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Header (Native Hero Section) */}
            <OrderDetailHeader order={order} onPrintInvoice={handlePrintInvoice} />

            {/* Live Progress Tracker */}
            <OrderDetailTracker order={order} />

            {/* Native App 12-Column Grid Layout: Items & Financial Breakdown (8 cols), Delivery & Return (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              <div className="lg:col-span-8 space-y-6 sm:space-y-8">
                <OrderDetailItems order={order} />
                <OrderDetailSummary order={order} />
              </div>

              <div className="lg:col-span-4 sticky top-24">
                <OrderDetailDelivery
                  order={order}
                  onOpenReturnModal={() => setShowReturnModal(true)}
                />
              </div>
            </div>

            {/* Mobile Native Floating Bottom Action Bar */}
            <MobileOrderBottomBar
              order={order}
              onOpenReturnModal={() => setShowReturnModal(true)}
            />
          </div>
        )}
      </main>

      <Footer />

      {/* Return Modal */}
      {showReturnModal && order && (
        <ReturnRequestModal
          orderId={order.id}
          orderNumber={order.orderNumber}
          returnWindowDays={7}
          onClose={() => setShowReturnModal(false)}
        />
      )}
    </div>
  );
}
