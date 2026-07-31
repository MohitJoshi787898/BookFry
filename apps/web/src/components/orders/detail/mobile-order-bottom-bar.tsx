"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Order } from "@bookmarket/types";
import { Download, Share2, Check, Headphones } from "lucide-react";

interface MobileOrderBottomBarProps {
  order: Order;
  onOpenReturnModal?: () => void;
}

export function MobileOrderBottomBar({ order }: MobileOrderBottomBarProps) {
  const [copied, setCopied] = useState(false);

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      const publicUrl = `${window.location.origin}/invoice/${order.orderNumber}`;
      if (navigator.share) {
        navigator.share({
          title: `BookFry Tax Invoice - ${order.orderNumber}`,
          text: `View Tax Invoice for Order ${order.orderNumber} on BookFry`,
          url: publicUrl,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div className="block sm:hidden fixed bottom-4 left-4 right-4 z-40 bg-card/90 backdrop-blur-xl border border-border/80 p-2.5 px-3.5 rounded-3xl shadow-2xl transition-all">
      <div className="flex items-center gap-2">
        {/* PDF Bill Button */}
        <Link
          href={`/orders/${order.orderNumber}/invoice`}
          target="_blank"
          className="flex-1 py-2.5 px-3 rounded-2xl bg-[#F26522] hover:bg-[#D64E0F] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-[#F26522]/20 active:scale-95 transition-transform"
        >
          <Download className="h-4 w-4" />
          <span>Tax Bill PDF</span>
        </Link>

        {/* Share Button */}
        <button
          onClick={handleShareLink}
          className="py-2.5 px-3 rounded-2xl bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          <span>Share</span>
        </button>

        {/* Support Link */}
        <a
          href="mailto:support@bookfry.com"
          className="p-2.5 rounded-2xl bg-muted border border-border/60 text-foreground hover:bg-muted/80 text-xs font-bold flex items-center justify-center active:scale-95"
          title="Contact Support"
        >
          <Headphones className="h-4 w-4 text-secondary" />
        </a>
      </div>
    </div>
  );
}
