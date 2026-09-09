'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
import { AdminMobileBottomBar } from './admin-mobile-bottom-bar';
import { AdminMobileDrawer } from './admin-mobile-drawer';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { User } from '@bookmarket/types';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isAuthenticated, user, setAuth } = useAuthStore();

  // Query database profile to check for admin role updates
  const { data: meData } = useQuery<{ user: { roles: string[] } }>({
    queryKey: ['auth-me-layout'],
    queryFn: () => apiClient('/auth/me') as Promise<{ user: { roles: string[] } }>,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (meData?.user) {
      const dbRoles = meData.user.roles;
      const currentRoles = user?.roles || [];
      const hasChanged =
        dbRoles.length !== currentRoles.length ||
        dbRoles.some((r: string) => !(currentRoles as string[]).includes(r));

      if (hasChanged) {
        (
          apiClient('/auth/refresh', { method: 'POST' }) as Promise<{
            user: User;
            accessToken: string;
          }>
        )
          .then((res) => {
            if (res.user && res.accessToken) {
              setAuth(res.user, res.accessToken);
            }
          })
          .catch((err) => {
            console.error('Silent session sync failed:', err);
          });
      }
    }
  }, [meData, user, setAuth]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans antialiased">
      {/* Desktop & Tablet Collapsible Left Sidebar */}
      <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
          {children}
        </main>

        {/* Native Mobile Bottom Navigation Dock */}
        <AdminMobileBottomBar onOpenDrawer={() => setIsDrawerOpen(true)} />

        {/* Native Mobile All-Tools Drawer */}
        <AdminMobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      </div>
    </div>
  );
}

export default AdminLayout;
