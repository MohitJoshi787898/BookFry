'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Store,
  Settings,
  ShieldCheck,
  UserCircle,
  Package,
  Heart,
  MessageSquare,
  LogOut,
  Moon,
  Sun,
  IndianRupee,
  ExternalLink,
} from 'lucide-react';
import { DashboardAvatar } from './dashboard-avatar';
import { LogoutConfirmDialog } from './logout-confirm-dialog';
import { useCurrentUser } from '@/hooks/use-current-user';

export interface DashboardUserMenuProps {
  role?: 'admin' | 'seller' | 'buyer';
  className?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenMobileAccount?: () => void;
}

export function DashboardUserMenu({
  role = 'buyer',
  className = '',
  theme,
  onToggleTheme,
  onOpenMobileAccount,
}: DashboardUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { user, isSeller, roleLabel, isLoading } = useCurrentUser();

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleTriggerClick = () => {
    // If mobile handler is provided and on small screen, open mobile account drawer
    if (onOpenMobileAccount && window.innerWidth < 768) {
      onOpenMobileAccount();
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const displayName = user?.name || (role === 'admin' ? 'Administrator' : role === 'seller' ? 'Campus Seller' : 'Student Reader');
  const roleContextBadge =
    role === 'admin'
      ? 'SUPER ADMIN'
      : role === 'seller'
      ? user?.sellerVerificationStatus === 'approved'
        ? 'VERIFIED SELLER'
        : user?.sellerVerificationStatus === 'pending'
        ? 'PENDING SELLER'
        : 'CAMPUS SELLER'
      : 'STUDENT MEMBER';

  return (
    <>
      <div ref={menuRef} className={`relative ${className}`}>
        {/* Desktop & Mobile Trigger */}
        <button
          type="button"
          onClick={handleTriggerClick}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={`User account menu for ${displayName}`}
          className={`flex items-center gap-2.5 py-1 px-1.5 sm:px-2 rounded-2xl border transition-all active:scale-95 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
            isOpen
              ? 'bg-muted border-border/90'
              : 'border-transparent hover:bg-muted/60 hover:border-border/60'
          }`}
        >
          <DashboardAvatar user={user} size="sm" />

          {/* Desktop Name & Role Context */}
          <div className="hidden sm:flex flex-col text-left leading-tight pr-1">
            {isLoading && !user ? (
              <div className="space-y-1">
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                <div className="h-2 w-12 bg-muted/70 animate-pulse rounded" />
              </div>
            ) : (
              <>
                <span className="text-xs font-black text-foreground max-w-[130px] truncate block">
                  {displayName}
                </span>
                <span className="text-[9.5px] text-secondary font-black uppercase tracking-wider block mt-0.5">
                  {roleContextBadge}
                </span>
              </>
            )}
          </div>

          <ChevronDown
            className={`hidden sm:block h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-foreground' : ''
            }`}
          />
        </button>

        {/* Desktop Popover Menu */}
        {isOpen && (
          <div className="hidden md:block absolute right-0 top-full mt-2.5 w-72 rounded-3xl bg-card border border-border/80 shadow-2xl overflow-hidden z-50 origin-top-right font-sans animate-in fade-in zoom-in-95 duration-150">
            {/* Identity Card */}
            <div className="p-4 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-3">
                <DashboardAvatar user={user} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-foreground truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">
                    {user?.email || 'No email provided'}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/20">
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Actions Navigation */}
            <div className="p-2 space-y-0.5 text-xs font-medium">
              {role === 'admin' && (
                <>
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-secondary shrink-0" />
                    <span>Executive Dashboard</span>
                  </Link>
                  <Link
                    href="/admin/listings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Moderate Listings</span>
                  </Link>
                  <Link
                    href="/admin/orders"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Orders &amp; Refunds</span>
                  </Link>
                  <Link
                    href="/admin/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>System Settings</span>
                  </Link>
                </>
              )}

              {role === 'seller' && (
                <>
                  <Link
                    href="/seller/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <Store className="h-4 w-4 text-secondary shrink-0" />
                    <span>Seller Dashboard</span>
                  </Link>
                  <Link
                    href="/seller/listings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>My Book Listings</span>
                  </Link>
                  <Link
                    href="/seller/orders"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Customer Orders</span>
                  </Link>
                  <Link
                    href="/seller/earnings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <IndianRupee className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Earnings &amp; Payouts</span>
                  </Link>
                  <Link
                    href="/seller/verify"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Seller Verification</span>
                  </Link>
                </>
              )}

              {role === 'buyer' && (
                <>
                  <Link
                    href="/account/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <UserCircle className="h-4 w-4 text-secondary shrink-0" />
                    <span>Profile &amp; Addresses</span>
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Orders &amp; Deliveries</span>
                  </Link>
                  <Link
                    href="/account/wishlist"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <Heart className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Saved Wishlist</span>
                  </Link>
                  <Link
                    href="/account/requests"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Used Book Requests</span>
                  </Link>
                  {isSeller && (
                    <Link
                      href="/seller/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                    >
                      <Store className="h-4 w-4 text-secondary shrink-0" />
                      <span>Switch to Seller Hub</span>
                    </Link>
                  )}
                </>
              )}

              {/* Public Storefront Link */}
              <Link
                href="/"
                target="_blank"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="h-4 w-4 shrink-0" />
                  <span>Public Storefront</span>
                </div>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {/* Theme Toggle if callback provided */}
            {onToggleTheme && (
              <div className="px-2 py-1.5 border-t border-border/60">
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4 text-secondary shrink-0" />
                    ) : (
                      <Moon className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                  </div>
                </button>
              </div>
            )}

            {/* Sign Out Trigger */}
            <div className="p-2 border-t border-border/60 bg-muted/10">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsLogoutOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        userName={user?.name}
      />
    </>
  );
}

export default DashboardUserMenu;
