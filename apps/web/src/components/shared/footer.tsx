import React from 'react';
import Link from 'next/link';
import { CreditCard, ShieldCheck, Truck, BookOpen, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0B1320] text-slate-400 py-16 text-sm mt-auto font-sans border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block">
              <span className="font-sans text-2xl font-black tracking-tight text-white">
                Book<span className="text-secondary">Fry</span>
              </span>
            </Link>
            <p className="font-serif italic text-secondary font-semibold text-sm">
              &quot;क्योंकि.. पढ़ाई रुकनी नहीं चाहिए&quot;
            </p>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              BookFry is India&apos;s leading student-first marketplace for buying, selling, and exchanging new and pre-owned textbooks. Save up to 80% on study guides, engineering courses, novels, and prep materials.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a href="#" className="p-2 rounded bg-slate-800 hover:bg-brand text-slate-300 hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded bg-slate-800 hover:bg-brand text-slate-300 hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded bg-slate-800 hover:bg-brand text-slate-300 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded bg-slate-800 hover:bg-brand text-slate-300 hover:text-white transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Shop Catalog</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/books?category=fiction" className="hover:text-white transition-colors">
                  Fiction & Novels
                </Link>
              </li>
              <li>
                <Link href="/books?category=non-fiction" className="hover:text-white transition-colors">
                  Non-Fiction Books
                </Link>
              </li>
              <li>
                <Link href="/books?category=exams" className="hover:text-white transition-colors">
                  Competitive Exams
                </Link>
              </li>
              <li>
                <Link href="/books?discount=40" className="hover:text-secondary font-bold transition-colors">
                  Today&apos;s Hot Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/sell" className="hover:text-white transition-colors">
                  Sell Books on BookFry
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="hover:text-white transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/seller/earnings" className="hover:text-white transition-colors">
                  Earnings & Transactions
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About BookFry
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Info */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} BookFry Inc. All rights reserved.</p>

          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-slate-500" /> Secure Payments
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-4 w-4 text-slate-500" /> Reliable Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
