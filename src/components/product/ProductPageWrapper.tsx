'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/components/common/Loader';

const ProductPageClient = dynamic(() => import('@/components/product/ProductPageClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
      <Loader text="Loading product…" size="lg" />
    </div>
  ),
});

export default function ProductPageWrapper() {
  return <ProductPageClient />;
}
