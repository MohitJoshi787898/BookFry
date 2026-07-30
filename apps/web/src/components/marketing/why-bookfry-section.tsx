'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EcoBookIllustration } from '@/components/illustrations/book-illustrations';
import { ShieldCheck, HeartHandshake, TreePine, GraduationCap, Sparkles } from 'lucide-react';

export function WhyBookFrySection() {
  const pillars = [
    {
      icon: GraduationCap,
      title: 'Affordable Education',
      desc: 'No student should pause learning because of expensive textbook prices. Get genuine books at up to 80% off.',
      badge: 'Up to 80% Off',
      gradient: 'from-brand/10 to-primary/10 text-brand dark:text-primary border-primary/20',
    },
    {
      icon: HeartHandshake,
      title: 'Verified Student Sellers',
      desc: 'Connect directly with senior students, toppers, and verified readers selling genuine course material.',
      badge: 'Verified Peer-to-Peer',
      gradient: 'from-secondary/10 to-accent/10 text-secondary border-secondary/20',
    },
    {
      icon: TreePine,
      title: 'Eco-Friendly Circular Reuse',
      desc: 'Every recycled book saves 2.5kg of CO2 and paper waste. Read more, spend less, protect the environment.',
      badge: 'Save Trees & Planet',
      gradient: 'from-success/10 to-emerald-500/10 text-success border-success/20',
    },
    {
      icon: ShieldCheck,
      title: '100% Escrow Protection',
      desc: 'Payments are safely held in escrow until you inspect the book condition. 100% money-back refund guarantee.',
      badge: 'Zero Risk Guarantee',
      gradient: 'from-accent/10 to-amber-500/10 text-accent border-accent/20',
    },
  ];

  return (
    <section
      aria-label="Why BookFry"
      className="py-12 sm:py-16 lg:py-20 relative bg-background-subtle border-b border-border/80 font-sans transition-colors duration-200 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"
      />

      {/* FULL WIDTH FLUID CONTAINER FOR BIG SCREENS & EDGE-TO-EDGE MOBILE */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 transition-all space-y-10 sm:space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary/10 dark:bg-secondary/20 border border-secondary/20 text-xs font-extrabold uppercase tracking-wider text-secondary">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>The BookFry Philosophy</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-primary dark:text-foreground tracking-tight leading-tight">
            More Than Just a Marketplace — Built for Learners
          </h2>
          <p className="text-xs sm:text-base text-text-secondary leading-relaxed font-medium">
            We believe that education must never stop. Our mission is to make quality reading and course literature accessible to every student in India.
          </p>
        </div>

        {/* 4 Pillar Grid with Eco Illustration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left 4 Pillar Cards - 2 Columns on Mobile for App Feel */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6">
            {pillars.map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  whileHover={{ y: -3 }}
                  className="p-4 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-2xs hover:shadow-md transition-all duration-300 space-y-3 relative overflow-hidden group flex flex-col justify-between"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className={`p-2.5 sm:p-3 rounded-xl border ${pillar.gradient} shrink-0 group-hover:scale-110 transition-transform duration-300 w-fit`}>
                      <IconComp className="h-5 w-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-secondary/20 w-fit">
                      {pillar.badge}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-serif text-sm sm:text-lg font-extrabold text-text-primary group-hover:text-secondary transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed font-medium">
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Eco Illustration Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-primary text-primary-foreground text-center space-y-5 shadow-xl relative overflow-hidden border border-primary-foreground/20"
          >
            <div className="w-full max-w-xs mx-auto">
              <EcoBookIllustration className="w-full h-auto max-h-56 drop-shadow-md" />
            </div>
            <div className="space-y-2">
              <span className="font-serif italic text-secondary text-base font-bold block">
                &quot;क्योंकि.. पढ़ाई रुकनी नहीं चाहिए&quot;
              </span>
              <p className="text-xs text-primary-foreground/80 leading-relaxed font-medium">
                Over 12,000+ trees saved this year through student book sharing on BookFry. Join the movement today!
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

export default WhyBookFrySection;
