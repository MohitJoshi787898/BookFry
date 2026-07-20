'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Handshake, Wallet, ArrowRight } from 'lucide-react';

export function SellYourBooksStrip() {
  const steps = [
    {
      num: '01',
      title: 'List in 60 Seconds',
      description: 'Scan or type your book ISBN, set your price and condition.',
      icon: Camera,
    },
    {
      num: '02',
      title: 'Receive Offers',
      description: 'Connect with verified local buyers and national book collectors.',
      icon: Handshake,
    },
    {
      num: '03',
      title: 'Get Paid Instantly',
      description: 'Ship or drop off your book and receive direct payout to your account.',
      icon: Wallet,
    },
  ];

  return (
    <section className="py-16 bg-surface border-y border-border font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand/10 via-background-subtle to-brand/5 border border-brand/20 rounded-xl p-8 sm:p-12 relative overflow-hidden shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand block">
                Turn Shelves into Cash
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">
                Sell Your Used Books Effortlessly
              </h2>
              <p className="text-sm text-text-secondary">
                Have unread titles gathering dust? Pass them along to a fellow reader in 3 easy steps.
              </p>
            </div>

            <Link
              href="/seller/dashboard"
              className="px-6 py-3 bg-brand text-white text-xs font-bold rounded-md hover:bg-brand-hover transition-colors shadow flex items-center space-x-2 shrink-0"
            >
              <span>Start Selling Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 3-Step Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step) => {
              const IconComp = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-surface/80 backdrop-blur border border-border p-6 rounded-lg space-y-4 hover:border-brand/40 transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-10 w-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                      <IconComp className="h-5 w-5" />
                    </div>
                    <span className="font-serif text-2xl font-bold text-brand/30">{step.num}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-text-primary">{step.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SellYourBooksStrip;
