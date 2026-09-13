'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/stores/toast.store';
import { LogOut, Loader2 } from 'lucide-react';

export interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export function LogoutConfirmDialog({
  isOpen,
  onClose,
  userName,
}: LogoutConfirmDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Continue client cleanup even if network drop occurs
      console.warn('[Logout Warning] Server session cleanup responded with notice:', error);
    } finally {
      // 1. Invalidate Zustand store & clear cookie marker
      clearAuth();

      // 2. Clear entire TanStack Query cache to evict sensitive user queries
      queryClient.clear();

      // 3. Close dialog
      setIsSubmitting(false);
      onClose();

      // 4. Emit BookFry branded toast with success mascot
      toast.success("You're signed out successfully.", {
        title: 'Signed Out',
      });

      // 5. Navigate to marketplace storefront and refresh
      router.push('/');
      router.refresh();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      size="sm"
      title={
        <div className="flex items-center gap-2 text-foreground">
          <div className="p-2 rounded-xl bg-destructive/10 text-destructive shrink-0">
            <LogOut className="h-4.5 w-4.5" />
          </div>
          <span>Sign Out?</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border/80 bg-background hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold shadow-xs hover:bg-destructive/90 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-2 py-1">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {userName
            ? `Goodbye for now, ${userName}. Are you sure you want to end your current session?`
            : 'Are you sure you want to end your current BookFry session?'}
        </p>
        <p className="text-[11px] text-muted-foreground/80">
          You will need your credentials to access your dashboard, listings, and active orders again.
        </p>
      </div>
    </Dialog>
  );
}

export default LogoutConfirmDialog;
