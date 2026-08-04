'use client';

import dynamic from 'next/dynamic';

const ProductPageClient = dynamic(() => import('@/components/product/ProductPageClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center text-[#8C8C70] text-sm font-medium">
      Loading product…
    </div>
  ),
});

/**
 * Shareable product URL: /product/[slug]
 * Example: /product/wooden-sorting-tower
 */
export default function ProductPage() {
  return <ProductPageClient />;
}
