'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Loader } from '@/components/common/Loader';
import { StandaloneHeader } from '@/components/common/StandaloneHeader';

const FeedbackStandalone = dynamic(() => import('@/components/common/FeedbackStandalone').then(m => m.FeedbackStandalone), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
      <Loader text="Loading Feedback Form…" size="lg" />
    </div>
  ),
});

export default function FeedbackPage() {
  const params = useParams();
  const token = typeof params?.token === 'string' ? params.token : '';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#263238] selection:bg-[#D9F1F5] selection:text-[#0798AE]">
      <StandaloneHeader />
      <main className="flex-1 flex flex-col pt-6">
        <FeedbackStandalone token={token} />
      </main>
      
      {/* Minimal footer */}
      <footer className="mt-auto py-8 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Jolly Juniors Pakistan. All rights reserved.
      </footer>
    </div>
  );
}
