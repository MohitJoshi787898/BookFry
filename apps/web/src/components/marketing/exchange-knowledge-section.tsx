'use client';

import React from 'react';
import Link from 'next/link';
import { ExchangeKnowledgeIllustration } from '@/components/illustrations/book-illustrations';
import { ArrowRight, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';

import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';

export function ExchangeKnowledgeSection() {
  const { isAuthenticated } = useAuthStore();
  const steps = [
    {
      number: '01',
      title: 'List Your Used Book',
      desc: 'Snap a photo and enter the ISBN. Set your price and share your book with thousands of students.',
      icon: Sparkles,
    },
    {
      number: '02',
      title: 'Secure Student Escrow',
      desc: 'Payment is safely locked in escrow when a buyer orders. 100% money-back guarantee for both sides.',
      icon: ShieldCheck,
    },
    {
      number: '03',
      title: 'Doorstep Pickup & Payout',
      desc: 'Our courier partner picks up from your address. Receive instant UPI or Bank transfer as soon as delivered.',
      icon: RefreshCw,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-surface border-b border-border font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Illustration */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative p-6 rounded-2xl bg-background-subtle border border-border overflow-hidden text-center shadow-sm">
              <ExchangeKnowledgeIllustration className="w-full h-auto max-h-72 mx-auto drop-shadow" />
              <div className="mt-4 pt-4 border-t border-border/60">
                <span className="font-serif italic text-brand text-sm font-semibold block">
                  &quot;Education becomes affordable when knowledge is shared.&quot;
                </span>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">
                Peer-to-Peer Student Marketplace
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">
                Exchange Knowledge & Give Books a Second Life
              </h2>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                Why let expensive textbooks sit idle on your shelf? Help junior students save money while earning back up to 70% of your original textbook cost.
              </p>
            </div>

            {/* 3 Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {steps.map((step) => {
                const IconComp = step.icon;
                return (
                  <div
                    key={step.number}
                    className="p-5 rounded-lg border border-border bg-background hover-page-turn space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-bold text-brand">{step.number}</span>
                      <div className="h-8 w-8 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                        <IconComp className="h-4 w-4" />
                      </div>
                    </div>
                    <h3 className="font-serif text-base font-bold text-text-primary">{step.title}</h3>
                    <p className="text-xs text-text-secondary leading-normal">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Action CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/sell"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    useAuthModalStore.getState().openModal('login', '/sell');
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 bg-secondary hover:bg-secondary-600 text-white font-bold rounded-md text-xs uppercase tracking-wider transition-colors shadow flex items-center justify-center space-x-2"
              >
                <span>List Your Book Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/books?condition=good"
                className="w-full sm:w-auto px-6 py-3 bg-background border border-border hover:border-brand text-text-primary hover:text-brand font-bold rounded-md text-xs uppercase tracking-wider transition-colors text-center"
              >
                Browse Used Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExchangeKnowledgeSection;
