'use client';

import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useAuthStore } from '@/stores/auth.store';
import { Bell, X } from 'lucide-react';

export function PushNotificationBanner() {
  const { isAuthenticated } = useAuthStore();
  const { isSupported, permission, isSubscribing, requestPermission } = usePushNotifications();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('bookfry_push_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (!isSupported || !isAuthenticated || permission === 'granted' || permission === 'denied' || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('bookfry_push_banner_dismissed', 'true');
  };

  const handleEnable = async () => {
    const success = await requestPermission();
    if (success) {
      setIsDismissed(true);
    }
  };

  return (
    <div className="bg-brand/10 border-b border-brand/20 px-4 py-2.5 text-xs text-foreground font-sans transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-brand text-brand-foreground shrink-0">
            <Bell className="h-3.5 w-3.5" />
          </div>
          <p className="leading-tight">
            <strong>Enable Instant Updates:</strong> Get real-time delivery alerts, buyer requests & sale notifications directly on your device.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleEnable}
            disabled={isSubscribing}
            className="px-3 py-1 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg text-xs shadow-xs transition-all disabled:opacity-50"
          >
            {isSubscribing ? 'Enabling...' : 'Turn On Alerts'}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
            aria-label="Dismiss notification prompt"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PushNotificationBanner;
