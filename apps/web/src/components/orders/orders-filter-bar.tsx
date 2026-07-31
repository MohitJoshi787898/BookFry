"use client";

import React from "react";
import { Search, X } from "lucide-react";

export type OrderFilterTab = "all" | "in_progress" | "delivered" | "returns" | "cancelled";

interface OrdersFilterBarProps {
  activeTab: OrderFilterTab;
  onSelectTab: (tab: OrderFilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: Record<OrderFilterTab, number>;
}

export function OrdersFilterBar({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  counts,
}: OrdersFilterBarProps) {
  const tabs: { id: OrderFilterTab; label: string }[] = [
    { id: "all", label: "All Orders" },
    { id: "in_progress", label: "In Transit" },
    { id: "delivered", label: "Delivered" },
    { id: "returns", label: "Returns" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Search Input & Mobile Filter Scroll */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = counts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-secondary text-secondary-foreground shadow-md shadow-secondary/20 scale-[1.02]"
                    : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${
                    isActive
                      ? "bg-secondary-foreground/20 text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search order # or title..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-border/90 bg-card text-foreground placeholder:text-muted-foreground text-xs font-sans focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
