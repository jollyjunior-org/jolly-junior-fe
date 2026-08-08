'use client';

import dynamic from 'next/dynamic';

import { Loader } from '@/components/common/Loader';

/** Client-only storefront — skips SSR to avoid hydration mismatches (localStorage, URLs, etc.). */
const StoreApp = dynamic(() => import('@/components/StoreApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
      <Loader text="Loading JollyJuniors…" size="lg" />
    </div>
  ),
});

/** Home / shop storefront entry. */
export default function HomePage() {
  return <StoreApp />;
}
