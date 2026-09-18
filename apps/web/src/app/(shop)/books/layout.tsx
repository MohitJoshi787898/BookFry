import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';

export const metadata: Metadata = {
  title: "Browse Verified Books & College Textbooks | BookFry",
  description:
    "Explore thousands of verified new and used college textbooks, competitive exam guides (NEET, JEE, UPSC, GATE), novels, and academic books with 48h campus escrow protection.",
  keywords: [
    "buy textbooks india",
    "second hand college books",
    "engineering books",
    "medical NEET books",
    "UPSC prep books",
    "used books marketplace",
    "BookFry",
  ],
  alternates: {
    canonical: "https://bookfry.in/books",
  },
  openGraph: {
    title: "Browse Books & Textbooks • BookFry",
    description:
      "Buy, sell, and circulate college textbooks across India. Save up to 80% on verified course materials.",
    url: "https://bookfry.in/books",
    type: "website",
    siteName: "BookFry",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Books & Textbooks • BookFry",
    description:
      "Buy, sell, and circulate college textbooks across India. Save up to 80% on verified course materials.",
  },
};

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
