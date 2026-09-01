'use client';

import React from 'react';
import { ShieldCheck, Truck, Tag, RotateCcw, Headphones } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: '100% Buyer Protection', desc: 'Escrow backed safe shopping' },
  { icon: Truck, title: 'Free Express Shipping', desc: 'Pan India delivery on ₹499+' },
  { icon: Tag, title: 'Up to 80% Off MRP', desc: 'Verified authentic textbook rates' },
  { icon: RotateCcw, title: '7-Day Easy Returns', desc: 'Instant refund policy' },
  { icon: Headphones, title: '24×7 Student Support', desc: 'Helpdesk ready always' },
];

export function FooterTrustBar() {
  return (
    <div className="w-full border-b border-border/60 bg-muted/20 font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
        <div className="flex gap-4 overflow-x-auto no-scrollbar lg:grid lg:grid-cols-5 pb-2 lg:pb-0">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-3.5 shrink-0 w-64 lg:w-auto bg-card lg:bg-transparent border border-border/80 lg:border-none rounded-3xl p-4 lg:p-0 shadow-xs lg:shadow-none hover:border-secondary/40 transition-all"
            >
              <div className="h-11 w-11 shrink-0 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shadow-xs">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-foreground leading-tight truncate">{title}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FooterTrustBar;
