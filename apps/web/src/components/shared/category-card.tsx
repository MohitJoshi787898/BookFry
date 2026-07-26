import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  graphic: string;
  href: string;
  bgColor: string;
}

export function CategoryCard({ title, graphic, href, bgColor }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group p-3 rounded-xl border border-border bg-card dark:border-border/60 hover-page-turn flex items-center gap-3"
    >
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg select-none shrink-0 ${bgColor} dark:bg-muted/60 group-hover:scale-105 transition-transform`}>
        {graphic}
      </div>

      <div className="min-w-0 font-sans">
        <h3 className="text-xs font-bold text-text-primary group-hover:text-secondary dark:group-hover:text-secondary transition-colors truncate">
          {title}
        </h3>
        <div className="text-[10px] font-bold text-text-muted flex items-center gap-0.5 mt-0.5 group-hover:text-secondary dark:group-hover:text-secondary transition-colors">
          <span>Explore</span>
          <ArrowRight className="h-2.5 w-2.5 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export default CategoryCard;
