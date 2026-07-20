import React from 'react';
import Link from 'next/link';
import { CreditCard, ShieldCheck, Truck, BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-subtle py-12 text-sm text-text-secondary mt-auto transition-colors duration-200 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold text-brand">BookMarket</span>
            </Link>
            <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
              BookMarket is the premier online marketplace for buying and selling new and used books. Connecting book collectors, independent sellers, and readers nationwide.
            </p>
            <div className="flex items-center space-x-4 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-brand" /> Buyer Protection
              </span>
              <span className="flex items-center gap-1">
                <Truck className="h-4 w-4 text-brand" /> Fast Delivery
              </span>
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-text-primary uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/books?category=fiction" className="hover:text-brand transition-colors">
                  Fiction & Novels
                </Link>
              </li>
              <li>
                <Link href="/books?category=non-fiction" className="hover:text-brand transition-colors">
                  Non-Fiction
                </Link>
              </li>
              <li>
                <Link href="/books?category=exams" className="hover:text-brand transition-colors">
                  Academic & Exams
                </Link>
              </li>
              <li>
                <Link href="/books?discount=40" className="hover:text-brand transition-colors text-accent font-semibold">
                  Today&apos;s Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell Column */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-text-primary uppercase tracking-wider">Sell</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/seller/dashboard" className="hover:text-brand transition-colors">
                  Start Selling Books
                </Link>
              </li>
              <li>
                <Link href="/seller/earnings" className="hover:text-brand transition-colors">
                  Earnings & Payouts
                </Link>
              </li>
              <li>
                <Link href="/seller/orders" className="hover:text-brand transition-colors">
                  Seller Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support Column */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-text-primary uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-brand transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>&copy; {new Date().getFullYear()} BookMarket Inc. All rights reserved.</p>

          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <CreditCard className="h-4 w-4 text-text-muted" /> Secured by Stripe
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-text-muted" /> ISO Certified Catalog
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
