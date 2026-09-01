// Firebase Cloud Messaging Service Worker — BookFry Marketplace
// This file MUST be served from the root (/) for Firebase Messaging to work.
// ⚠️  Do NOT rename or move this file.

// ─── Firebase SDK (compat version required in service workers) ────────────────
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// ─── Firebase Configuration ───────────────────────────────────────────────────
// These are public/client-side values — safe to include here.
firebase.initializeApp({
  apiKey: 'AIzaSyD6mVFkvkePXeDv2YGeoSS44TSpvgqKwVA',
  authDomain: 'bookfry.firebaseapp.com',
  projectId: 'bookfry',
  storageBucket: 'bookfry.firebasestorage.app',
  messagingSenderId: '44211448703',
  appId: '1:44211448703:web:499fc4b86cf41bcc42c84a',
  measurementId: 'G-VY6SNFDWH7',
});

const messaging = firebase.messaging();

// ─── Background Message Handler ───────────────────────────────────────────────
// Triggered when a FCM push arrives while the app is in background / closed.
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'BookFry';
  const options = {
    body: payload.notification?.body || 'You have a new update on BookFry.',
    icon: payload.notification?.image || '/fox_reading_178491148655455.png',
    badge: '/favicon.ico',
    data: payload.data || { url: '/account/orders' },
    vibrate: [100, 50, 100],
  };

  self.registration.showNotification(title, options);
});

// ─── Service Worker Lifecycle ─────────────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ─── Notification Click Handler ───────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen =
    event.notification.data?.url || event.notification.data?.click_action || '/account/orders';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing tab if already open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// ─── Generic Push Fallback ────────────────────────────────────────────────────
// Handles non-Firebase web-push payloads (e.g., sent via VAPID directly).
self.addEventListener('push', (event) => {
  // Firebase SDK handles FCM payloads via onBackgroundMessage above.
  // This handler only fires for non-FCM payloads.
  if (!event.data) return;

  try {
    const payload = event.data.json();
    // Skip if Firebase already handled it (FCM payloads contain a 'from' field)
    if (payload.from) return;

    const notificationTitle = payload.notification?.title || payload.title || 'BookFry';
    const notificationOptions = {
      body: payload.notification?.body || payload.body || 'You have a new update on BookFry.',
      icon: payload.notification?.icon || '/fox_reading_178491148655455.png',
      badge: '/favicon.ico',
      data: payload.data || { url: '/account/orders' },
      vibrate: [100, 50, 100],
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  } catch {
    // Payload might be plain text, not JSON
  }
});
