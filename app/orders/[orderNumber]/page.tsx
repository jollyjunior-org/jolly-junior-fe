'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Loader } from '@/components/common/Loader';
import { StandaloneHeader } from '@/components/common/StandaloneHeader';

const OrderTracking = dynamic(() => import('@/components/orders/OrderTracking').then(m => m.OrderTracking), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
      <Loader text="Loading Order Tracker…" size="lg" />
    </div>
  ),
});

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = typeof params?.orderNumber === 'string' ? params.orderNumber : '';

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col text-[#263238] selection:bg-[#D9F1F5] selection:text-[#0798AE]">
      <StandaloneHeader />
      <main className="flex-1">
        <OrderTracking orderNumber={orderNumber} />
      </main>
    </div>
  );
}
