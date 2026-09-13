'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { getFirebaseMessaging } from '@/lib/firebase';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const FCM_TOKEN_KEY = 'bookfry_fcm_token';

export function usePushNotifications() {
  const { isAuthenticated } = useAuthStore();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Detect browser support and register the Firebase service worker
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission);

    // Register the Firebase-aware service worker
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js', { scope: '/' })
      .catch((err) => console.warn('[SW Registration Warning]:', err));
  }, []);

  // Listen for foreground messages while the app is open
  useEffect(() => {
    if (!isSupported || !isAuthenticated) return;

    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? 'BookFry';
      const body = payload.notification?.body ?? 'You have a new update.';

      // Show a native notification even in foreground (requires granted permission)
      if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: payload.notification?.image ?? '/fox_reading_178491148655455.png',
            badge: '/favicon.ico',
            data: payload.data ?? { url: '/account/orders' },
          } as NotificationOptions);
        });
      }
    });

    return () => unsubscribe();
  }, [isSupported, isAuthenticated]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !isAuthenticated) return false;

    try {
      setIsSubscribing(true);

      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') return false;

      const swRegistration = await navigator.serviceWorker.ready;
      const messaging = getFirebaseMessaging();

      if (!messaging) {
        console.warn('[Push Notifications] Firebase Messaging not available.');
        return false;
      }

      if (!VAPID_KEY || VAPID_KEY === 'YOUR_VAPID_PUBLIC_KEY_HERE') {
        console.warn('[Push Notifications] NEXT_PUBLIC_FIREBASE_VAPID_KEY is not configured.');
        return false;
      }

      // Retrieve real FCM registration token from Firebase
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (!token) {
        console.warn('[Push Notifications] No FCM token received.');
        return false;
      }

      const cached = localStorage.getItem(FCM_TOKEN_KEY);

      // Only register with backend if token changed
      if (token !== cached) {
        await apiClient('/notifications/push-token', {
          method: 'POST',
          body: JSON.stringify({
            token,
            platform: 'web',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          }),
        });
        localStorage.setItem(FCM_TOKEN_KEY, token);
      }

      return true;
    } catch (err) {
      console.warn('[Push Notifications] Permission/token error:', err);
      return false;
    } finally {
      setIsSubscribing(false);
    }
  }, [isSupported, isAuthenticated]);

  /** Call this on logout to deregister the device token */
  const revokePermission = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem(FCM_TOKEN_KEY);
    if (!token) return;

    try {
      await apiClient('/notifications/push-token', {
        method: 'DELETE',
        body: JSON.stringify({ token }),
      });
      localStorage.removeItem(FCM_TOKEN_KEY);
    } catch (err) {
      console.warn('[Push Notifications] Failed to revoke token:', err);
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribing,
    requestPermission,
    revokePermission,
  };
}

export default usePushNotifications;
