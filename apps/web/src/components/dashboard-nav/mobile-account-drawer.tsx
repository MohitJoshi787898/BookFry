'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Store,
  Settings,
  ShieldCheck,
  ShieldAlert,
  UserCircle,
  Package,
  Heart,
  MessageSquare,
  LogOut,
  Moon,
  Sun,
  IndianRupee,
  ExternalLink,
  Bell,
} from 'lucide-react';
import Image from 'next/image';
import { DashboardAvatar } from './dashboard-avatar';
import { LogoutConfirmDialog } from './logout-confirm-dialog';
import { useCurrentUser } from '@/hooks/use-current-user';

export interface MobileAccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role?: 'admin' | 'seller' | 'buyer';
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export function MobileAccountDrawer({
  isOpen,
  onClose,
  role = 'buyer',
  theme,
  onToggleTheme,
}: MobileAccountDrawerProps) {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { user, isSeller, isAdmin, roleLabel } = useCurrentUser();

  const displayName =
    user?.name ||
    (role === 'admin' ? 'Administrator' : role === 'seller' ? 'Campus Seller' : 'Student Reader');

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end font-sans md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full bg-card border-t border-border rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] z-10 overflow-hidden"
            >
              {/* Top Handle & Header */}
              <div className="pt-3 pb-2 px-5 border-b border-border/80 flex items-center justify-between shrink-0 bg-muted/20">
                <div className="flex items-center space-x-2.5">
                  <div className="relative w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center p-1">
                    <Image
                      src="/assets/bookfry/bookfry-fox-pointing.webp"
                      alt="BookFry Mascot"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-extrabold text-foreground">
                      Account &amp; Workspace
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      {roleLabel}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Close Account Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12 safe-area-bottom">
                {/* Profile Identity Card */}
                <div className="p-4 rounded-3xl bg-muted/40 border border-border/80 flex items-center gap-3.5">
                  <DashboardAvatar user={user} size="lg" />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="text-sm font-black text-foreground truncate">
                      {displayName}
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {user?.email || 'No email associated'}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {isAdmin && (
                        <span className="inline-flex items-center text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          Admin
                        </span>
                      )}
                      {isSeller && (
                        <span className="inline-flex items-center text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/20">
                          Seller
                        </span>
                      )}
                      <span className="inline-flex items-center text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        Student
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Navigation Tiles */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-2 block">
                    Workspace Navigation
                  </span>

                  <div className="grid grid-cols-1 gap-1.5">
                    {role === 'admin' && (
                      <>
                        <Link
                          href="/admin/dashboard"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                            <LayoutDashboard className="h-4 w-4" />
                          </div>
                          <span>Executive Dashboard</span>
                        </Link>
                        <Link
                          href="/admin/listings"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <span>Listings Moderation Queue</span>
                        </Link>
                        <Link
                          href="/admin/orders"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                          <span>Orders &amp; Refunds</span>
                        </Link>
                        <Link
                          href="/admin/settings"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                            <Settings className="h-4 w-4" />
                          </div>
                          <span>System Settings</span>
                        </Link>
                      </>
                    )}

                    {role === 'seller' && (
                      <>
                        <Link
                          href="/seller/dashboard"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                            <Store className="h-4 w-4" />
                          </div>
                          <span>Seller Dashboard</span>
                        </Link>
                        <Link
                          href="/seller/listings"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <span>My Book Listings</span>
                        </Link>
                        <Link
                          href="/seller/orders"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                          <span>Customer Orders</span>
                        </Link>
                        <Link
                          href="/seller/earnings"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                            <IndianRupee className="h-4 w-4" />
                          </div>
                          <span>Earnings &amp; Payouts</span>
                        </Link>
                        <Link
                          href="/seller/verify"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                          <span>Seller Verification</span>
                        </Link>
                      </>
                    )}

                    {role === 'buyer' && (
                      <>
                        <Link
                          href="/account/profile"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                            <UserCircle className="h-4 w-4" />
                          </div>
                          <span>Profile &amp; Addresses</span>
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                            <Package className="h-4 w-4" />
                          </div>
                          <span>Orders &amp; Tracking</span>
                        </Link>
                        <Link
                          href="/account/wishlist"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                            <Heart className="h-4 w-4" />
                          </div>
                          <span>Saved Wishlist</span>
                        </Link>
                        <Link
                          href="/account/notifications"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                            <Bell className="h-4 w-4" />
                          </div>
                          <span>Notifications &amp; Alerts</span>
                        </Link>
                        <Link
                          href="/account/requests"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <span>Used Book Requests</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Cross-Workspace Switchers */}
                {((isAdmin && role !== 'admin') || (isSeller && role !== 'seller') || (!isSeller && role !== 'seller') || role !== 'buyer') && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-2 block">
                      Switch Workspace
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {isAdmin && role !== 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-rose-500/30 text-rose-600 dark:text-rose-400 font-black text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                            <ShieldAlert className="h-4 w-4" />
                          </div>
                          <span>Admin Control Center</span>
                        </Link>
                      )}
                      {isSeller && role !== 'seller' && (
                        <Link
                          href="/seller/dashboard"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-secondary/30 text-secondary font-black text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-secondary/15 text-secondary">
                            <Store className="h-4 w-4" />
                          </div>
                          <span>Seller Workspace &amp; Listings</span>
                        </Link>
                      )}
                      {!isSeller && role !== 'seller' && (
                        <Link
                          href="/seller/register"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                            <Store className="h-4 w-4" />
                          </div>
                          <span>Become a Campus Seller</span>
                        </Link>
                      )}
                      {role !== 'buyer' && (
                        <Link
                          href="/account/orders"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98"
                        >
                          <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                            <Package className="h-4 w-4" />
                          </div>
                          <span>My Personal Orders &amp; Profile</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Theme & Storefront */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-2 block">
                    Preferences &amp; Links
                  </span>

                  <div className="grid grid-cols-1 gap-1.5">
                    {onToggleTheme && (
                      <button
                        type="button"
                        onClick={onToggleTheme}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-bold text-xs active:scale-98 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                            {theme === 'dark' ? (
                              <Sun className="h-4 w-4 text-secondary" />
                            ) : (
                              <Moon className="h-4 w-4" />
                            )}
                          </div>
                          <span>{theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
                        </div>
                      </button>
                    )}

                    <Link
                      href="/"
                      target="_blank"
                      onClick={onClose}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/80 text-muted-foreground hover:text-foreground font-bold text-xs active:scale-98"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                          <Store className="h-4 w-4" />
                        </div>
                        <span>Marketplace Public Storefront</span>
                      </div>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setIsLogoutOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-destructive/10 hover:bg-destructive/15 border border-destructive/20 text-destructive font-black text-xs transition-all active:scale-98 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out of BookFry</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        userName={user?.name}
      />
    </>
  );
}

export default MobileAccountDrawer;
