'use client';

import React from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Search, Bell, Shield, Activity, LogOut, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function AdminHeader() {
  const { user, clearAuth } = useAuthStore();

  return (
    <header className="h-16 border-b border-border bg-surface/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 font-sans">
      {/* Left Search Bar Trigger */}
      <div className="flex items-center space-x-4">
        <div className="relative w-64 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search books, users, orders..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background-subtle border border-border rounded-md text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand focus:outline-none"
          />
        </div>

        {/* System Telemetry Status Pill */}
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-[10px] font-bold text-success">
          <Activity className="h-3 w-3 animate-pulse" />
          <span>API & DB Active</span>
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center space-x-4">
        {/* View Store Button */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold text-text-secondary hover:text-brand transition-colors"
        >
          <span>View Site</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        {/* Notifications Icon */}
        <button
          className="p-2 rounded-full hover:bg-background-subtle text-text-muted hover:text-text-primary transition-colors relative"
          aria-label="Admin Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
        </button>

        {/* Admin Profile Details */}
        <div className="flex items-center space-x-3 pl-3 border-l border-border">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-xs font-bold text-text-primary">{user?.name || 'Administrator'}</span>
            <span className="text-[10px] text-text-muted font-medium">System Admin</span>
          </div>

          <div className="h-8 w-8 rounded-full bg-brand text-white font-bold text-xs flex items-center justify-center shadow-sm">
            <Shield className="h-4 w-4" />
          </div>

          <button
            onClick={() => clearAuth()}
            className="p-1.5 rounded text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
            title="Log Out of Admin Panel"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
