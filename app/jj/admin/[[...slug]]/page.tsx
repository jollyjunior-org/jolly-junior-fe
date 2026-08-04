'use client';

import dynamic from 'next/dynamic';

/** Client-only admin — skips SSR (same shell as storefront). */
const StoreApp = dynamic(() => import('@/components/StoreApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center text-[#8C8C70] text-sm font-medium">
      Loading admin…
    </div>
  ),
});

/** Admin portal entry (/jj/admin, /jj/admin/dashboard, …). */
export default function AdminPage() {
  return <StoreApp />;
}
