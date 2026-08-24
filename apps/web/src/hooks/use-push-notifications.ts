'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';

export function usePushNotifications() {
  const { isAuthenticated } = useAuthStore();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Register background service worker
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .catch((err) => console.warn('[SW Registration Warning]:', err));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported || !isAuthenticated) return false;

    try {
      setIsSubscribing(true);
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        await navigator.serviceWorker.ready;
        
        // Generate or retrieve dummy/web-push registration token
        let token = localStorage.getItem('bookfry_fcm_token');
        if (!token) {
          token = `web_token_${Math.random().toString(36).substring(2)}_${Date.now()}`;
          localStorage.setItem('bookfry_fcm_token', token);
        }

        // Register token with backend
        await apiClient('/notifications/push-token', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });

        return true;
      }
      return false;
    } catch (err) {
      console.warn('[Push Notification Permission Error]:', err);
      return false;
    } finally {
      setIsSubscribing(false);
    }
  }, [isSupported, isAuthenticated]);

  return {
    isSupported,
    permission,
    isSubscribing,
    requestPermission,
  };
}

export default usePushNotifications;
