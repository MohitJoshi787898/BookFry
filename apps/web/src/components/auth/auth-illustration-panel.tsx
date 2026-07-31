'use client';

import React from 'react';
import { HeroBookStackIllustration, ExchangeKnowledgeIllustration } from '@/components/illustrations/book-illustrations';
import { AuthScreen } from '@/stores/auth-modal.store';
import { ShieldCheck, HeartHandshake, BookOpen, Sparkles } from 'lucide-react';

interface AuthIllustrationPanelProps {
  screen: AuthScreen;
}

export function AuthIllustrationPanel({ screen }: AuthIllustrationPanelProps) {
  return (
    <div className="hidden lg:flex flex-col justify-between w-full h-full p-8 bg-gradient-to-b from-card via-card to-muted/50 text-foreground relative overflow-hidden font-sans border-r border-border/80">
      {/* Background Soft Glow Circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Logo */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="font-serif text-2xl font-extrabold tracking-tight text-foreground">BookFry</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full shadow-2xs">
            Student Vault
          </span>
        </div>

        {/* Brand Motto Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
          <BookOpen className="h-3 w-3" />
          <span>क्योंकि.. पढ़ाई रुकनी नहीं चाहिए</span>
          <Sparkles className="h-3 w-3 animate-pulse text-amber-500" />
        </div>
      </div>

      {/* Center Dynamic Vector & Mascot Illustration */}
      <div className="relative z-10 my-auto py-6 text-center space-y-4">
        <div className="w-full max-w-xs mx-auto drop-shadow-xl relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fox_reading_178491148655455.png"
            alt="BookFry Mascot"
            className="w-36 h-36 mx-auto object-contain drop-shadow-lg mb-2"
          />
          {screen === 'signup' || screen === 'verify_email' ? (
            <ExchangeKnowledgeIllustration className="w-full h-auto max-h-44" />
          ) : (
            <HeroBookStackIllustration className="w-full h-auto max-h-44" />
          )}
        </div>

        <div className="space-y-1 max-w-xs mx-auto">
          <h4 className="font-serif text-xl font-extrabold text-foreground">
            {screen === 'signup'
              ? 'Join 50,000+ Student Readers'
              : screen === 'verify_email'
              ? 'Almost There!'
              : 'Empowering Student Learning'}
          </h4>
          <p className="text-xs font-medium text-muted-foreground leading-relaxed">
            {screen === 'signup'
              ? 'Save up to 80% on textbooks and help fellow students access affordable study materials.'
              : 'Verified campus seller escrow, direct UPI payouts, and guaranteed nationwide delivery.'}
          </p>
        </div>
      </div>

      {/* Bottom Key Features */}
      <div className="relative z-10 pt-4 border-t border-border/80 grid grid-cols-3 gap-2 text-center text-[10px]">
        <div className="flex flex-col items-center space-y-1 text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span className="font-extrabold text-foreground">100% Escrow</span>
        </div>
        <div className="flex flex-col items-center space-y-1 text-muted-foreground">
          <HeartHandshake className="h-4 w-4 text-secondary" />
          <span className="font-extrabold text-foreground">Peer Exchange</span>
        </div>
        <div className="flex flex-col items-center space-y-1 text-muted-foreground">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-extrabold text-foreground">Verified Books</span>
        </div>
      </div>
    </div>
  );
}

export default AuthIllustrationPanel;
