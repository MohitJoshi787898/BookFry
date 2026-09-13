'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EcoBookIllustration } from '@/components/illustrations/book-illustrations';
import { ShieldCheck, HeartHandshake, TreePine, GraduationCap, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export interface PillarItem {
  title: string;
  description: string;
  badge?: string;
}

export interface WhyBookFrySectionProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  pillars?: PillarItem[];
  ecoTag?: string;
  sloganQuote?: string;
  treesSavedValue?: string;
  treesSavedDesc?: string;
  verifiedGuaranteeLabel?: string;
}

const defaultPillars: PillarItem[] = [
  {
    title: 'Affordable Education',
    description: 'No student should pause learning due to expensive textbooks. Get genuine course materials at up to 80% off MRP.',
    badge: 'Up to 80% Off',
  },
  {
    title: 'Verified Student Sellers',
    description: 'Connect directly with senior students, toppers, and verified campus sellers for authentic study notes and books.',
    badge: 'Peer-to-Peer Escrow',
  },
  {
    title: 'Eco Circular Reuse',
    description: 'Every recycled book saves 2.5kg of CO2 and tree paper waste. Read more, spend less, protect our environment.',
    badge: 'Save Trees & Planet',
  },
  {
    title: '100% Escrow Protection',
    description: 'Payments are safely held in escrow until you inspect book condition. Guaranteed 100% money-back refund coverage.',
    badge: 'Zero Risk Guarantee',
  },
];

const ICONS = [GraduationCap, HeartHandshake, TreePine, ShieldCheck];

export function WhyBookFrySection({
  eyebrow = 'The BookFry Mission',
  title = 'More Than Just a Marketplace — Built for Learners',
  subtitle = 'We believe education must never stop. BookFry connects 50,000+ Indian students to buy, sell, and exchange textbooks seamlessly.',
  pillars = defaultPillars,
  ecoTag = 'Circular Sustainability',
  sloganQuote = '“क्योंकि.. पढ़ाई रुकनी नहीं चाहिए”',
  treesSavedValue = '12,000+ Trees',
  treesSavedDesc = 'Saved this year through student textbook sharing on BookFry across 200+ Indian university campuses.',
  verifiedGuaranteeLabel = 'Verified BookFry Guarantee',
}: WhyBookFrySectionProps = {}) {
  const pillarList = pillars && pillars.length > 0 ? pillars : defaultPillars;

  return (
    <section
      aria-label="Why BookFry"
      className="py-14 sm:py-18 lg:py-24 relative bg-card/60 dark:bg-muted/10 border-b border-border/80 font-sans text-foreground transition-colors duration-200 overflow-hidden"
    >
      <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-xs font-black uppercase tracking-wider text-secondary shadow-xs">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="font-sans text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed font-medium">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {pillarList.map((pillar, idx) => {
              const IconComp = ICONS[idx % ICONS.length];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="p-5 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-md hover:border-secondary/40 transition-all duration-300 space-y-4 relative overflow-hidden group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-2.5 rounded-xl border text-secondary bg-secondary/10 border-secondary/25 shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <IconComp className="h-5 w-5 stroke-[2.2]" />
                    </div>
                    {pillar.badge && (
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/25">
                        {pillar.badge}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-secondary transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-secondary font-bold pt-2 border-t border-border/60">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{verifiedGuaranteeLabel}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-card via-card to-secondary/10 text-foreground text-center space-y-6 shadow-md relative overflow-hidden border border-border/80 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-[11px] font-extrabold uppercase tracking-wider text-secondary">
                <Zap className="h-3.5 w-3.5 fill-secondary" />
                <span>{ecoTag}</span>
              </div>
              <h3 className="italic text-xl font-extrabold text-secondary">
                {sloganQuote}
              </h3>
            </div>

            <div className="w-full max-w-xs mx-auto">
              <EcoBookIllustration className="w-full h-auto max-h-48 drop-shadow-xl" />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/70">
              <span className="text-2xl font-black font-mono text-foreground block">{treesSavedValue}</span>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {treesSavedDesc}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default WhyBookFrySection;
