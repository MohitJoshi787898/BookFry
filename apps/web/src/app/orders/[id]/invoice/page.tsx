"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Order } from "@bookmarket/types";
import { TaxInvoiceDocument } from "@/components/orders/detail/tax-invoice-document";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PublicInvoicePageProps {
  params?: Promise<{ id: string }>;
}

export default function PublicInvoicePage({ params: paramsPromise }: PublicInvoicePageProps) {
  const clientParams = useParams();
  const unwrappedParams = paramsPromise ? React.use(paramsPromise) : null;
  const orderId = (unwrappedParams?.id || clientParams?.id) as string;

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery<Order>({
    queryKey: ["public-invoice", orderId],
    queryFn: () => apiClient(`/orders/public/${orderId}`),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="animate-pulse space-y-4 max-w-3xl w-full">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-48" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-xl">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
            Invoice Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The requested tax invoice could not be located. It may have expired or the link may be invalid.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Browse Catalog</span>
            </Link>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <TaxInvoiceDocument order={order} />;
}
