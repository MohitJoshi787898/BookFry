import React from 'react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';

/**
 * Public Marketing Layout
 *
 * Owns: / (Home), /about, /contact, and any future marketing/informational pages.
 *
 * This layout is the canonical owner of the Navbar + Footer for the public
 * marketing experience. New pages added to the (marketing) route group will
 * automatically inherit this shell — no manual Footer import needed.
 *
 * Pages that do NOT belong here (auth, checkout, dashboards) live in separate
 * route groups and will never accidentally inherit this Footer.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary transition-colors duration-200">
      <Navbar />
      <div className="flex-grow flex flex-col">
        {children}
      </div>
      <Footer />
    </div>
  );
}
