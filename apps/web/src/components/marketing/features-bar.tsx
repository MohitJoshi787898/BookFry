'use client';

import React from 'react';
import { Tag, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { TrustBarItem } from '../shared/trust-bar-item';

export function FeaturesBar() {
  return (
    <div className="bg-background-subtle border-b border-border/60 py-6 font-sans transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 divide-y sm:divide-y-0 md:divide-x divide-border/60">
          <div className="flex justify-start md:justify-center items-center py-2 md:py-0 md:px-4">
            <TrustBarItem
              icon={Tag}
              title="Up to 80% Off"
              description="On New & Used Books"
            />
          </div>
          <div className="flex justify-start md:justify-center items-center py-2 md:py-0 md:px-4 pt-4 sm:pt-2 md:pt-0">
            <TrustBarItem
              icon={Truck}
              title="Free Shipping"
              description="On orders over ₹499"
            />
          </div>
          <div className="flex justify-start md:justify-center items-center py-2 md:py-0 md:px-4 pt-4 sm:pt-2 md:pt-0">
            <TrustBarItem
              icon={ShieldCheck}
              title="Quality Checked"
              description="100% Verified Books"
            />
          </div>
          <div className="flex justify-start md:justify-center items-center py-2 md:py-0 md:px-4 pt-4 sm:pt-2 md:pt-0">
            <TrustBarItem
              icon={RotateCcw}
              title="Easy Returns"
              description="Hassle-free returns"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturesBar;
