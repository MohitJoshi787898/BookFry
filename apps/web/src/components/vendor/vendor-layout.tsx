'use client';

import React, { useState } from 'react';
import { VendorSidebar } from './vendor-sidebar';
import { VendorHeader } from './vendor-header';
import { VendorMobileBottomBar } from './vendor-mobile-bottom-bar';
import { VendorMobileDrawer } from './vendor-mobile-drawer';
import { useAuthStore } from '@/stores/auth.store';

export interface VendorLayoutProps {
  children: React.ReactNode;
}

export function VendorLayout({ children }: VendorLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans antialiased">
      {/* Desktop & Tablet Collapsible Left Sidebar */}
      <VendorSidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <VendorHeader />

        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
          {children}
        </main>

        {/* Native Mobile Bottom Navigation Dock */}
        <VendorMobileBottomBar onOpenDrawer={() => setIsDrawerOpen(true)} />

        {/* Native Mobile All-Tools Drawer */}
        <VendorMobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      </div>
    </div>
  );
}

export default VendorLayout;
