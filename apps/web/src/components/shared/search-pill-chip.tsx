import React from 'react';
import Link from 'next/link';

interface SearchPillChipProps {
  label: string;
  href: string;
}

export function SearchPillChip({ label, href }: SearchPillChipProps) {
  return (
    <Link
      href={href}
      className="inline-block px-3 py-1 bg-background-subtle hover:bg-secondary/10 hover:text-secondary dark:hover:bg-secondary/20 dark:hover:text-secondary border border-border/60 text-[10px] sm:text-xs font-semibold rounded-full text-text-secondary transition-colors"
    >
      {label}
    </Link>
  );
}

export default SearchPillChip;
