'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExchangeKnowledgeIllustration } from '@/components/illustrations/book-illustrations';
import { ArrowRight, ShieldCheck, RefreshCw, Sparkles, BookOpen, Wallet } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';

export function ExchangeKnowledgeSection() {
  const { isAuthenticated } = useAuthStore();

  const steps = [
    {
      number: '01',
      title: 'List Your Used Book',
      desc: 'Snap a photo and enter the ISBN. Set your price and list your book for thousands of campus buyers.',
      icon: Sparkles,
      badge: 'Fast 1-Min Listing',
      gradient: 'from-secondary/10 to-amber-500/10 text-secondary border-secondary/20',
    },
    {
      number: '02',
      title: 'Secure Student Escrow',
      desc: 'Payment is safely locked in escrow when a buyer orders. 100% money-back protection for both sides.',
      icon: ShieldCheck,
      badge: 'Zero Fraud Risk',
      gradient: 'from-success/10 to-teal-500/10 text-success border-success/20',
    },
    {
      number: '03',
      title: 'Doorstep Pickup & Payout',
      desc: 'Our courier partner picks up from your address. Receive instant UPI or Bank transfer upon delivery.',
      icon: Wallet,
      badge: 'Instant UPI Payout',
      gradient: 'from-brand/10 to-primary/10 text-brand dark:text-primary border-primary/20',
    },
  ];

  return (
    <section
      aria-label="Exchange Knowledge & Give Books a Second Life"
      className="py-12 sm:py-16 lg:py-20 relative bg-gradient-to-br from-card via-background-subtle to-card border-y border-border/80 font-sans overflow-hidden transition-colors duration-200"
    >
      {/* Ambient background glows for big screen visual depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-secondary/10 dark:bg-secondary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-10 w-80 h-80 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl"
      />

      {/* FULL WIDTH FLUID CONTAINER FOR BIG SCREENS & EDGE-TO-EDGE MOBILE */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Illustration & Quote Box (5 Columns on Desktop) */}
          <div className="lg:col-span-5 order-2 lg:order-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative p-6 sm:p-8 rounded-3xl bg-card border border-border/90 shadow-xl dark:shadow-2xl overflow-hidden text-center"
            >
              {/* Top Accent Gradient Ribbon */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-secondary to-accent" />

              <ExchangeKnowledgeIllustration className="w-full h-auto max-h-64 sm:max-h-72 mx-auto drop-shadow-lg" />

              <div className="mt-4 pt-4 border-t border-border/60">
                <blockquote className="font-serif italic text-primary dark:text-foreground text-xs sm:text-sm font-bold leading-relaxed">
                  &quot;Education becomes affordable when knowledge is shared across student generations.&quot;
                </blockquote>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-secondary mt-1.5">
                  BookFry Eco-Mission • Pan-India Campus Network
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Content Column: Headline, Mobile Stepper & CTAs (7 Columns on Desktop) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 order-1 lg:order-2">
            
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary/10 dark:bg-secondary/20 text-secondary border border-secondary/20 text-xs font-extrabold uppercase tracking-wider">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Peer-to-Peer Student Marketplace</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-primary dark:text-foreground tracking-tight leading-tight">
                Exchange Knowledge &amp; Give Books a Second Life
              </h2>

              <p className="text-xs sm:text-base text-text-secondary leading-relaxed max-w-2xl font-medium">
                Why let expensive semester textbooks sit idle on your shelf? Help junior students save money while earning back up to 80% of your original textbook cost.
              </p>
            </div>

            {/* 3 Step Process Cards - Mobile Horizontal Touch Stepper & Desktop 3-Column Grid */}
            <div className="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
              {steps.map((step, idx) => {
                const IconComp = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="w-[260px] sm:w-auto shrink-0 snap-start p-5 rounded-2xl border border-border/80 bg-card hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-extrabold text-brand dark:text-primary">
                        {step.number}
                      </span>
                      <div className={`p-2.5 rounded-xl border ${step.gradient} shrink-0 group-hover:scale-110 transition-transform`}>
                        <IconComp className="h-5 w-5 stroke-[2.2]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-sm sm:text-base font-extrabold text-text-primary group-hover:text-secondary transition-colors">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed font-medium">
                        {step.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/40">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-background-subtle border border-border text-[10px] font-extrabold text-text-muted">
                        {step.badge}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Buttons Stack (Touch Optimized) */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/sell"
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      useAuthModalStore.getState().openModal('login', '/sell');
                    }
                  }}
                  className="w-full h-12 sm:h-11 px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold rounded-2xl sm:rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 active:scale-95"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>List Your Book Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/books?condition=good"
                  className="w-full h-12 sm:h-11 px-8 bg-background-subtle hover:bg-border/60 text-text-primary border border-border font-extrabold rounded-2xl sm:rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 text-center active:scale-95"
                >
                  <span>Browse Pre-Owned Books</span>
                </Link>
              </motion.div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default ExchangeKnowledgeSection;
