'use client';

import React from 'react';
import { SellerLayout } from '@/components/seller/seller-layout';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleStatCard } from '@/components/shared/role-stat-card';
import { TrendingUp, Clock, Target, Star, Award, Zap } from 'lucide-react';

export default function SellerPerformancePage() {

  return (
    <SellerLayout>
      <RoleHero
        title="Seller Performance &amp; SLA Metrics"
        subtitle="Track your student lead response times, order dispatch speed, buyer review ratings, and monthly revenue targets."
        badgeText="Seller Quality &amp; Trust Index"
        stats={[
          { label: 'Seller Rating', value: '4.9 ★', badge: 'Top Rated', isPositive: true },
          { label: 'Response SLA', value: '< 15 mins', badge: 'Lightning Fast', isPositive: true },
          { label: 'Order Dispatch', value: '98.5%', badge: 'On Time', isPositive: true },
          { label: 'Monthly Goal', value: '82%', badge: 'On Track', isPositive: true },
        ]}
      />

      <div className="space-y-6 font-sans">
        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <RoleStatCard
            title="Average Response Time"
            value="12 mins"
            change="5m faster"
            isPositive={true}
            icon={Clock}
            accentColor="success"
            description="Time taken to respond to student buyer leads"
          />
          <RoleStatCard
            title="Lead Conversion Rate"
            value="68.4%"
            change="+4.2%"
            isPositive={true}
            icon={Zap}
            accentColor="brand"
            description="Leads that convert to completed textbook sales"
          />
          <RoleStatCard
            title="On-Time Dispatch Rate"
            value="98.5%"
            change="100% Target"
            isPositive={true}
            icon={TrendingUp}
            accentColor="accent"
            description="Orders shipped within 24 hours of placement"
          />
          <RoleStatCard
            title="Campus Seller Level"
            value="Level 3 Partner"
            change="Top 5%"
            isPositive={true}
            icon={Award}
            accentColor="secondary"
            description="Verified student seller ranking across India"
          />
        </div>

        {/* Monthly Sales Target Progress Bar */}
        <div className="p-5 sm:p-7 rounded-3xl border border-border/80 bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-serif text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-secondary" />
                <span>Monthly Semester Sales Goal (₹10,000)</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                You have reached <span className="font-bold text-foreground">₹8,200</span> of your ₹10,000 monthly goal!
              </p>
            </div>
            <span className="font-mono font-extrabold text-lg text-secondary">82%</span>
          </div>

          <div className="w-full bg-muted rounded-full h-3 overflow-hidden border border-border/60">
            <div className="bg-gradient-to-r from-[#1A3B5C] to-[#FF9F2D] h-3 rounded-full transition-all duration-500 w-[82%]" />
          </div>

          <p className="text-[11px] text-muted-foreground font-medium">
            💡 Pro tip: List 2 more Engineering or Medical competitive exam books to hit your 100% target before the month ends!
          </p>
        </div>

        {/* Badges & Trust Achievements */}
        <div className="p-5 sm:p-7 rounded-3xl border border-border/80 bg-card shadow-sm space-y-4">
          <h3 className="font-serif text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-secondary" />
            <span>Campus Seller Trust Badges</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" /> Fast Responder
              </span>
              <p className="text-[11px] text-muted-foreground">Maintained under 30-minute average response time to buyer requests for 30 consecutive days.</p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
              <span className="text-secondary font-bold flex items-center gap-1.5">
                <Award className="h-4 w-4 text-secondary" /> Verified Student Partner
              </span>
              <p className="text-[11px] text-muted-foreground">Verified campus affiliation and active student status across recognized universities in India.</p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
              <span className="text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-sky-500" /> Rapid Shipper
              </span>
              <p className="text-[11px] text-muted-foreground">Dispatched 95%+ of student textbook orders within 24 hours of confirmation.</p>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
