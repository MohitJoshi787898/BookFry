import React from 'react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';

/**
 * Book Discovery Layout
 *
 * Owns: /books (catalog) and /books/[slug] (book detail page).
 *
 * This layout is the canonical owner of the Navbar + Footer for the public
 * book discovery experience. New pages added under (shop)/books will
 * automatically inherit this shell — no manual Footer import needed.
 *
 * Intentionally scoped to /books only. Other (shop) routes (/sell, /cart,
 * /checkout) are focused transactional flows that must NOT render Footer.
 * They remain as peer directories without a shared layout, so they are
 * unaffected by this file.
 */
export default function BooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      <div className="flex-grow flex flex-col">
        {children}
      </div>
      <Footer />
    </div>
  );
}
