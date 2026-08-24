'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, Handshake, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';

export function SellYourBooksStrip() {
  const { isAuthenticated } = useAuthStore();

  const steps = [
    {
      num: '01',
      title: 'List in 60 Seconds',
      description: 'Scan or type your book ISBN, upload a photo, set your price and condition.',
      icon: Camera,
      gradient: 'from-secondary/10 to-accent/10 text-secondary border-secondary/20',
    },
    {
      num: '02',
      title: 'Receive Offers',
      description: 'Connect with verified local buyers and national book seekers across India.',
      icon: Handshake,
      gradient: 'from-brand/10 to-primary/10 text-brand dark:text-primary border-primary/20',
    },
    {
      num: '03',
      title: 'Get Paid Instantly',
      description: 'Ship or handoff your book and receive direct UPI payout within 24 hours.',
      icon: Wallet,
      gradient: 'from-success/10 to-emerald-500/10 text-success border-success/20',
    },
  ];

  return (
    <section
      aria-label="Sell Your Used Books"
      className="py-12 sm:py-16 lg:py-20 relative bg-card border-y border-border/80 font-sans transition-colors duration-200 overflow-hidden"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 transition-all">

        {/* Premium Sell Strip Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary to-card border border-border/60 shadow-2xl">
          
          {/* Background decorative glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 90% 10%, hsl(20 89% 54% / 0.15) 0%, transparent 50%), radial-gradient(ellipse at 10% 90%, hsl(36 100% 50% / 0.08) 0%, transparent 55%)',
            }}
          />
          
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary via-accent to-secondary" />

          <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 lg:px-16 space-y-10">

            {/* Header Row */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary/20 border border-secondary/30 text-xs font-extrabold uppercase tracking-wider text-secondary">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  <span>Turn Shelves into Cash</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-primary-foreground tracking-tight leading-tight">
                  Sell Your Used Books Effortlessly
                </h2>
                <p className="text-sm text-primary-foreground/70 leading-relaxed font-medium">
                  Have unread textbooks gathering dust? Pass them along to a fellow student in 3 easy steps and earn up to 80% back.
                </p>
              </div>

              <motion.div whileTap={{ scale: 0.96 }} className="shrink-0">
                <Link
                  href="/sell"
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      useAuthModalStore
                        .getState()
                        .openModal('seller_signup', '/seller/dashboard');
                    }
                  }}
                  className="h-12 px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
                >
                  <span>Start Selling Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>

            {/* 3-Step Cards — Mobile Swipe, Desktop 3-Column */}
            <div className="flex md:grid md:grid-cols-3 gap-4 lg:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-6 px-6 sm:-mx-12 sm:px-12 lg:-mx-16 lg:px-16 pb-2 sm:pb-0">
              {steps.map((step, idx) => {
                const IconComp = step.icon;
                return (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="w-[260px] md:w-auto shrink-0 snap-start bg-primary-foreground/10 dark:bg-card/40 backdrop-blur-sm border border-primary-foreground/15 p-5 sm:p-6 rounded-2xl space-y-4 hover:border-secondary/50 hover:bg-primary-foreground/15 transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-2.5 rounded-xl border ${step.gradient} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComp className="h-5 w-5 stroke-[2.2]" />
                      </div>
                      <span className="font-mono text-3xl font-extrabold text-primary-foreground/15">
                        {step.num}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-base font-extrabold text-primary-foreground">
                        {step.title}
                      </h3>
                      <p className="text-xs text-primary-foreground/60 leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default SellYourBooksStrip;
