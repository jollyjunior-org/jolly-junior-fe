'use client';

import dynamic from 'next/dynamic';

/** Client-only storefront — skips SSR to avoid hydration mismatches (localStorage, URLs, etc.). */
const StoreApp = dynamic(() => import('@/components/StoreApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center text-[#8C8C70] text-sm font-medium">
      Loading JollyJuniors…
    </div>
  ),
});

/** Home / shop storefront entry. */
export default function HomePage() {
  return <StoreApp />;
}
