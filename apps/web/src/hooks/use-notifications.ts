'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { Notification } from '@bookmarket/types';

export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading: isListLoading,
    refetch: refetchList,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => apiClient<Notification[]>('/notifications'),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  const { data: unreadData, isLoading: isCountLoading } = useQuery<{ count: number }>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => apiClient<{ count: number }>('/notifications/unread-count'),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (prev) => {
        if (!prev) return [];
        return prev.map((n) => (n.id === updated.id ? { ...n, isRead: true } : n));
      });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () =>
      apiClient<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(['notifications'], (prev) => {
        if (!prev) return [];
        return prev.map((n) => ({ ...n, isRead: true }));
      });
      queryClient.setQueryData<{ count: number }>(['notifications', 'unread-count'], { count: 0 });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const unreadCount =
    unreadData?.count !== undefined
      ? unreadData.count
      : notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading: isListLoading || isCountLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    isMarkingAll: markAllReadMutation.isPending,
    refetchList,
  };
}

export default useNotifications;
