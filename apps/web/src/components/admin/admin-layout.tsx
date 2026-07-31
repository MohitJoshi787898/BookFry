'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
import { AdminMobileNav } from './admin-mobile-nav';
import { AdminMobileBottomBar } from './admin-mobile-bottom-bar';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { User } from '@bookmarket/types';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
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
      const hasChanged = dbRoles.length !== currentRoles.length || dbRoles.some((r: string) => !(currentRoles as string[]).includes(r));
      
      if (hasChanged) {
        // Perform silent refresh to retrieve new JWT access token with the admin claims
        (apiClient('/auth/refresh', { method: 'POST' }) as Promise<{ user: Omit<User, 'createdAt' | 'updatedAt' | 'addresses'>; accessToken: string }>)
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/50 dark:bg-background text-foreground font-sans antialiased">
      {/* Collapsible Left Navigation Sidebar */}
      <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

      {/* Main Content Area (Header + Scrollable Canvas) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 pb-24 sm:pb-8">
          <AdminMobileNav />
          {children}
        </main>

        <AdminMobileBottomBar />
      </div>
    </div>
  );
}

export default AdminLayout;
