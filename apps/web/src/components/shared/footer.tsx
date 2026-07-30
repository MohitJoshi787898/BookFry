'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  Tag,
  RotateCcw,
  Headphones,
  Mail,
  ChevronDown,
  ArrowRight,
  Store,
  BookOpen,
  MapPin,
  Phone,
  ExternalLink,
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: ShieldCheck, title: '100% Buyer Protection', desc: 'Safe & secure shopping' },
  { icon: Truck, title: 'Free Shipping ₹499+', desc: 'Pan India delivery' },
  { icon: Tag, title: 'Up to 80% Off', desc: 'Best prices guaranteed' },
  { icon: RotateCcw, title: '7-Day Returns', desc: 'Hassle-free policy' },
  { icon: Headphones, title: '24×7 Support', desc: "We're always here" },
];

const FOOTER_SECTIONS = [
  {
    key: 'categories',
    title: 'Shop by Category',
    links: [
      { name: 'Fiction', href: '/books?category=fiction' },
      { name: 'Non-Fiction', href: '/books?category=non-fiction' },
      { name: 'Teens & YA', href: '/books?category=teens-ya' },
      { name: 'Kids', href: '/books?category=kids' },
      { name: 'Exam Prep', href: '/books?category=exam-prep' },
      { name: 'Engineering', href: '/books?category=engineering' },
      { name: 'Medical', href: '/books?category=medical' },
      { name: 'Management', href: '/books?category=management' },
      { name: 'Competitive Exams', href: '/books?category=competitive-exams' },
    ],
  },
  {
    key: 'quick',
    title: 'Quick Links',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Sell Books', href: '/sell' },
      { name: "Today's Deals", href: '/books?deals=true', badge: '🔥 Hot' },
      { name: 'New Arrivals', href: '/books?sort=newest' },
      { name: 'Best Sellers', href: '/books?sort=popular' },
      { name: 'Bulk Orders', href: '/bulk-orders' },
      { name: 'Sitemap', href: '/sitemap' },
    ],
  },
  {
    key: 'support',
    title: 'Help & Support',
    links: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/help' },
      { name: 'Shipping & Delivery', href: '/shipping' },
      { name: 'Returns & Refunds', href: '/returns' },
      { name: 'Track Order', href: '/track-order' },
      { name: 'Book Condition Guide', href: '/condition-guide' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
    ],
  },
  {
    key: 'sellers',
    title: 'For Sellers',
    links: [
      { name: 'Become a Seller', href: '/sell' },
      { name: 'Seller Benefits', href: '/seller-benefits' },
      { name: 'How to Sell', href: '/how-to-sell' },
      { name: 'Seller Dashboard', href: '/seller/dashboard' },
      { name: 'Seller Support', href: '/seller/support' },
    ],
  },
];

const PAYMENT_BADGES = ['VISA', 'MC', 'UPI', 'RUPAY', 'AMEX'];

const LEGAL_LINKS = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms & Conditions', href: '/terms' },
  { name: 'Shipping Policy', href: '/shipping' },
  { name: 'Return Policy', href: '/returns' },
];

// ──────────────────────────────────────────────────────────────────────────────
// Social icons SVG (custom, no external dep)
// ──────────────────────────────────────────────────────────────────────────────
const SOCIALS = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Main Footer Component
// ──────────────────────────────────────────────────────────────────────────────
export function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [emailVal, setEmailVal] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailVal.trim()) return;
    setSubscribed(true);
    setEmailVal('');
  };

  return (
    <footer className="w-full bg-card border-t border-border font-sans mt-auto" aria-label="Site footer">

      {/* ── 1. Trust Bar ─────────────────────────────────────────────── */}
      <div className="w-full border-b border-border/60 bg-muted/30">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-5">
          <div className="flex gap-4 overflow-x-auto no-scrollbar lg:grid lg:grid-cols-5">
            {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-center gap-3 shrink-0 w-52 lg:w-auto bg-background lg:bg-transparent border border-border lg:border-none rounded-2xl px-4 py-3.5 lg:p-0"
              >
                <div className="h-10 w-10 shrink-0 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-foreground leading-tight truncate">{title}</p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Main Content Grid ─────────────────────────────────────── */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 pt-12 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10 lg:gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 group select-none">
              <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-black tracking-tight text-foreground">
                Book<span className="text-secondary">Fry</span>
              </span>
            </Link>

            {/* Tagline */}
            <div className="space-y-1">
              <p className="font-serif italic text-secondary font-bold text-sm leading-snug">
                &ldquo;क्योंकि.. पढ़ाई रुकनी नहीं चाहिए&rdquo;
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                India&apos;s trusted marketplace for new &amp; pre-owned books — buy, sell, and exchange across all categories at the best prices.
              </p>
            </div>

            {/* Social Links */}
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Follow us</p>
              <div className="flex items-center gap-2">
                {SOCIALS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 rounded-2xl bg-muted border border-border text-muted-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all flex items-center justify-center group"
                  >
                    <span className="group-hover:scale-110 transition-transform">{icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Snippet */}
            <div className="space-y-2">
              <a
                href="mailto:support@bookfry.in"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-secondary transition-colors group"
              >
                <Mail className="h-3.5 w-3.5 text-primary group-hover:text-secondary transition-colors shrink-0" />
                support@bookfry.in
              </a>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                +91 98765 43210
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                Bengaluru, Karnataka, India
              </div>
            </div>
          </div>

          {/* Link Sections */}
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
            {FOOTER_SECTIONS.map((section) => (
              <FooterSection
                key={section.key}
                section={section}
                isOpen={!!openSections[section.key]}
                onToggle={() => toggleSection(section.key)}
              />
            ))}
          </div>
        </div>

        {/* ── 3. Sell CTA Banner ─────────────────────────────────────── */}
        <div className="mt-10 rounded-3xl overflow-hidden bg-primary border border-primary/80">
          <div className="px-6 py-6 md:px-8 md:py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center shrink-0">
                <Store className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-primary-foreground">Have books to sell?</p>
                <p className="text-xs text-primary-foreground/70 mt-0.5 max-w-sm leading-relaxed">
                  List your pre-owned books in minutes and earn money. Join 10,000+ sellers on BookFry.
                </p>
              </div>
            </div>
            <Link
              href="/sell"
              className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-sm rounded-2xl transition-all active:scale-95 shadow-md shrink-0"
            >
              Start Selling
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* ── 4. Newsletter ──────────────────────────────────────────── */}
        <div className="mt-6 rounded-3xl border border-border bg-background p-6 md:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-foreground">Stay in the loop!</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xs leading-relaxed">
                Get exclusive deals, new arrivals &amp; bookish updates to your inbox. No spam ever.
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {subscribed ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-5 py-3 bg-success/10 border border-success/20 rounded-2xl text-success text-sm font-extrabold"
              >
                <ShieldCheck className="h-4 w-4" /> You&apos;re subscribed! 🎉
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto"
              >
                <input
                  type="email"
                  required
                  value={emailVal}
                  onChange={(e) => setEmailVal(e.target.value)}
                  placeholder="Your email address"
                  className="h-11 px-4 rounded-2xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary w-full lg:w-64 font-medium"
                />
                <button
                  type="submit"
                  className="h-11 px-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95 shrink-0"
                >
                  Subscribe
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── 5. Bottom Bar ───────────────────────────────────────────── */}
      <div className="border-t border-border/60 bg-muted/20">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright + Legal */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <p className="text-[11px] text-muted-foreground font-medium">
                © {new Date().getFullYear()} BookFry Technologies Pvt. Ltd. All rights reserved.
              </p>
              <div className="hidden sm:block h-3 w-px bg-border" aria-hidden />
              <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                {LEGAL_LINKS.map(({ name, href }) => (
                  <Link
                    key={name}
                    href={href}
                    className="text-[11px] text-muted-foreground hover:text-secondary font-medium transition-colors"
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Payments + Secure */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
                Secure Payments
              </span>
              <div className="flex items-center gap-1">
                {PAYMENT_BADGES.map((badge) => (
                  <span
                    key={badge}
                    className="px-2 py-0.5 rounded-md bg-card border border-border text-[9px] font-extrabold text-muted-foreground"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <a
                href="https://razorpay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-secondary transition-colors"
                aria-label="Powered by Razorpay"
              >
                Razorpay <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Footer Link Section — accordion on mobile, static on desktop
// ──────────────────────────────────────────────────────────────────────────────
interface LinkItem { name: string; href: string; badge?: string; }

function FooterSection({
  section, isOpen, onToggle,
}: {
  section: { key: string; title: string; links: LinkItem[] };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border/40 md:border-none pb-1 md:pb-0">
      {/* Mobile accordion trigger */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full md:hidden text-left py-3"
        aria-expanded={isOpen}
      >
        <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">{section.title}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.span>
      </button>

      {/* Desktop static header */}
      <h4 className="hidden md:block text-xs font-extrabold uppercase tracking-wider text-foreground mb-4">
        {section.title}
      </h4>

      {/* Link list */}
      <AnimatePresence initial={false}>
        {(isOpen || true) && (
          <motion.ul
            key={section.key}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className={`space-y-2 overflow-hidden md:!h-auto md:!opacity-100 ${isOpen ? 'block' : 'hidden md:block'}`}
          >
            {section.links.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-secondary font-medium transition-colors group"
                >
                  <span className="group-hover:underline underline-offset-2">{link.name}</span>
                  {link.badge && (
                    <span className="text-[9px] font-extrabold bg-secondary/15 text-secondary px-1.5 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Footer;
