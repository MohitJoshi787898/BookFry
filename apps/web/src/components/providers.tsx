'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { useLiveEvents } from '@/hooks/use-live-events';

function LiveEventsSubscriber() {
  useLiveEvents();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const { isAuthenticated, setUser, clearAuth } = useAuthStore();

  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated) {
        try {
          const res = await apiClient('/auth/me');
          if (res && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.error('Failed to sync authenticated user profile on boot:', err);
          // If profile fetch fails with auth error, clear auth state
          if (err instanceof Error && (err as { status?: number }).status === 401) {
            clearAuth();
          }
        }
      }
    };
    syncUser();
  }, [isAuthenticated, setUser, clearAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <LiveEventsSubscriber />
      {children}
    </QueryClientProvider>
  );
}
