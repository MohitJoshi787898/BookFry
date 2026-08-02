'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EcoBookIllustration } from '@/components/illustrations/book-illustrations';
import { ShieldCheck, HeartHandshake, TreePine, GraduationCap, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export function WhyBookFrySection() {
  const pillars = [
    {
      icon: GraduationCap,
      title: 'Affordable Education',
      desc: 'No student should pause learning due to expensive textbooks. Get genuine course materials at up to 80% off MRP.',
      badge: 'Up to 80% Off',
      accentColor: 'text-[#F26522] bg-[#F26522]/10 border-[#F26522]/20',
    },
    {
      icon: HeartHandshake,
      title: 'Verified Student Sellers',
      desc: 'Connect directly with senior students, toppers, and verified campus sellers for authentic study notes and books.',
      badge: 'Peer-to-Peer Escrow',
      accentColor: 'text-[#1A3B5C] dark:text-blue-400 bg-[#1A3B5C]/10 dark:bg-blue-500/10 border-[#1A3B5C]/20 dark:border-blue-500/20',
    },
    {
      icon: TreePine,
      title: 'Eco Circular Reuse',
      desc: 'Every recycled book saves 2.5kg of CO2 and tree paper waste. Read more, spend less, protect our environment.',
      badge: 'Save Trees & Planet',
      accentColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: ShieldCheck,
      title: '100% Escrow Protection',
      desc: 'Payments are safely held in escrow until you inspect book condition. Guaranteed 100% money-back refund coverage.',
      badge: 'Zero Risk Guarantee',
      accentColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <section
      aria-label="Why BookFry"
      className="py-12 sm:py-16 lg:py-20 relative bg-background border-b border-border/80 font-sans transition-colors duration-200 overflow-hidden"
    >
      {/* Background ambient radial light spot */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 rounded-full bg-[#F26522]/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#1A3B5C]/5 blur-3xl"
      />

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 transition-all space-y-10 sm:space-y-14">
        
        {/* Brand Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F26522]/10 border border-[#F26522]/20 text-xs font-black uppercase tracking-wider text-[#F26522] shadow-xs">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>The BookFry Mission</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            More Than Just a Marketplace — Built for Learners
          </h2>
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed font-medium">
            We believe education must never stop. BookFry connects 50,000+ Indian students to buy, sell, and exchange textbooks seamlessly.
          </p>
        </div>

        {/* 4 Pillar Grid & Eco Illustration Card Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Left 4 Pillar Cards - 2 Columns on Mobile for Native App Feel */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {pillars.map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  whileHover={{ y: -3 }}
                  className="p-5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-xl hover:border-[#F26522]/40 transition-all duration-300 space-y-4 relative overflow-hidden group flex flex-col justify-between active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className={`p-3 rounded-2xl border ${pillar.accentColor} shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                      <IconComp className="h-5 w-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#F26522] bg-[#F26522]/10 px-3 py-1 rounded-full border border-[#F26522]/20">
                      {pillar.badge}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-foreground group-hover:text-[#F26522] transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#F26522] font-bold pt-2 border-t border-border/50">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verified BookFry Guarantee</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Eco Illustration Hero Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1A3B5C] via-[#15304B] to-[#F26522] text-white text-center space-y-6 shadow-2xl relative overflow-hidden border border-white/10 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                <Zap className="h-3 w-3 fill-amber-300" />
                <span>Circular Sustainability</span>
              </div>
              <h3 className="font-serif italic text-xl font-extrabold text-amber-300">
                &ldquo;क्योंकि.. पढ़ाई रुकनी नहीं चाहिए&rdquo;
              </h3>
            </div>

            <div className="w-full max-w-xs mx-auto">
              <EcoBookIllustration className="w-full h-auto max-h-48 drop-shadow-xl" />
            </div>

            <div className="space-y-2 pt-2 border-t border-white/15">
              <span className="text-2xl font-black font-mono text-white block">12,000+ Trees</span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Saved this year through student textbook sharing on BookFry across 200+ Indian university campuses.
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

export default WhyBookFrySection;
