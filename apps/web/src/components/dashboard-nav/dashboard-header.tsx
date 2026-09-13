'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Sparkles, PlusCircle, ExternalLink } from 'lucide-react';
import { DashboardNotificationsMenu } from './dashboard-notifications-menu';
import { DashboardUserMenu } from './dashboard-user-menu';
import { MobileAccountDrawer } from './mobile-account-drawer';
import { MobileNotificationsDrawer } from './mobile-notifications-drawer';
import { useCurrentUser } from '@/hooks/use-current-user';

export interface DashboardHeaderProps {
  role: 'admin' | 'seller' | 'buyer';
  title?: React.ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchClick?: () => void;
  children?: React.ReactNode;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export function DashboardHeader({
  role,
  title,
  showSearch = true,
  searchPlaceholder = 'Search...',
  onSearchClick,
  children,
  theme,
  onToggleTheme,
}: DashboardHeaderProps) {
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);
  const [isMobileNotifOpen, setIsMobileNotifOpen] = useState(false);
  const { user } = useCurrentUser();

  const roleBrandConfig = {
    admin: {
      tag: 'Executive Command Center',
      mobileTitle: 'Admin Hub',
      homeHref: '/admin/dashboard',
    },
    seller: {
      tag: 'Campus Partner Workspace',
      mobileTitle: 'Seller Hub',
      homeHref: '/seller/dashboard',
    },
    buyer: {
      tag: 'Student Account Center',
      mobileTitle: 'Student Hub',
      homeHref: '/account/profile',
    },
  }[role];

  return (
    <>
      <header className="h-16 border-b border-border/80 bg-card/90 backdrop-blur-md px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
        {/* Left: Mobile Brand & Context / Search */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile mascot link */}
          <Link
            href={roleBrandConfig.homeHref}
            className="flex items-center gap-2 md:hidden shrink-0"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-xl border border-border/80 bg-secondary/15 flex items-center justify-center p-1">
              <Image
                src="/assets/bookfry/bookfry-fox-pointing.webp"
                alt="BookFry"
                width={26}
                height={26}
                className="object-contain"
              />
            </div>
            <span className="text-xs font-black tracking-tight text-foreground">
              {roleBrandConfig.mobileTitle}
            </span>
          </Link>

          {/* Desktop Title or Context Tag */}
          {title ? (
            <div className="hidden md:block min-w-0 truncate">{title}</div>
          ) : (
            <div className="hidden md:flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-xl border border-border/80">
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                <span>{roleBrandConfig.tag}</span>
              </span>

              {user?.name && role === 'buyer' && (
                <span className="text-xs font-bold text-muted-foreground">
                  Welcome back, <strong className="text-foreground">{user.name}</strong>!
                </span>
              )}
            </div>
          )}

          {/* Search trigger (desktop & tablet) */}
          {showSearch && onSearchClick && (
            <button
              type="button"
              onClick={onSearchClick}
              className="hidden lg:flex items-center space-x-2.5 px-3 py-1.5 bg-muted/50 hover:bg-muted border border-border/80 rounded-2xl text-xs text-muted-foreground transition-all cursor-pointer active:scale-95 ml-2"
            >
              <Search className="h-3.5 w-3.5 text-secondary" />
              <span className="font-medium truncate max-w-[200px]">{searchPlaceholder}</span>
              <kbd className="text-[10px] font-black text-muted-foreground bg-background border border-border/80 px-1.5 py-0.5 rounded-lg">
                ⌘ K
              </kbd>
            </button>
          )}
        </div>

        {/* Right: Actions, Notifications, & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Custom Slot (e.g. List Book CTA or Cart) */}
          {children}

          {/* Default Role CTAs if no children specified */}
          {!children && role === 'seller' && (
            <Link
              href="/sell"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-white text-xs font-black uppercase tracking-wider shadow-xs hover:bg-secondary/90 transition-all active:scale-95"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>List Book</span>
            </Link>
          )}

          {!children && role === 'admin' && (
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-secondary hover:bg-muted transition-all"
            >
              <span>Storefront</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}

          {/* Notifications Control */}
          <DashboardNotificationsMenu
            role={role}
            onOpenMobileDrawer={() => setIsMobileNotifOpen(true)}
          />

          {/* User Profile Control */}
          <div className="pl-1 sm:pl-2 border-l border-border/80">
            <DashboardUserMenu
              role={role}
              theme={theme}
              onToggleTheme={onToggleTheme}
              onOpenMobileAccount={() => setIsMobileAccountOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* Mobile Account Bottom Sheet */}
      <MobileAccountDrawer
        isOpen={isMobileAccountOpen}
        onClose={() => setIsMobileAccountOpen(false)}
        role={role}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* Mobile Notifications Bottom Sheet */}
      <MobileNotificationsDrawer
        isOpen={isMobileNotifOpen}
        onClose={() => setIsMobileNotifOpen(false)}
        role={role}
      />
    </>
  );
}

export default DashboardHeader;
