'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Mail,
  ChevronDown,
  BookOpen,
  MapPin,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { FooterTrustBar } from './footer/footer-trust-bar';
import { FooterSellCTA } from './footer/footer-sell-cta';
import { FooterNewsletter } from './footer/footer-newsletter';
import { FooterMobileAppGrid } from './footer/footer-mobile-app-grid';

// Data
const FOOTER_SECTIONS = [
  {
    key: 'categories',
    title: 'Shop by Category',
    links: [
      { name: 'Engineering & Tech', href: '/books?category=engineering' },
      { name: 'Medical & Healthcare', href: '/books?category=medical' },
      { name: 'School Textbooks (K-12)', href: '/books?category=school' },
      { name: 'Competitive Exams & Prep', href: '/books?category=exams' },
      { name: 'Novels & Fiction', href: '/books?category=novel' },
      { name: 'Programming & CS', href: '/books?category=programming' },
      { name: 'Commerce & Business', href: '/books?category=commerce' },
    ],
  },
  {
    key: 'quick',
    title: 'Quick Links',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Sell Books', href: '/sell' },
      { name: "Today's Deals", href: '/books?deals=true', badge: '🔥 Hot' },
      { name: 'New Arrivals', href: '/books?sort=newest' },
      { name: 'Best Sellers', href: '/books?sort=popular' },
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
      { name: 'Condition Guide', href: '/condition-guide' },
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

export function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <footer className="w-full bg-card border-t border-border/80 font-sans mt-auto" aria-label="Site footer">
      {/* 1. Trust Bar */}
      <FooterTrustBar />

      {/* 2. Main Content Container */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 pt-10 pb-10 space-y-10">
        
        {/* Mobile Native Quick Launcher Grid */}
        <FooterMobileAppGrid />

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group select-none">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#1A3B5C] to-[#F26522] flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-foreground font-serif">
                Book<span className="text-[#F26522]">Fry</span>
              </span>
            </Link>

            <div className="space-y-1.5">
              <p className="font-serif italic text-[#F26522] font-bold text-sm leading-snug">
                &ldquo;क्योंकि.. पढ़ाई रुकनी नहीं चाहिए&rdquo;
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs font-medium">
                India&apos;s trusted marketplace for new &amp; pre-owned books — buy, sell, and exchange across all categories at the best prices.
              </p>
            </div>

            {/* Social Links */}
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Follow us</p>
              <div className="flex items-center gap-2">
                {SOCIALS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 rounded-2xl bg-muted/60 border border-border/80 text-muted-foreground hover:bg-[#F26522] hover:text-white hover:border-[#F26522] transition-all flex items-center justify-center active:scale-95 shadow-xs"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-2 text-xs font-medium text-muted-foreground">
              <a
                href="mailto:support@bookfry.in"
                className="flex items-center gap-2 hover:text-[#F26522] transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-[#F26522] shrink-0" />
                support@bookfry.in
              </a>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#F26522] shrink-0" />
                +91 98765 43210
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#F26522] shrink-0" />
                Bengaluru, Karnataka, India
              </div>
            </div>
          </div>

          {/* Link Sections (Accordion on mobile, Grid on desktop) */}
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            {FOOTER_SECTIONS.map((section) => (
              <FooterSectionAccordion
                key={section.key}
                section={section}
                isOpen={!!openSections[section.key]}
                onToggle={() => toggleSection(section.key)}
              />
            ))}
          </div>
        </div>

        {/* 3. Sell CTA Banner */}
        <FooterSellCTA />

        {/* 4. Newsletter */}
        <FooterNewsletter />
      </div>

      {/* 5. Bottom Copyright Bar */}
      <div className="border-t border-border/60 bg-muted/20">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright + Legal */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <p className="text-[11px] text-muted-foreground font-medium">
                © {new Date().getFullYear()} BookFry Technologies Pvt. Ltd. All rights reserved.
              </p>
              <div className="hidden sm:block h-3 w-px bg-border/80" aria-hidden />
              <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                {LEGAL_LINKS.map(({ name, href }) => (
                  <Link
                    key={name}
                    href={href}
                    className="text-[11px] text-muted-foreground hover:text-[#F26522] font-medium transition-colors"
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Payments + Secure */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                Secure Escrow Payouts
              </span>
              <div className="flex items-center gap-1">
                {PAYMENT_BADGES.map((badge) => (
                  <span
                    key={badge}
                    className="px-2 py-0.5 rounded-md bg-card border border-border/80 text-[9px] font-black text-muted-foreground font-mono"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <a
                href="https://razorpay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-[#F26522] transition-colors font-bold"
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

// Helper Accordion section
interface LinkItem {
  name: string;
  href: string;
  badge?: string;
}

function FooterSectionAccordion({
  section,
  isOpen,
  onToggle,
}: {
  section: { key: string; title: string; links: LinkItem[] };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-3xl md:rounded-none border md:border-none border-border/80 bg-card md:bg-transparent p-4 md:p-0 shadow-xs md:shadow-none">
      {/* Mobile accordion trigger */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full md:hidden text-left py-1"
        aria-expanded={isOpen}
      >
        <span className="text-xs font-black uppercase tracking-wider text-foreground">{section.title}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.span>
      </button>

      {/* Desktop header */}
      <h4 className="hidden md:block text-xs font-black uppercase tracking-wider text-foreground mb-4">
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
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={`space-y-2.5 overflow-hidden pt-3 md:pt-0 md:!h-auto md:!opacity-100 ${isOpen ? 'block' : 'hidden md:block'}`}
          >
            {section.links.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#F26522] font-medium transition-colors group"
                >
                  <span className="group-hover:underline underline-offset-2">{link.name}</span>
                  {link.badge && (
                    <span className="text-[9px] font-extrabold bg-[#F26522]/15 text-[#F26522] px-1.5 py-0.5 rounded-full">
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
