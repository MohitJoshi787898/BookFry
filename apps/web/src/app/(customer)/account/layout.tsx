'use client';

import React from 'react';
import { BuyerLayout } from '@/components/buyer/buyer-layout';

export default function CustomerAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BuyerLayout>{children}</BuyerLayout>;
}
