"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, FileText, Settings, Store } from "lucide-react";

export function AdminMobileBottomBar() {
  return (
    <div className="block sm:hidden fixed bottom-4 left-4 right-4 z-40 bg-card/90 backdrop-blur-xl border border-border/80 p-2 px-3 rounded-3xl shadow-2xl transition-all font-sans">
      <div className="flex items-center justify-around gap-1">
        <Link
          href="/admin/listings"
          className="flex-1 py-2 px-2 rounded-2xl bg-secondary hover:bg-[#D64E0F] text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-secondary/20 active:scale-95"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Moderate Books</span>
        </Link>

        <Link
          href="/admin/cms"
          className="py-2 px-3 rounded-2xl bg-muted/60 hover:bg-muted text-foreground border border-border/80 text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95"
        >
          <FileText className="h-3.5 w-3.5 text-secondary" />
          <span>CMS</span>
        </Link>

        <Link
          href="/admin/settings"
          className="py-2 px-3 rounded-2xl bg-muted/60 hover:bg-muted text-foreground border border-border/80 text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Settings className="h-3.5 w-3.5 text-secondary" />
          <span>System</span>
        </Link>

        <Link
          href="/"
          className="py-2 px-3 rounded-2xl bg-muted/60 hover:bg-muted text-foreground border border-border/80 text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95"
          title="Back to Storefront"
        >
          <Store className="h-3.5 w-3.5 text-amber-500" />
        </Link>
      </div>
    </div>
  );
}
