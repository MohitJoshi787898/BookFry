"use client";

import React, { useState } from "react";
import { Order } from "@bookmarket/types";
import { parseAddress } from "@/lib/address-parser";
import { Download, Share2, Check, ArrowLeft, ShieldCheck, Sparkles, Printer, Calendar, CreditCard, PackageCheck, Copy } from "lucide-react";
import Link from "next/link";

interface TaxInvoiceDocumentProps {
  order: Order;
}

export function TaxInvoiceDocument({ order }: TaxInvoiceDocumentProps) {
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const parsedAddress = parseAddress(order.shippingAddress);

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const invoiceNumber = `INV-${order.orderNumber.replace("ORD-", "")}`;
  const totalItemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

  const handlePrintPDF = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyPublicLink = () => {
    if (typeof window !== "undefined") {
      const publicUrl = `${window.location.origin}/invoice/${order.orderNumber}`;
      if (navigator.share) {
        navigator.share({
          title: `BookFry Tax Invoice - ${order.orderNumber}`,
          text: `Official Tax Invoice for Order ${order.orderNumber} on BookFry`,
          url: publicUrl,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const handleCopyId = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(order.orderNumber);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const subtotal = order.subtotal || 0;
  const discount = order.discountAmount || 0;
  const shipping = order.shippingFee || 0;
  const tax = order.tax || 0;
  const total = order.total || 0;

  // Calculate 4% CGST and 4% SGST breakdown
  const cgst = tax / 2;
  const sgst = tax / 2;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans pb-28 sm:pb-12">
      <div className="max-w-[1280px] mx-auto space-y-6">
        
        {/* Top Hero Header Banner (Hidden during print) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A3B5C] via-[#142F4A] to-[#0F2338] text-white p-5 sm:p-8 lg:p-10 shadow-2xl border border-white/10 print:hidden">
          {/* Background Radial Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#F26522]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#FF9900]/15 blur-3xl" />

          {/* Decorative Grid Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="relative z-10 space-y-6 sm:space-y-8">
            {/* Navigation & Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/account/orders/${order.id}`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-bold text-white transition-all border border-white/15 active:scale-95 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 text-[#F26522]" />
                <span>Order Details</span>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-slate-200 border border-white/15 transition-all active:scale-95"
                >
                  {copiedId ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>{order.orderNumber}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyPublicLink}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all border border-white/15 active:scale-95 shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-300">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 text-[#F26522]" />
                      <span className="hidden sm:inline">Share Invoice</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrintPDF}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#F26522] hover:bg-[#D64E0F] text-xs font-black text-white transition-all shadow-md shadow-[#F26522]/25 active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Bill PDF</span>
                </button>
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-6 sm:pb-8">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/20">
                  <Sparkles className="h-3.5 w-3.5 text-[#FF9900]" />
                  <span>Official BookFry Tax Invoice Document</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
                  <span>Tax Invoice</span>
                  <span className="font-mono text-[#F26522] drop-shadow-sm">{invoiceNumber}</span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 font-sans">
                  <Calendar className="h-4 w-4 text-[#F26522]" />
                  <span>Issued on {formattedDate}</span>
                </p>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-2.5">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-md">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  PAID (PEER ESCROW VERIFIED)
                </span>

                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4" />
                  GSTIN: 07AAACB9876F1Z5
                </span>
              </div>
            </div>

            {/* Invoice Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <CreditCard className="h-3.5 w-3.5 text-[#F26522]" />
                  <span>Total Amount</span>
                </div>
                <p className="font-mono text-base sm:text-xl font-black text-white">
                  ₹{total.toFixed(2)}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <PackageCheck className="h-3.5 w-3.5 text-[#FF9900]" />
                  <span>Purchased Books</span>
                </div>
                <p className="font-sans text-base sm:text-xl font-bold text-white">
                  {totalItemsCount} {totalItemsCount === 1 ? "Book" : "Books"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Escrow Guarantee</span>
                </div>
                <p className="font-sans text-xs sm:text-base font-bold text-emerald-300 capitalize">
                  7-Day Protected
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Printer className="h-3.5 w-3.5 text-sky-400" />
                  <span>Invoice Reference</span>
                </div>
                <p className="font-mono text-xs sm:text-base font-bold text-sky-300 truncate">
                  {order.orderNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Official A4 Tax Invoice Document Card */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-12 border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full print:rounded-none">
          
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#1A3B5C]">
                <div className="h-10 w-10 rounded-xl bg-[#1A3B5C] text-white flex items-center justify-center font-black text-xl font-serif">
                  B
                </div>
                <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Book<span className="text-[#F26522]">Fry</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                India&apos;s Peer-to-Peer Campus Marketplace • GSTIN: <span className="font-mono text-slate-700 font-bold">07AAACB9876F1Z5</span>
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block px-3 py-1 rounded-md bg-slate-100 text-[#1A3B5C] font-black text-xs uppercase tracking-widest border border-slate-200">
                Tax Invoice
              </span>
              <p className="font-mono text-sm font-bold text-slate-800 pt-1">
                No: <span className="text-[#F26522]">{invoiceNumber}</span>
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Date: <span className="font-mono">{formattedDate}</span>
              </p>
            </div>
          </div>

          {/* Billed To & Order Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-200">
            {/* Billed To Address */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Billed To & Shipping Destination
              </span>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                <p className="font-bold text-sm text-slate-900 capitalize flex items-center gap-1.5">
                  <span>{parsedAddress.name}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-black uppercase">
                    {parsedAddress.label}
                  </span>
                </p>
                {parsedAddress.phone && (
                  <p className="font-mono text-slate-600 font-medium">{parsedAddress.phone}</p>
                )}
                <p className="text-slate-700 font-medium">{parsedAddress.street}</p>
                <p className="text-slate-600">
                  {parsedAddress.city}, {parsedAddress.state} — <strong className="font-mono">{parsedAddress.zipCode}</strong>
                </p>
                <p className="text-[#1A3B5C] font-extrabold uppercase text-[10px] tracking-wider pt-1">
                  {parsedAddress.country}
                </p>
              </div>
            </div>

            {/* Order Verification Details */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Order Verification & Escrow
              </span>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-bold text-emerald-600 uppercase text-[11px]">
                    {order.paymentStatus || "PAID (PEER ESCROW)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fulfillment Status:</span>
                  <span className="font-bold text-[#1A3B5C] capitalize">
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Protected by BookFry 7-Day Campus Escrow</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1A3B5C] text-white rounded-lg">
                  <th className="py-3 px-4 font-bold rounded-l-xl">#</th>
                  <th className="py-3 px-4 font-bold">Item Description & Condition</th>
                  <th className="py-3 px-4 font-bold text-center">Qty</th>
                  <th className="py-3 px-4 font-bold text-right">Unit Price</th>
                  <th className="py-3 px-4 font-bold text-right rounded-r-xl">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-4 px-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-4 px-4 space-y-0.5">
                      <p className="font-bold text-sm text-slate-900">{item.title}</p>
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px] uppercase">
                        Condition: {item.condition?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-center text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-4 font-mono text-right text-slate-700">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-right text-slate-900 text-sm">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Price Breakdown & Declaration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 pt-4 border-t border-slate-200">
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#1A3B5C]/5 border border-[#1A3B5C]/10 space-y-1">
                <span className="text-[11px] font-bold text-[#1A3B5C] uppercase tracking-wider block">
                  Official Declaration
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-serif">
                  This is an official computer-generated tax invoice issued under BookFry Campus Peer Escrow Guarantee. No physical signature is required.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600 font-bold">
                  <span>Coupon Savings ({order.couponCode || "PROMO"}):</span>
                  <span className="font-mono">-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Campus Delivery Charge:</span>
                <span className="font-mono font-bold text-slate-900">
                  {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
                <span>CGST (4%):</span>
                <span className="font-mono font-bold text-slate-700">₹{cgst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
                <span>SGST (4%):</span>
                <span className="font-mono font-bold text-slate-700">₹{sgst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-3 border-t-2 border-slate-900 items-center">
                <span className="font-serif text-base font-extrabold text-[#1A3B5C]">
                  Total Amount Paid:
                </span>
                <span className="font-mono text-xl font-black text-[#F26522]">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Seal */}
          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#F26522]" />
              <span>BookFry • Education Must Never Stop</span>
            </div>
            <p className="font-mono text-[10px]">
              Verification Token: {order.id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Mobile Dock for Invoice Page */}
      <div className="block sm:hidden fixed bottom-4 left-4 right-4 z-40 bg-card/90 backdrop-blur-xl border border-border/80 p-2.5 px-3.5 rounded-3xl shadow-2xl transition-all print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintPDF}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-[#F26522] hover:bg-[#D64E0F] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-[#F26522]/20 active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>Download Bill PDF</span>
          </button>

          <button
            onClick={handleCopyPublicLink}
            className="py-2.5 px-3.5 rounded-2xl bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
