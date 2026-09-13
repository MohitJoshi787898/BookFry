"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useAuthModalStore } from "@/stores/auth-modal.store";

export interface KnowledgeStep {
  stepNumber: string;
  title: string;
  description: string;
  badge?: string;
}

export interface ExchangeKnowledgeSectionProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  steps?: KnowledgeStep[];
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  savePercentText?: string;
  savePercentSubtext?: string;
  earnPercentText?: string;
  earnPercentSubtext?: string;
  ecoText?: string;
  ecoSubtext?: string;
}

const defaultSteps: KnowledgeStep[] = [
  {
    stepNumber: "01",
    title: "List Your Book",
    description: "Snap a photo, enter the ISBN, set your price, and list your book for thousands of campus buyers.",
    badge: "Fast 1-Min Listing",
  },
  {
    stepNumber: "02",
    title: "Secure Escrow",
    description: "We hold the payment safely in escrow until the buyer confirms delivery.",
    badge: "Zero Fraud Risk",
  },
  {
    stepNumber: "03",
    title: "Doorstep Pickup & Payout",
    description: "Our courier partner picks up the book. You get instant payout via UPI or Bank transfer.",
    badge: "Instant Payout",
  },
];

const ICONS = [Camera, ShieldCheck, Truck];

export function ExchangeKnowledgeSection({
  eyebrow = "PEER-TO-PEER STUDENT MARKETPLACE",
  title = "Exchange Knowledge, Give Books a Second Life",
  subtitle = "Why let expensive semester textbooks sit idle on your shelf? Help junior students save money while earning back up to 80% of your original textbook cost.",
  steps = defaultSteps,
  primaryCtaLabel = "LIST YOUR BOOK NOW",
  primaryCtaUrl = "/sell",
  secondaryCtaLabel = "BROWSE PRE-OWNED BOOKS",
  secondaryCtaUrl = "/books",
  savePercentText = "Save up to 70%",
  savePercentSubtext = "on textbooks",
  earnPercentText = "Earn back up to 80%",
  earnPercentSubtext = "of book value",
  ecoText = "Sustainable &",
  ecoSubtext = "eco-friendly",
}: ExchangeKnowledgeSectionProps = {}) {
  const { isAuthenticated } = useAuthStore();
  const stepList = steps && steps.length > 0 ? steps : defaultSteps;

  return (
    <section
      aria-label="Exchange Knowledge & Give Books a Second Life"
      className="py-14 sm:py-18 lg:py-24 relative bg-card/60 dark:bg-muted/10 border-b border-border/80 font-sans text-foreground transition-colors duration-200 overflow-hidden"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Campus Book Exchange Illustration + Benefit Badges */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative rounded-2xl overflow-hidden shadow-md border border-border/80 bg-card aspect-[4/3.4] group"
            >
              <Image
                src="/images/book-exchange-students-removebg-preview.png"
                alt="Students exchanging pre-owned textbooks on campus"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 650px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />

              <div className="absolute bottom-4 left-4 h-11 w-11 rounded-xl bg-card/90 border border-emerald-500/40 flex items-center justify-center text-emerald-500 shadow-md backdrop-blur-md">
                <Leaf className="h-5 w-5 stroke-[2.2]" />
              </div>
            </motion.div>

            {/* Quick stats panel */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs font-sans">
              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <IndianRupee className="h-4.5 w-4.5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs font-black text-foreground block leading-tight">{savePercentText}</span>
                  <span className="text-[11px] text-muted-foreground font-medium block">{savePercentSubtext}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 border-x border-border/70 px-2 sm:px-3">
                <div className="h-9 w-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0 border border-secondary/20">
                  <Coins className="h-4.5 w-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-black text-foreground block leading-tight">{earnPercentText}</span>
                  <span className="text-[11px] text-muted-foreground font-medium block">{earnPercentSubtext}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Globe className="h-4.5 w-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-black text-foreground block leading-tight">{ecoText}</span>
                  <span className="text-[11px] text-muted-foreground font-medium block">{ecoSubtext}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Steps & Action Buttons */}
          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-xs font-black uppercase tracking-wider">
                <Users className="h-4 w-4" />
                <span>{eyebrow}</span>
              </div>

              <h2 className="font-sans text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-foreground tracking-tight leading-[1.12]">
                {title}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl font-medium">
                {subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stepList.map((step, idx) => {
                const Icon = ICONS[idx % ICONS.length];
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-secondary/40 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="h-10 w-10 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary flex items-center justify-center">
                        <Icon className="h-5 w-5 stroke-[2.2]" />
                      </div>

                      <div className="space-y-1">
                        <span className="font-sans text-xs font-black text-secondary">
                          {step.stepNumber || `0${idx + 1}`}
                        </span>
                        <h3 className="font-sans text-sm font-bold text-foreground">
                          {step.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {step.badge && (
                      <div>
                        <span className="inline-block px-2.5 py-1 rounded-full bg-muted text-secondary border border-secondary/25 text-[10px] font-black uppercase tracking-wider">
                          {step.badge}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href={primaryCtaUrl}
                onClick={(e) => {
                  if (!isAuthenticated && primaryCtaUrl === "/sell") {
                    e.preventDefault();
                    useAuthModalStore.getState().openModal("login", "/sell");
                  }
                }}
                className="px-8 py-3.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2.5 active:scale-95 text-center"
              >
                <BookOpen className="h-4.5 w-4.5" />
                <span>{primaryCtaLabel}</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>

              <Link
                href={secondaryCtaUrl}
                className="px-8 py-3.5 bg-card hover:bg-muted text-foreground border border-border/80 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center space-x-2 text-center active:scale-95 shadow-xs"
              >
                <Search className="h-4 w-4 text-secondary" />
                <span>{secondaryCtaLabel}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExchangeKnowledgeSection;
