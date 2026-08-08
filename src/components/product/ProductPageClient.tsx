'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useShopStore } from '@/store/useShopStore';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { BackgroundDecorations } from '@/components/common/Decorations';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { WishlistDrawer } from '@/components/cart/WishlistDrawer';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { MobileSidebar } from '@/components/common/MobileSidebar';
import { AuthModal } from '@/components/common/AuthModal';
import { AccountPanel } from '@/components/common/AccountPanel';
import { Toast } from '@/components/common/Toast';
import { Loader } from '@/components/common/Loader';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import * as productService from '@/services/product-service';
import type { Product } from '@/types';
import { buildShopHref, readShopUrl } from '@/utils/shop-url';

/**
 * Full product page shell — Header/Footer + detail by /product/[slug].
 */
export default function ProductPageClient() {
  const params = useParams();
  const router = useRouter();
  const slug = decodeURIComponent(String(params?.slug || ''));
  const { products, fetchPublicData, hydrateGuestState } = useShopStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // If shop query landed on /product/... (legacy stuck URL), jump to real shop on `/`
  useEffect(() => {
    const url = readShopUrl();
    if (url.view === 'shop' || url.categoryId || url.saleKey || url.searchQuery || url.categoryIds.length) {
      router.replace(
        buildShopHref({
          view: 'shop',
          categoryId: url.categoryId,
          categoryIds: url.categoryIds.length
            ? url.categoryIds
            : url.categoryId
              ? [url.categoryId]
              : [],
          saleKey: url.saleKey,
          searchQuery: url.searchQuery,
          onSaleOnly: url.onSaleOnly,
        }),
      );
    }
  }, [router]);

  useEffect(() => {
    hydrateGuestState();
    void fetchPublicData();
  }, [fetchPublicData, hydrateGuestState]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      // Prefer already-loaded catalog
      const fromStore = products.find((p) => p.slug === slug || p.id === slug);
      if (fromStore) {
        if (!cancelled) {
          setProduct(fromStore);
          setLoading(false);
        }
        return;
      }
      try {
        const p = await productService.fetchPublicProduct(slug);
        if (!cancelled) {
          setProduct(p);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setProduct(null);
          setNotFound(true);
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug, products]);

  return (
    <div className="min-h-screen flex flex-col relative bg-[#FFFDF7] text-[#263238]">
      <BackgroundDecorations />
      <Header />
      <MobileSidebar />
      <AuthModal />
      <AccountPanel />

      <main className="flex-1 relative z-10">
        {loading && (
          <Loader text="Loading product..." size="lg" className="py-24" />
        )}
        {!loading && notFound && (
          <div className="py-24 text-center space-y-2">
            <h1 className="text-lg font-black text-[#0798AE]">Product not found</h1>
            <p className="text-xs text-[#0798AE]">This link may be old or the item was unpublished.</p>
          </div>
        )}
        {!loading && product && <ProductDetailView product={product} />}
      </main>

      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <CheckoutModal />
      <MobileBottomNav />
      <Toast />
    </div>
  );
}
