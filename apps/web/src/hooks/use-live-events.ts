'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { API_BASE_URL } from '@/lib/api-client';
import { toast } from '@/stores/toast.store';


export interface LiveEventPayload {
  type?: string;
  orderId?: string;
  orderNumber?: string;
  requestId?: string;
  requestNumber?: string;
  newStatus?: string;
  title?: string;
  body?: string;
  timestamp?: string;
}

function showNativeNotification(title: string, body: string, url: string = '/account/orders') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.showNotification(title, {
            body,
            icon: '/fox_reading_178491148655455.png',
            badge: '/favicon.ico',
            data: { url },
          } as NotificationOptions);
        })
        .catch(() => {
          new Notification(title, { body, icon: '/fox_reading_178491148655455.png' });
        });
    } else {
      new Notification(title, { body, icon: '/fox_reading_178491148655455.png' });
    }
  } catch {
    // Non-blocking fallback
  }
}

export function useLiveEvents() {
  const { isAuthenticated, accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    let isMounted = true;

    function connect() {
      if (!isMounted) return;

      try {
        const streamUrl = `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(accessToken!)}`;
        const es = new EventSource(streamUrl);
        eventSourceRef.current = es;

        es.addEventListener('connected', () => {
          // Connected successfully
        });

        // 1. Live Notification received
        es.addEventListener('notification:new', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

            const notifTitle = data.title || 'BookFry Notification';
            const notifBody = data.message || data.body || 'You have a new update.';
            const notifUrl = data.meta?.url || data.url || '/account/notifications';

            // Trigger BookFry toast with info mascot
            toast.info(notifBody, {
              title: notifTitle,
            });

            // Trigger native OS notification
            showNativeNotification(notifTitle, notifBody, notifUrl);

            // Trigger custom event for notification bell indicator
            window.dispatchEvent(
              new CustomEvent('bookfry:notification', { detail: data })
            );
          } catch {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }
        });

        // 2. Live Order State Transition
        es.addEventListener('order:updated', (event: MessageEvent) => {
          try {
            const data: LiveEventPayload = JSON.parse(event.data);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            if (data.orderId) {
              queryClient.invalidateQueries({ queryKey: ['orders', data.orderId] });
            }
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
            queryClient.invalidateQueries({ queryKey: ['seller', 'orders'] });

            if (data.newStatus) {
              const formattedStatus = data.newStatus.replace('_', ' ').toUpperCase();
              const orderMsg = data.orderNumber
                ? `Order #${data.orderNumber} is now ${formattedStatus}.`
                : `Your order status changed to ${formattedStatus}.`;

              toast.success(orderMsg, { title: 'Order Update' });
              showNativeNotification('BookFry • Order Update', orderMsg, '/account/orders');
            }

            window.dispatchEvent(
              new CustomEvent('bookfry:order-update', { detail: data })
            );
          } catch {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
          }
        });

        // 3. Live Used Book Request Transition
        es.addEventListener('used_book_request:updated', (event: MessageEvent) => {
          try {
            const data: LiveEventPayload = JSON.parse(event.data);
            queryClient.invalidateQueries({ queryKey: ['used-book-requests'] });
            if (data.requestId) {
              queryClient.invalidateQueries({ queryKey: ['used-book-requests', data.requestId] });
            }

            window.dispatchEvent(
              new CustomEvent('bookfry:used-request-update', { detail: data })
            );
          } catch {
            queryClient.invalidateQueries({ queryKey: ['used-book-requests'] });
          }
        });

        es.onerror = () => {
          es.close();
          eventSourceRef.current = null;
          // Reconnect with 5s delay on network drop
          if (isMounted) {
            reconnectTimeoutRef.current = setTimeout(connect, 5000);
          }
        };
      } catch (err) {
        console.warn('[LiveEvents] Connection initialization failed:', err);
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isAuthenticated, accessToken, queryClient]);
}

export default useLiveEvents;
