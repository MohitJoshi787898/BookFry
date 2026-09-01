'use client';

import React from 'react';
import { VendorLayout } from '@/components/vendor/vendor-layout';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleStatCard } from '@/components/shared/role-stat-card';
import { BarChart3, TrendingUp, Users, ShoppingBag, Award } from 'lucide-react';

export default function VendorAnalyticsPage() {

  return (
    <VendorLayout>
      <RoleHero
        title="Commercial Sales &amp; Demand Analytics"
        subtitle="Insights on academic syllabus demand trends, high-volume textbook categories, and campus student buying patterns."
        badgeText="Merchant Intelligence Engine"
        stats={[
          { label: 'Demand Index', value: 'High', badge: 'Semester Peak', isPositive: true },
          { label: 'Return Rate', value: '< 1.2%', badge: 'Industry Leading', isPositive: true },
          { label: 'Avg Basket Size', value: '₹1,420', badge: '+8.5%', isPositive: true },
          { label: 'Repeat Buyers', value: '34.8%', badge: 'Campus Loyalty', isPositive: true },
        ]}
      />

      <div className="space-y-6 font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <RoleStatCard
            title="Syllabus Demand Index"
            value="94.2 / 100"
            change="+12.4%"
            isPositive={true}
            icon={TrendingUp}
            accentColor="brand"
            description="Semester textbook search demand across India"
          />
          <RoleStatCard
            title="Avg Order Value (AOV)"
            value="₹1,420"
            change="+8.5%"
            isPositive={true}
            icon={ShoppingBag}
            accentColor="success"
            description="Average student cart value for your catalog"
          />
          <RoleStatCard
            title="Student Repeat Purchases"
            value="34.8%"
            change="+5.1%"
            isPositive={true}
            icon={Users}
            accentColor="accent"
            description="Campus buyers purchasing multiple semesters"
          />
          <RoleStatCard
            title="Fulfillment Quality"
            value="99.2%"
            change="Top Tier"
            isPositive={true}
            icon={Award}
            accentColor="secondary"
            description="Verified condition &amp; zero packaging defect score"
          />
        </div>

        {/* Top Demanded Academic Subjects */}
        <div className="p-5 sm:p-7 rounded-3xl border border-border/80 bg-card shadow-sm space-y-4">
          <h3 className="font-serif text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-secondary" />
            <span>Top Performing Academic Categories</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
              <span className="text-secondary font-bold text-sm block">1. Engineering &amp; Computer Science</span>
              <p className="text-muted-foreground">Highest volume in Data Structures, Algorithms, AI/ML, and GATE preparatory guides.</p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
              <span className="text-secondary font-bold text-sm block">2. Medical &amp; MBBS Textbook Guides</span>
              <p className="text-muted-foreground">Consistent semester demand for Human Anatomy, Biochemistry, Pathology, and NEET PG manuals.</p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
              <span className="text-secondary font-bold text-sm block">3. UPSC &amp; Civil Services Entrance</span>
              <p className="text-muted-foreground">High recurring sales for Indian Polity, Modern History, Geography, and Current Affairs compendiums.</p>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
