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
      className="py-12 sm:py-16 lg:py-20 relative bg-[#FAF8F5] dark:bg-background border-b border-border/60 font-sans transition-colors duration-200 overflow-hidden"
    >
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 transition-all space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative rounded-t-[140px] rounded-b-3xl overflow-hidden shadow-xl border border-border/50 bg-card aspect-[4/3.4] group"
            >
              <Image
                src="/images/book-exchange-students-removebg-preview.png"
                alt="Indian university students exchanging a pre-owned textbook on campus"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 650px"
                className="object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
              />

              <div className="absolute bottom-4 left-4 h-12 w-12 rounded-full bg-[#EBF7EE] dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg">
                <Leaf className="h-6 w-6 stroke-[2.2]" />
              </div>
            </motion.div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3.5 rounded-2xl bg-card border border-border/60 shadow-xs font-sans">
              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 rounded-full bg-[#EBF7EE] text-emerald-600 flex items-center justify-center shrink-0">
                  <IndianRupee className="h-4.5 w-4.5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs font-black text-foreground block leading-tight">
                    {savePercentText}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    {savePercentSubtext}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 border-x border-border/50 px-2 sm:px-3">
                <div className="h-9 w-9 rounded-full bg-[#FFF5EB] text-[#F26522] flex items-center justify-center shrink-0">
                  <Coins className="h-4.5 w-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-black text-foreground block leading-tight">
                    {earnPercentText}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    {earnPercentSubtext}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 rounded-full bg-[#EEF4FF] text-blue-600 flex items-center justify-center shrink-0">
                  <Globe className="h-4.5 w-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-black text-foreground block leading-tight">
                    {ecoText}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    {ecoSubtext}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FFEFE6] dark:bg-[#F26522]/15 text-[#F26522] border border-[#FFD9C7] dark:border-[#F26522]/30 text-xs font-black uppercase tracking-wider">
                <Users className="h-4 w-4" />
                <span>{eyebrow}</span>
              </div>

              <h2 className="font-sans text-3xl sm:text-4xl lg:text-[44px] font-black text-foreground tracking-tight leading-[1.15]">
                {title}
                <span className="inline-block ml-2 text-emerald-500 text-2xl">
                  🌿
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl font-medium">
                {subtitle}
              </p>
            </div>

            <div className="relative pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                {stepList.map((step, idx) => {
                  const Icon = ICONS[idx % ICONS.length];
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-3">
                        <div className="h-11 w-11 rounded-2xl bg-[#FFF2EB] dark:bg-orange-950/40 text-[#F26522] flex items-center justify-center">
                          <Icon className="h-5 w-5 stroke-[2.2]" />
                        </div>

                        <div className="space-y-1">
                          <span className="font-sans text-xs font-black text-[#F26522]">
                            {step.stepNumber || `0${idx + 1}`}
                          </span>
                          <h3 className="font-sans text-sm font-black text-foreground">
                            {step.title}
                          </h3>
                          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {step.badge && (
                        <div>
                          <span className="inline-block px-2.5 py-1 rounded-full bg-[#FFF2EB] dark:bg-orange-950/50 text-[#F26522] border border-[#FFD9C7] text-[10px] font-black uppercase tracking-wider">
                            {step.badge}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
                className="px-8 py-3.5 bg-[#F26522] hover:bg-[#D64E0F] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-[#F26522]/20 flex items-center justify-center space-x-2.5 active:scale-95 text-center"
              >
                <BookOpen className="h-4.5 w-4.5" />
                <span>{primaryCtaLabel}</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>

              <Link
                href={secondaryCtaUrl}
                className="px-8 py-3.5 bg-card hover:bg-muted text-foreground border border-border/80 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center space-x-2 text-center active:scale-95 shadow-2xs"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
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
