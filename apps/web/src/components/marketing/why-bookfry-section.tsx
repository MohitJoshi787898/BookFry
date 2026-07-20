'use client';

import React from 'react';
import { EcoBookIllustration } from '@/components/illustrations/book-illustrations';
import { ShieldCheck, HeartHandshake, TreePine, GraduationCap } from 'lucide-react';

export function WhyBookFrySection() {
  const pillars = [
    {
      icon: GraduationCap,
      title: 'Affordable Education',
      desc: 'No student should pause learning because of expensive textbook prices. Get genuine books at up to 80% off.',
      badge: 'Up to 80% Off',
    },
    {
      icon: HeartHandshake,
      title: 'Verified Student Sellers',
      desc: 'Connect directly with senior students, toppers, and verified readers selling genuine course material.',
      badge: 'Verified Peer-to-Peer',
    },
    {
      icon: TreePine,
      title: 'Eco-Friendly Circular Reuse',
      desc: 'Every recycled book saves 2.5kg of CO2 and paper waste. Read more, spend less, protect the environment.',
      badge: 'Save Trees & Planet',
    },
    {
      icon: ShieldCheck,
      title: '100% Escrow Protection',
      desc: 'Payments are safely held in escrow until you inspect the book condition. 100% money-back refund guarantee.',
      badge: 'Zero Risk Guarantee',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background-subtle border-b border-border font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand block">
            The BookFry Philosophy
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">
            More Than Just a Marketplace — Built for Learners
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            We believe that education must never stop. Our mission is to make quality reading and course literature accessible to every student in India.
          </p>
        </div>

        {/* 4 Pillar Grid with Eco Illustration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 4 Cards (2x2) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((pillar) => {
              const IconComp = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-xl bg-surface border border-border hover-page-turn space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                      <IconComp className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20">
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-text-primary">{pillar.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Right Eco Illustration Card */}
          <div className="lg:col-span-4 p-8 rounded-xl bg-brand text-white text-center space-y-4 shadow-lg relative overflow-hidden">
            <div className="w-full max-w-xs mx-auto">
              <EcoBookIllustration className="w-full h-auto max-h-56" />
            </div>
            <div className="space-y-2">
              <span className="font-serif italic text-accent text-base font-semibold block">
                &quot;क्योंकि.. पढ़ाई रुकनी नहीं चाहिए&quot;
              </span>
              <p className="text-xs text-white/80 leading-relaxed">
                Over 12,000+ trees saved this year through student book sharing on BookFry. Join the movement today!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyBookFrySection;
