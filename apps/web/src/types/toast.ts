export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
  action?: ToastAction;
  mascot?: string;
  persistent?: boolean;
  id?: string;
}

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  title?: string;
  duration: number;
  action?: ToastAction;
  mascot: string;
  persistent: boolean;
  createdAt: number;
}
