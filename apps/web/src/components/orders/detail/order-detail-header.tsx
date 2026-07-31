"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Order } from "@bookmarket/types";
import { ArrowLeft, Printer, Calendar, ShieldCheck, Sparkles, PackageCheck, CreditCard, Clock, Copy, Check, ExternalLink } from "lucide-react";

interface OrderDetailHeaderProps {
  order: Order;
  onPrintInvoice?: () => void;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  confirmed: "bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/20",
  shipped: "bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sky-500/20",
  delivered: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20",
  cancelled: "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20",
  refunded: "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20",
  return_requested: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  return_approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  return_rejected: "bg-rose-500/20 text-rose-300 border-rose-500/40",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Payment Pending",
  confirmed: "Order Confirmed",
  shipped: "Shipped in Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  return_requested: "Return Requested",
  return_approved: "Return Approved",
  return_rejected: "Return Rejected",
};

export function OrderDetailHeader({ order }: OrderDetailHeaderProps) {
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalItemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCopyId = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A3B5C] via-[#142F4A] to-[#0F2338] text-white p-5 sm:p-8 lg:p-10 shadow-2xl mb-6 border border-white/10">
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#F26522]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#FF9900]/15 blur-3xl" />

      {/* Decorative Grid Pattern Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 space-y-6 sm:space-y-8">
        {/* Top App Header Actions */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-extrabold text-white transition-all border border-white/15 active:scale-95 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-[#F26522]" />
            <span>Orders</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-slate-200 border border-white/15 transition-all active:scale-95"
              title="Copy Order ID"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy ID</span>
                </>
              )}
            </button>

            <Link
              href={`/orders/${order.orderNumber}/invoice`}
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-[#F26522] hover:bg-[#D64E0F] text-xs font-bold text-white transition-all shadow-md shadow-[#F26522]/25 active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Tax Invoice</span>
              <ExternalLink className="h-3 w-3 sm:hidden" />
            </Link>
          </div>
        </div>

        {/* Main Hero Title & Status Card */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-6 sm:pb-8">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/20 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#FF9900]" />
              <span>BookFry Official Order Guarantee</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>Order</span>
              <span className="font-mono text-[#F26522] drop-shadow-sm">{order.orderNumber}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 font-sans">
              <Calendar className="h-4 w-4 text-[#F26522]" />
              <span>Placed on {formattedDate}</span>
            </p>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-start lg:items-end justify-between sm:justify-start gap-3">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border backdrop-blur-md shadow-md ${
                STATUS_STYLE[order.status] ?? "bg-white/10 text-white border-white/20"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
              {STATUS_LABEL[order.status] ?? order.status}
            </span>

            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
              Peer Escrow Protected
            </span>
          </div>
        </div>

        {/* Quick Order Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <CreditCard className="h-3.5 w-3.5 text-[#F26522]" />
              <span>Total Paid</span>
            </div>
            <p className="font-mono text-base sm:text-xl font-black text-white">
              ₹{order.total.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <PackageCheck className="h-3.5 w-3.5 text-[#FF9900]" />
              <span>Purchased</span>
            </div>
            <p className="font-sans text-base sm:text-xl font-bold text-white">
              {totalItemsCount} {totalItemsCount === 1 ? "Book" : "Books"}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Escrow Status</span>
            </div>
            <p className="font-sans text-xs sm:text-base font-bold text-emerald-300 capitalize">
              {order.paymentStatus || "Verified"}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              <span>Fulfillment</span>
            </div>
            <p className="font-sans text-xs sm:text-base font-bold text-sky-300 capitalize">
              {order.status.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


