'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Truck, 
  Tag, 
  RotateCcw, 
  Headphones, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: '100% Buyer Protection', desc: 'Safe shopping guaranteed' },
  { icon: Truck, title: 'Free Shipping on Orders ₹499+', desc: 'Across India' },
  { icon: Tag, title: 'Best Prices', desc: 'Save more on pre-owned books' },
  { icon: RotateCcw, title: 'Easy Returns', desc: 'Hassle-free return policy' },
  { icon: Headphones, title: '24x7 Support', desc: "We're here to help" },
];

const CATEGORY_LINKS = [
  { name: 'Fiction', href: '/books?category=fiction' },
  { name: 'Non-Fiction', href: '/books?category=non-fiction' },
  { name: 'Teens & YA', href: '/books?category=teens-ya' },
  { name: 'Kids', href: '/books?category=kids' },
  { name: 'Exam Prep', href: '/books?category=exam-prep' },
  { name: 'Engineering', href: '/books?category=engineering' },
  { name: 'Medical', href: '/books?category=medical' },
  { name: 'Management', href: '/books?category=management' },
  { name: 'Competitive Exams', href: '/books?category=competitive-exams' },
];

const QUICK_LINKS = [
  { name: 'About Us', href: '/about' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Sell Books', href: '/sell' },
  { name: "Today's Deals", href: '/books?deals=true', badge: 'Hot' },
  { name: 'New Arrivals', href: '/books?sort=newest' },
  { name: 'Best Sellers', href: '/books?sort=popular' },
  { name: 'Bulk Orders', href: '/bulk-orders' },
  { name: 'Sitemap', href: '/sitemap' },
];

const SUPPORT_LINKS = [
  { name: 'Contact Us', href: '/contact' },
  { name: 'FAQs', href: '/help' },
  { name: 'Shipping & Delivery', href: '/shipping' },
  { name: 'Returns & Refunds', href: '/returns' },
  { name: 'Payment Methods', href: '/payments' },
  { name: 'Track Order', href: '/track-order' },
  { name: 'Book Condition Guide', href: '/condition-guide' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms & Conditions', href: '/terms' },
];

const SELLER_LINKS = [
  { name: 'Become a Seller', href: '/sell' },
  { name: 'Seller Benefits', href: '/seller-benefits' },
  { name: 'How to Sell', href: '/how-to-sell' },
  { name: 'Seller Dashboard', href: '/seller/dashboard' },
  { name: 'Seller Support', href: '/seller/support' },
];

export function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: false,
    quick: false,
    support: false,
    sellers: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <footer className="bg-surface dark:bg-card text-text-secondary border-t border-border mt-auto font-sans pt-12 pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* 1. Trust Bar (Horizontally scrollable on mobile) */}
        <div className="border-b border-border/60 pb-8">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-6 lg:grid lg:grid-cols-5 lg:gap-8 pb-3 lg:pb-0">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.title} 
                  className="flex items-center space-x-3.5 shrink-0 w-[240px] lg:w-auto snap-center bg-muted/40 p-3.5 rounded-xl lg:bg-transparent lg:p-0 border border-border lg:border-none"
                >
                  <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/15 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-text-muted mt-0.5 font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Middle Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Brand Info Column */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-sans text-2xl font-black tracking-tight text-text-primary">
                Book<span className="text-secondary">Fry</span>
              </span>
            </Link>
            <p className="font-serif italic text-secondary font-bold text-xs">
              &quot;क्योंकि.. पढ़ाई रुकनी नहीं चाहिए&quot;
            </p>
            <p className="text-xs text-text-muted leading-relaxed max-w-sm">
              India&apos;s trusted marketplace for new and pre-owned books. Buy and sell books across all categories at the best prices.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center space-x-2.5 pt-1">
              {socialLink(<Facebook className="h-4 w-4" />)}
              {socialLink(<Instagram className="h-4 w-4" />)}
              {socialLink(<Twitter className="h-4 w-4" />)}
              {socialLink(<Youtube className="h-4 w-4" />)}
            </div>
          </div>

          {/* Accordion Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:col-span-4 gap-6 lg:gap-8 pt-4 lg:pt-0">
            <FooterLinkSection
              title="Shop by Category"
              links={CATEGORY_LINKS}
              isOpen={openSections.categories}
              onToggle={() => toggleSection('categories')}
            />
            <FooterLinkSection
              title="Quick Links"
              links={QUICK_LINKS}
              isOpen={openSections.quick}
              onToggle={() => toggleSection('quick')}
            />
            <FooterLinkSection
              title="Help & Support"
              links={SUPPORT_LINKS}
              isOpen={openSections.support}
              onToggle={() => toggleSection('support')}
            />
            
            {/* For Sellers Column with CTA Box */}
            <div className="border-b border-border/60 md:border-none pb-4 md:pb-0">
              <FooterLinkSection
                title="For Sellers"
                links={SELLER_LINKS}
                isOpen={openSections.sellers}
                onToggle={() => toggleSection('sellers')}
                hideUlOnMobile
              />
              <div className="bg-secondary/5 border border-secondary/15 rounded-xl p-4 space-y-2 mt-4">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-text-primary">Sell Your Books</h5>
                    <p className="text-[10px] text-text-muted mt-0.5 leading-tight">
                      Earn money by selling your pre-owned books.
                    </p>
                  </div>
                </div>
                <Link 
                  href="/sell" 
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary hover:text-secondary/80 transition-colors pt-1"
                >
                  <span>Start Selling Now</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Newsletter Section */}
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 flex flex-col lg:flex-row items-center justify-between gap-5 mt-6 shadow-sm">
          <div className="flex items-start gap-3.5 w-full lg:w-auto">
            <div className="p-2.5 rounded-full bg-secondary/10 text-secondary shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-text-primary">Stay in the loop!</h4>
              <p className="text-[11px] text-text-muted mt-0.5 max-w-md">
                Get exclusive deals, new arrivals, and bookish updates straight to your inbox.
              </p>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 items-stretch">
            <input
              type="email"
              placeholder="Enter your email address"
              className="bg-background border border-border text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary w-full lg:w-60 font-medium"
            />
            <button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors shrink-0">
              Subscribe
            </button>
          </form>

          <div className="flex items-center gap-2 text-[11px] text-text-muted shrink-0 w-full lg:w-auto">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>No spam. Unsubscribe anytime.</span>
          </div>
        </div>

        {/* 4. Bottom Footer Bar */}
        <div className="pt-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-text-muted font-medium">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} BookFry. All rights reserved.</p>
            <div className="hidden md:block h-3 border-r border-border/80" />
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/privacy" className="hover:text-secondary">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-secondary">Terms & Conditions</Link>
              <Link href="/shipping" className="hover:text-secondary">Shipping Policy</Link>
              <Link href="/returns" className="hover:text-secondary">Return Policy</Link>
            </div>
          </div>

          {/* Secure Payments Badge & Cards */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[10px]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Secure Payments
            </span>
            <div className="flex items-center gap-1 text-[9px] font-black">
              <span className="px-1.5 py-0.5 rounded bg-muted text-text-secondary border border-border/50">VISA</span>
              <span className="px-1.5 py-0.5 rounded bg-muted text-text-secondary border border-border/50">MC</span>
              <span className="px-1.5 py-0.5 rounded bg-muted text-text-secondary border border-border/50">UPI</span>
              <span className="px-1.5 py-0.5 rounded bg-muted text-text-secondary border border-border/50">RUPAY</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );

  function socialLink(icon: React.ReactNode) {
    return (
      <a 
        href="#" 
        className="p-2 rounded bg-muted dark:bg-[#152535] hover:bg-secondary text-text-secondary hover:text-white transition-colors"
      >
        {icon}
      </a>
    );
  }
}

interface LinkItem {
  name: string;
  href: string;
  badge?: string;
}

function FooterLinkSection({
  title,
  links,
  isOpen,
  onToggle,
  hideUlOnMobile = false,
}: {
  title: string;
  links: LinkItem[];
  isOpen: boolean;
  onToggle: () => void;
  hideUlOnMobile?: boolean;
}) {
  return (
    <div className="border-b border-border/60 md:border-none pb-3 md:pb-0">
      {/* Mobile Trigger Button */}
      <button 
        onClick={onToggle}
        className="flex items-center justify-between w-full md:hidden text-left py-1"
      >
        <span className="text-xs font-bold text-text-primary uppercase tracking-wider">{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
      </button>

      {/* Desktop Header Title */}
      <h4 className="hidden md:block text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
        {title}
      </h4>

      {/* Accordion Links List */}
      <ul className={cn(
        "space-y-2 text-xs mt-2 md:mt-0 transition-all duration-200",
        isOpen ? "block" : (hideUlOnMobile ? "hidden md:block" : "hidden md:block")
      )}>
        {links.map((link) => (
          <li key={link.name}>
            <Link 
              href={link.href} 
              className="hover:text-secondary text-text-secondary transition-colors inline-flex items-center gap-1.5"
            >
              <span>{link.name}</span>
              {link.badge && (
                <span className="text-[8px] font-bold bg-secondary/15 text-secondary px-1 py-0.5 rounded leading-none uppercase">
                  {link.badge}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Footer;
