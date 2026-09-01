"use client";

import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type NavIconButtonProps = {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
  badgeCount?: number;
  showLabel?: boolean;
  className?: string;
};

/**
 * Shared icon+label control used in the navbar for theme toggle, wishlist,
 * and cart on every breakpoint. Extracted because the previous navbar
 * repeated this exact markup three times (desktop/tablet/mobile) with
 * hardcoded colors drifting slightly out of sync between copies.
 */
export function NavIconButton({
  icon: Icon,
  label,
  href,
  onClick,
  badgeCount,
  showLabel = false,
  className = "",
}: NavIconButtonProps) {
  const content = (
    <>
      <span className="relative">
        <Icon className="h-5 w-5" aria-hidden="true" />
        {typeof badgeCount === "number" && badgeCount > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-background bg-secondary text-[10px] font-extrabold text-secondary-foreground shadow-xs">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </span>
      {showLabel && (
        <span className="mt-1 text-xs font-bold text-text-secondary">
          {label}
        </span>
      )}
    </>
  );

  const sharedClassName = `focus-ring hover-page-turn flex shrink-0 flex-col items-center justify-center rounded-lg p-1.5 text-text-secondary transition-colors hover:text-secondary ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-label={label}
        className={sharedClassName}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={sharedClassName}
    >
      {content}
    </button>
  );
}
