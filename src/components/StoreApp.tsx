'use client';

import React, { useEffect } from 'react';
import { useShopStore } from '@/store/useShopStore';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { BackgroundDecorations } from '@/components/common/Decorations';
import { HeroSlider } from '@/components/home/HeroSlider';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { FlashSale } from '@/components/home/FlashSale';
import { ProductSlider } from '@/components/home/ProductSlider';
import { ShopByAge } from '@/components/home/ShopByAge';
import { GiftIdeas } from '@/components/home/GiftIdeas';
import { ParentReviews } from '@/components/home/ParentReviews';
import { ShopPage } from '@/components/shop/ShopPage';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { WishlistDrawer } from '@/components/cart/WishlistDrawer';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { MobileSidebar } from '@/components/common/MobileSidebar';
import { AuthModal } from '@/components/common/AuthModal';
import { AccountPanel } from '@/components/common/AccountPanel';
import { FeedbackModal } from '@/components/common/FeedbackModal';
import { Toast } from '@/components/common/Toast';
import { MessageSquare } from 'lucide-react';
import { productsForHomeSection } from '@/services/home-section-resolver';
import { readShopUrl } from '@/utils/shop-url';

/**
 * Client storefront shell (same behavior as the old Vite App.tsx).
 * Home/shop/admin views still switch via Zustand + URL helpers.
 */
export default function StoreApp() {
  const {
    currentView,
    setCurrentView,
    products,
    fetchPublicData,
    hydrateGuestState,
    isAdminAuthenticated,
    storefrontConfig,
    setFilter,
    setActiveCategorySlug,
    fetchShopCatalog,
  } = useShopStore();

  useEffect(() => {
    // Restore cart / wishlist / auth from localStorage after mount (SSR-safe)
    hydrateGuestState();
    fetchPublicData();
  }, [fetchPublicData, hydrateGuestState]);

  // Restore shop filters / admin route from URL on load / back button
  useEffect(() => {
    const applyUrl = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      const hash = window.location.hash.toLowerCase();
      const isAdminRoute =
        path === '/jj/admin' ||
        path === '/jj/admin/dashboard' ||
        path.startsWith('/jj/admin/') ||
        path === '/admin' ||
        path.endsWith('/admin') ||
        hash === '#jj/admin' ||
        hash === '#/jj/admin' ||
        hash === '#admin' ||
        hash === '#/admin';

      if (isAdminRoute) {
        setCurrentView('admin');
        if (isAdminAuthenticated && path === '/jj/admin') {
          window.history.replaceState(null, '', '/jj/admin/dashboard');
        } else if (!isAdminAuthenticated && path === '/jj/admin/dashboard') {
          window.history.replaceState(null, '', '/jj/admin');
        }
        return;
      }

      const url = readShopUrl();
      if (url.view === 'shop' || url.categoryId || url.saleKey || url.searchQuery) {
        setFilter({
          categoryId: url.categoryId,
          categoryIds: url.categoryIds.length
            ? url.categoryIds
            : url.categoryId
              ? [url.categoryId]
              : [],
          saleKey: url.saleKey,
          searchQuery: url.searchQuery,
          onSaleOnly: url.onSaleOnly,
        });
        setActiveCategorySlug(url.categoryId);
        setCurrentView('shop');
        // Load category / store products for this URL
        void useShopStore.getState().fetchShopCatalog();
      } else if (path === '/' || path === '') {
        setCurrentView('home');
      }
    };

    applyUrl();
    window.addEventListener('popstate', applyUrl);
    window.addEventListener('hashchange', applyUrl);
    return () => {
      window.removeEventListener('popstate', applyUrl);
      window.removeEventListener('hashchange', applyUrl);
    };
  }, [setCurrentView, isAdminAuthenticated, setFilter, setActiveCategorySlug, fetchShopCatalog]);

  if (currentView === 'admin') {
    return (
      <>
        <AdminDashboard />
        <Toast />
      </>
    );
  }

  const homeRails = (storefrontConfig.homeSections || []).filter((s) => {
    if (s.key === 'sale' && s.sourceType === 'rule') return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col relative bg-[#FFFDF7] text-[#263238] selection:bg-[#D9F1F5] selection:text-[#0798AE]">
      <BackgroundDecorations />
      <Header />
      <MobileSidebar />
      <AuthModal />
      <AccountPanel />
      <FeedbackModal />

      <main className="flex-1 relative z-10">
        {currentView === 'home' ? (
          <div className="space-y-1 sm:space-y-2">
            <HeroSlider />
            <FeaturedCategories />
            <FlashSale />
            {homeRails.map((section, index) => {
              const sectionProducts = productsForHomeSection(products, section);
              if (!sectionProducts.length) return null;
              const categorySlug =
                section.sourceType === 'category'
                  ? products.find((p) => p.categoryId === section.sourceValue)?.categorySlug ||
                    undefined
                  : undefined;
              return (
                <React.Fragment key={section.id}>
                  {index === 1 && <ShopByAge />}
                  <ProductSlider
                    title={section.title}
                    subtitle={section.subtitle || ''}
                    products={sectionProducts}
                    categoryFilterSlug={categorySlug}
                    badge={section.sectionBadge}
                    badgeColor="bg-[#FFFDF7] text-[#0798AE]"
                  />
                  {index === 1 && <GiftIdeas />}
                </React.Fragment>
              );
            })}
            <ParentReviews />
          </div>
        ) : (
          <ShopPage />
        )}
      </main>

      <Footer />

      <CartDrawer />
      <WishlistDrawer />
      <QuickViewModal />
      <CheckoutModal />

      <a
        href="https://wa.me/923001234567?text=Hi%20JollyJuniors!%20I%20need%20help%20choosing%20the%20right%20toy%20or%20baby%20care%20item."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30 p-3.5 rounded-full bg-[#22C55E] text-white shadow-xl hover:scale-110 transition-transform cursor-pointer flex items-center justify-center border-2 border-white"
        title="Chat with WhatsApp Support"
      >
        <MessageSquare className="w-6 h-6 fill-current" />
      </a>

      <MobileBottomNav />
      <Toast />
    </div>
  );
}
