'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShoppingBag, Search, Bell, Heart, WifiOff, FileQuestion, Sparkles } from 'lucide-react';
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'w-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center bg-card border border-border rounded-2xl font-sans shadow-2xs',
        className
      )}
    >
      <div className="h-14 w-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-4 shrink-0 shadow-2xs">
        <Icon className="h-6 w-6 stroke-[2.2]" />
      </div>

      <h3 className="font-serif text-lg sm:text-xl font-bold text-text-primary mb-2">
        {displayTitle}
      </h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
        {displayDescription}
      </p>

      {actionText && onActionClick && (
        <Button
          variant="secondary"
          size="md"
          onClick={onActionClick}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold shadow-xs hover:scale-105 transition-transform"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          <span>{actionText}</span>
        </Button>
      )}
    </motion.div>
  );
}

export default EmptyState;
