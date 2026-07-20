'use client';

import React from 'react';
import { HeroBookStackIllustration, ExchangeKnowledgeIllustration } from '@/components/illustrations/book-illustrations';
import { AuthScreen } from '@/stores/auth-modal.store';
import { ShieldCheck, HeartHandshake, BookOpen } from 'lucide-react';

interface AuthIllustrationPanelProps {
  screen: AuthScreen;
}

export function AuthIllustrationPanel({ screen }: AuthIllustrationPanelProps) {
  return (
    <div className="hidden lg:flex flex-col justify-between w-full h-full p-8 bg-gradient-to-b from-brand via-primary-900 to-primary-950 text-white relative overflow-hidden font-sans border-r border-brand-hover">
      {/* Background Soft Glow Circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Logo */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="font-serif text-2xl font-bold tracking-tight text-white">BookFry</span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary text-white px-2 py-0.5 rounded-full">
            Seller Portal
          </span>
        </div>
        <p className="font-serif italic text-accent font-semibold text-xs tracking-wide">
          &quot;क्योंकि.. पढ़ाई रुकनी नहीं चाहिए&quot;
        </p>
      </div>

      {/* Center Dynamic Vector Illustration */}
      <div className="relative z-10 my-auto py-6 text-center space-y-4">
        <div className="w-full max-w-xs mx-auto drop-shadow-xl">
          {screen === 'signup' || screen === 'verify_email' ? (
            <ExchangeKnowledgeIllustration className="w-full h-auto max-h-52" />
          ) : (
            <HeroBookStackIllustration className="w-full h-auto max-h-52" />
          )}
        </div>

        <div className="space-y-1 max-w-xs mx-auto">
          <h4 className="font-serif text-lg font-bold text-white">
            {screen === 'signup'
              ? 'Join 50,000+ Student Sellers'
              : screen === 'verify_email'
              ? 'Almost There!'
              : 'Empowering Student Learning'}
          </h4>
          <p className="text-xs text-white/80 leading-relaxed">
            {screen === 'signup'
              ? 'Earn back up to 70% on your used textbooks and help junior students save on study costs.'
              : 'Safe student escrow, direct UPI payouts, and zero listing fees for book lovers nationwide.'}
          </p>
        </div>
      </div>

      {/* Bottom Key Features */}
      <div className="relative z-10 pt-4 border-t border-white/15 grid grid-cols-3 gap-2 text-center text-[10px]">
        <div className="flex flex-col items-center space-y-1 text-white/90">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span className="font-bold">100% Escrow</span>
        </div>
        <div className="flex flex-col items-center space-y-1 text-white/90">
          <HeartHandshake className="h-4 w-4 text-secondary" />
          <span className="font-bold">Peer Exchange</span>
        </div>
        <div className="flex flex-col items-center space-y-1 text-white/90">
          <BookOpen className="h-4 w-4 text-accent" />
          <span className="font-bold">Verified Books</span>
        </div>
      </div>
    </div>
  );
}

export default AuthIllustrationPanel;
