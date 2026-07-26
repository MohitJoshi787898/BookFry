import React from 'react';
import { BookOpen, ShoppingBag, Search, Bell, Heart, WifiOff, FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export type EmptyStateType =
  | 'books'
  | 'orders'
  | 'search'
  | 'notifications'
  | 'wishlist'
  | 'offline'
  | 'default';

export interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  onActionClick?: () => void;
  className?: string;
}

export function EmptyState({
  type = 'default',
  title,
  description,
  actionText,
  onActionClick,
  className,
}: EmptyStateProps) {
  const configs = {
    books: {
      icon: BookOpen,
      title: 'No books found',
      description: "We couldn't find any books matching your criteria.",
    },
    orders: {
      icon: ShoppingBag,
      title: 'No orders yet',
      description: "Looks like you haven't placed any orders yet.",
    },
    search: {
      icon: Search,
      title: 'No results found',
      description: 'Try adjusting your keywords or filters to find what you need.',
    },
    notifications: {
      icon: Bell,
      title: 'No notifications',
      description: "You're all caught up! No notifications for now.",
    },
    wishlist: {
      icon: Heart,
      title: 'Your wishlist is empty',
      description: 'Save books you want to read so you can find them later.',
    },
    offline: {
      icon: WifiOff,
      title: 'No internet connection',
      description: 'Check your network connection and try again.',
    },
    default: {
      icon: FileQuestion,
      title: 'No data available',
      description: 'There is no data to show in this view.',
    },
  }[type];

  const Icon = configs.icon;
  const displayTitle = title || configs.title;
  const displayDescription = description || configs.description;

  return (
    <div
      className={cn(
        'w-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center bg-card border border-border rounded-xl font-sans',
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-[#FEF8F3] border border-[#FFF0E8] flex items-center justify-center text-secondary mb-4 shrink-0">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="font-serif text-sm font-bold text-text-primary mb-1">
        {displayTitle}
      </h3>
      <p className="text-[10px] text-text-muted max-w-[280px] mb-5 font-medium leading-normal">
        {displayDescription}
      </p>

      {actionText && onActionClick && (
        <Button variant="outline" size="sm" onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
