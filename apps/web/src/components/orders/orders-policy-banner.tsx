"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShieldCheck, ChevronRight, ChevronUp, Clock, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";

export function OrdersPolicyBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-6 rounded-2xl border border-secondary/20 bg-gradient-to-r from-secondary/5 via-card to-brand/5 overflow-hidden transition-all shadow-sm">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-secondary/10 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 rounded-full bg-secondary/10 border border-secondary/20 p-1 shrink-0 flex items-center justify-center">
            <Image
              src="/fox_reading_178491148655455.png"
              alt="BookFry Mascot"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-foreground tracking-wide">
                BookFry 7-Day Peer Escrow Return Protection
              </span>
              <ShieldCheck className="h-4 w-4 text-secondary" />
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Your payments remain safely held in Escrow until you inspect and approve the book condition.
            </p>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="h-4 w-4 text-secondary shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-secondary shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-border/60 bg-card/60 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              {
                icon: <Clock className="h-4 w-4 text-secondary" />,
                title: "7-Day Return Window",
                desc: "Return requests can be raised within 7 days from the verified delivery date.",
              },
              {
                icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                title: "Original Condition Match",
                desc: "Books must be returned in the exact condition described at purchase.",
              },
              {
                icon: <RotateCcw className="h-4 w-4 text-amber-500" />,
                title: "Direct UPI / Card Refund",
                desc: "Escrow funds are refunded to your original payment method within 3-5 days.",
              },
              {
                icon: <AlertTriangle className="h-4 w-4 text-rose-500" />,
                title: "Seller Resolution",
                desc: "Our campus support team mediates any condition discrepancy within 24 hours.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-background/80 border border-border/80">
                <div className="mt-0.5 shrink-0">{icon}</div>
                <div>
                  <p className="text-xs font-bold text-foreground">{title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
