import { create } from 'zustand';
import { ToastItem, ToastOptions, ToastVariant } from '@/types/toast';

const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4500,
  loading: 10000,
};

const DEFAULT_MASCOTS: Record<ToastVariant, string> = {
  success: '/assets/mascot/mascot-success.webp',
  error: '/assets/mascot/mascot-error.webp',
  warning: '/assets/mascot/mascot-warning.webp',
  info: '/assets/mascot/mascot-info.webp',
  loading: '/assets/mascot/mascot-loading.webp',
};

const MAX_VISIBLE_TOASTS = 3;
const DEDUPE_WINDOW_MS = 1500;

interface ToastStore {
  toasts: ToastItem[];
  addToast: (message: string, variant: ToastVariant, options?: ToastOptions) => string;
  updateToast: (id: string, updates: Partial<ToastItem>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (message, variant, options = {}) => {
    const now = Date.now();
    const existing = get().toasts;

    // Deduplication check: ignore if exact same message & variant was emitted recently
    const duplicate = existing.find(
      (t) => t.message === message && t.variant === variant && now - t.createdAt < DEDUPE_WINDOW_MS
    );
    if (duplicate) {
      return duplicate.id;
    }

    const id = options.id || `toast-${now}-${Math.random().toString(36).substring(2, 7)}`;
    const duration = options.duration ?? DEFAULT_DURATIONS[variant];
    const mascot = options.mascot || DEFAULT_MASCOTS[variant];

    const newToast: ToastItem = {
      id,
      message,
      variant,
      title: options.title,
      duration,
      action: options.action,
      mascot,
      persistent: options.persistent ?? variant === 'loading',
      createdAt: now,
    };

    set((state) => {
      // If updating an existing toast with custom id
      const existsIndex = state.toasts.findIndex((t) => t.id === id);
      if (existsIndex >= 0) {
        const next = [...state.toasts];
        next[existsIndex] = newToast;
        return { toasts: next };
      }

      // Add to front, keep max visible toasts
      const nextToasts = [newToast, ...state.toasts].slice(0, MAX_VISIBLE_TOASTS);
      return { toasts: nextToasts };
    });

    return id;
  },

  updateToast: (id, updates) => {
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => set({ toasts: [] }),
}));

/**
 * Universal BookFry toast trigger functions callable anywhere in frontend.
 */
export const toast = {
  success: (message: string, options?: ToastOptions) =>
    useToastStore.getState().addToast(message, 'success', options),

  error: (message: string, options?: ToastOptions) =>
    useToastStore.getState().addToast(message, 'error', options),

  warning: (message: string, options?: ToastOptions) =>
    useToastStore.getState().addToast(message, 'warning', options),

  info: (message: string, options?: ToastOptions) =>
    useToastStore.getState().addToast(message, 'info', options),

  loading: (message: string, options?: ToastOptions) =>
    useToastStore.getState().addToast(message, 'loading', options),

  dismiss: (id: string) => useToastStore.getState().removeToast(id),

  clear: () => useToastStore.getState().clearAll(),

  /**
   * Chains a promise through loading -> success / error states with seamless transition.
   */
  promise: async <T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    },
    options?: ToastOptions
  ): Promise<T> => {
    const id = toast.loading(msgs.loading, options);
    try {
      const data = await promise;
      const successMsg = typeof msgs.success === 'function' ? msgs.success(data) : msgs.success;
      useToastStore.getState().updateToast(id, {
        message: successMsg,
        variant: 'success',
        mascot: DEFAULT_MASCOTS.success,
        persistent: false,
        duration: options?.duration ?? DEFAULT_DURATIONS.success,
      });
      return data;
    } catch (err) {
      const errorMsg = typeof msgs.error === 'function' ? msgs.error(err) : msgs.error;
      useToastStore.getState().updateToast(id, {
        message: errorMsg,
        variant: 'error',
        mascot: DEFAULT_MASCOTS.error,
        persistent: false,
        duration: options?.duration ?? DEFAULT_DURATIONS.error,
      });
      throw err;
    }
  },
};

