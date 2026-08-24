// Service Worker for Firebase Cloud Messaging & Web Push Notifications
// BookFry Marketplace

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const notificationTitle = payload.notification?.title || payload.title || 'BookFry Notification';
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
  } catch (err) {
    console.warn('[ServiceWorker Push Error]:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/account/orders';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
