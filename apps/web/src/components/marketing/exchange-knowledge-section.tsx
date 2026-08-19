'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Camera,
  ShieldCheck,
  Truck,
  ArrowRight,
  BookOpen,
  Search,
  Users,
  IndianRupee,
  Coins,
  Globe,
  Leaf,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';

export function ExchangeKnowledgeSection() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section
      aria-label="Exchange Knowledge & Give Books a Second Life"
      className="py-12 sm:py-16 lg:py-20 relative bg-[#FAF8F5] dark:bg-background border-b border-border/60 font-sans transition-colors duration-200 overflow-hidden"
    >
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 transition-all space-y-8">
        
        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ================= LEFT SIDE: Photo with Arched Top & Benefits Row ================= */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Arched Photo Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative rounded-t-[140px] rounded-b-3xl overflow-hidden shadow-xl border border-border/50 bg-card aspect-[4/3.4] group"
            >
              <Image
                src="/images/book-exchange-students.jpg"
                alt="Indian university students exchanging a pre-owned textbook on campus"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 650px"
                className="object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
              />

              {/* Floating Leaf Badge at Bottom Left */}
              <div className="absolute bottom-4 left-4 h-12 w-12 rounded-full bg-[#EBF7EE] dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg">
                <Leaf className="h-6 w-6 stroke-[2.2]" />
              </div>
            </motion.div>

            {/* Bottom Benefits 3-Column Strip below Photo */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3.5 rounded-2xl bg-card border border-border/60 shadow-xs font-sans">
              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 rounded-full bg-[#EBF7EE] text-emerald-600 flex items-center justify-center shrink-0">
                  <IndianRupee className="h-4.5 w-4.5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs font-black text-foreground block leading-tight">Save up to 70%</span>
                  <span className="text-[10px] text-muted-foreground font-medium block">on textbooks</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 border-x border-border/50 px-2 sm:px-3">
                <div className="h-9 w-9 rounded-full bg-[#FFF5EB] text-[#F26522] flex items-center justify-center shrink-0">
                  <Coins className="h-4.5 w-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-black text-foreground block leading-tight">Earn back up to 80%</span>
                  <span className="text-[10px] text-muted-foreground font-medium block">of book value</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 rounded-full bg-[#EEF4FF] text-blue-600 flex items-center justify-center shrink-0">
                  <Globe className="h-4.5 w-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-black text-foreground block leading-tight">Sustainable &</span>
                  <span className="text-[10px] text-muted-foreground font-medium block">eco-friendly</span>
                </div>
              </div>
            </div>

          </div>

          {/* ================= RIGHT SIDE: Content, 3 Cards & CTAs ================= */}
          <div className="lg:col-span-7 space-y-7">
            
            {/* Header Content */}
            <div className="space-y-3">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FFEFE6] dark:bg-[#F26522]/15 text-[#F26522] border border-[#FFD9C7] dark:border-[#F26522]/30 text-xs font-black uppercase tracking-wider">
                <Users className="h-4 w-4" />
                <span>PEER-TO-PEER STUDENT MARKETPLACE</span>
              </div>

              {/* Main Headline */}
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-[44px] font-black text-foreground tracking-tight leading-[1.15]">
                Exchange <span className="font-extrabold">Knowledge</span>,<br />
                Give <span className="font-extrabold">Books</span> a <span className="text-[#F26522] font-black">Second Life</span>
                <span className="inline-block ml-2 text-emerald-500 text-2xl">🌿</span>
              </h2>

              {/* Supporting Copy */}
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl font-medium">
                Why let expensive semester textbooks sit idle on your shelf? Help junior students save money while earning back{' '}
                <span className="text-[#F26522] font-extrabold">up to 80%</span> of your original textbook cost.
              </p>
            </div>

            {/* 3 STEP PROCESS CARDS (Mobile Swipe / Desktop Grid with Curved Connectors) */}
            <div className="relative pt-2">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                
                {/* STEP 01 CARD */}
                <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="h-11 w-11 rounded-2xl bg-[#FFF2EB] dark:bg-orange-950/40 text-[#F26522] flex items-center justify-center">
                      <Camera className="h-5 w-5 stroke-[2.2]" />
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-xs font-black text-[#F26522]">01</span>
                      <h3 className="font-sans text-sm font-black text-foreground">List Your Book</h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                        Snap a photo, enter the ISBN, set your price, and list your book for thousands of campus buyers.
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-[#FFF2EB] dark:bg-orange-950/50 text-[#F26522] border border-[#FFD9C7] text-[10px] font-black uppercase tracking-wider">
                      Fast 1-Min Listing
                    </span>
                  </div>
                </div>

                {/* STEP 02 CARD */}
                <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="h-11 w-11 rounded-2xl bg-[#EBF7EE] dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-xs font-black text-emerald-600">02</span>
                      <h3 className="font-sans text-sm font-black text-foreground">Secure Escrow</h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                        We hold the payment safely in escrow until the buyer confirms delivery.
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-[#EBF7EE] dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-wider">
                      Zero Fraud Risk
                    </span>
                  </div>
                </div>

                {/* STEP 03 CARD */}
                <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="h-11 w-11 rounded-2xl bg-[#EEF4FF] dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                      <Truck className="h-5 w-5 stroke-[2.2]" />
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-xs font-black text-blue-600">03</span>
                      <h3 className="font-sans text-sm font-black text-foreground">Doorstep Pickup &amp; Payout</h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                        Our courier partner picks up the book. You get instant payout via UPI or Bank transfer.
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-[#EEF4FF] dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-black uppercase tracking-wider">
                      Instant Payout
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/sell"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    useAuthModalStore.getState().openModal('login', '/sell');
                  }
                }}
                className="px-8 py-3.5 bg-[#F26522] hover:bg-[#D64E0F] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-[#F26522]/20 flex items-center justify-center space-x-2.5 active:scale-95 text-center"
              >
                <BookOpen className="h-4.5 w-4.5" />
                <span>LIST YOUR BOOK NOW</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>

              <Link
                href="/books"
                className="px-8 py-3.5 bg-card hover:bg-muted text-foreground border border-border/80 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center space-x-2 text-center active:scale-95 shadow-2xs"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span>BROWSE PRE-OWNED BOOKS</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default ExchangeKnowledgeSection;
