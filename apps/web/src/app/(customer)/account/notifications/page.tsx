'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Notification } from '@bookmarket/types';
import { Bell, ArrowLeft, Check, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => apiClient('/notifications'),
    enabled: isAuthenticated,
  });

  const readMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/notifications/${id}/read`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });

  const handleMarkRead = (id: string) => {
    readMutation.mutate(id);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/books"
          className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-brand mb-6 transition-colors font-sans"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>

        <h1 className="font-serif text-3xl font-bold text-text-primary mb-8 flex items-center space-x-3">
          <Bell className="h-8 w-8 text-brand" />
          <span>Notifications</span>
        </h1>

        {!isAuthenticated ? (
          <div className="text-center py-16 border border-border bg-surface rounded-md space-y-6">
            <Bell className="h-12 w-12 text-text-muted mx-auto" />
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">Please log in</h2>
              <p className="text-sm text-text-secondary max-w-sm mx-auto mt-2 font-sans">
                You must be logged in to view your notifications.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-brand text-white font-semibold rounded hover:bg-brand-hover font-sans text-sm"
            >
              Sign In
            </Link>
          </div>
        ) : isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-20 border border-border bg-surface rounded-md" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 border border-border bg-surface rounded-md">
            <h2 className="text-lg font-bold text-text-primary mb-2 font-serif">
              Failed to load notifications
            </h2>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover text-sm font-semibold font-sans"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 border border-border bg-surface rounded-md space-y-6">
            <Bell className="h-12 w-12 text-text-muted mx-auto" />
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">No new alerts</h2>
              <p className="text-sm text-text-secondary max-w-sm mx-auto mt-2 font-sans">
                You will receive status updates about your orders and listings here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {notifications.map((notification) => {
              const formattedDate = new Date(notification.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={notification.id}
                  className={`border rounded-md p-5 flex justify-between items-start gap-4 transition-all duration-120 ${
                    notification.isRead
                      ? 'border-border bg-surface/50 opacity-75'
                      : 'border-brand/30 bg-brand/5 shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-full mt-0.5 ${
                        notification.isRead ? 'bg-background-subtle text-text-muted' : 'bg-brand/10 text-brand'
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 font-sans">
                      <p className="text-sm font-bold text-text-primary">
                        {notification.title}
                      </p>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {notification.body}
                      </p>
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-sans">
                        <Calendar className="h-3 w-3" />
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className="p-1.5 border border-border hover:border-brand/40 text-text-secondary hover:text-brand bg-surface rounded transition-all font-sans"
                      title="Mark as Read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
