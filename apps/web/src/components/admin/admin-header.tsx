'use client';

import React from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Search, Bell, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function AdminHeader() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 border-b border-border/80 bg-card/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 font-sans">
      
      {/* Left Search Bar Trigger & Telemetry */}
      <div className="flex items-center space-x-6">
        
        {/* Search input with keyboard shortcut indicator */}
        <div className="relative w-72 hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search books, users, orders, ISBN..."
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-background-subtle border border-border rounded-full text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-[#F26522] focus:outline-none"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-text-muted border border-border px-1.5 py-0.5 roundedbg-card select-none">
            ⌘ K
          </span>
        </div>

        {/* Telemetry Pill */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-500/20 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>API & DB Active</span>
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center space-x-4">
        
        {/* View Site */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center space-x-1 text-xs font-bold text-text-secondary hover:text-[#F26522] transition-colors"
        >
          <span>View Site</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        {/* Notifications Icon with count badge */}
        <button
          className="p-2 rounded-full hover:bg-background-subtle text-text-muted hover:text-text-primary transition-colors relative"
          aria-label="Admin Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#F26522] text-white text-[9px] font-extrabold flex items-center justify-center border border-card shadow-xs">
            2
          </span>
        </button>

        {/* Admin Profile Card */}
        <div className="flex items-center space-x-3.5 pl-3.5 border-l border-border/80">
          
          {/* Text Labels */}
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-xs font-extrabold text-text-primary block leading-none">
              {user?.name || 'System Admin'}
            </span>
            <span className="text-[9px] text-text-muted font-bold block mt-1">
              Super Administrator
            </span>
          </div>

          {/* Dark Avatar Circle with Initials SA */}
          <div className="h-9 w-9 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs select-none">
            SA
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
