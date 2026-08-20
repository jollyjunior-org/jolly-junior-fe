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
import { OrderTracking } from '@/components/orders/OrderTracking';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ImageProtection } from '@/components/common/ImageProtection';
import { MessageSquare } from 'lucide-react';
import { productsForHomeSection } from '@/services/home-section-resolver';
import { readShopUrl } from '@/utils/shop-url';

/**
 * Client storefront shell.
 * Home/shop views switch via Zustand + URL helpers.
 */
export default function StoreApp() {
  const {
    currentView,
    setCurrentView,
    products,
    fetchPublicData,
    hydrateGuestState,
    storefrontConfig,
    setFilter,
    setActiveCategorySlug,
    fetchShopCatalog,
  } = useShopStore();

  const whatsappNum = storefrontConfig?.whatsappNumber || '923001234567';
  const cleanWhatsappNum = whatsappNum.replace(/[^\d]/g, '') || '923001234567';

  useEffect(() => {
    // Restore cart / wishlist / auth from localStorage after mount (SSR-safe)
    hydrateGuestState();
    fetchPublicData();
  }, [fetchPublicData, hydrateGuestState]);

  // Restore shop filters from URL on load / back button
  useEffect(() => {
    const applyUrl = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
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
        const current = useShopStore.getState().currentView;
        if (current !== 'checkout' && current !== 'order-success') {
          setCurrentView('home');
        }
      }
    };

    applyUrl();
    window.addEventListener('popstate', applyUrl);
    window.addEventListener('hashchange', applyUrl);
    return () => {
      window.removeEventListener('popstate', applyUrl);
      window.removeEventListener('hashchange', applyUrl);
    };
  }, [setCurrentView, setFilter, setActiveCategorySlug, fetchShopCatalog]);

  const homeRails = (storefrontConfig.homeSections || []).filter((s) => {
    if (s.key === 'sale' && s.sourceType === 'rule') return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col relative bg-[#FFFDF7] text-[#263238] selection:bg-[#D9F1F5] selection:text-[#0798AE]">
      <ImageProtection />
      <BackgroundDecorations />
      <Header />
      <MobileSidebar />
      <AuthModal />
      <AccountPanel />

      <main className="flex-1 relative z-10">
        {currentView === 'home' ? (
          <div className="space-y-1 sm:space-y-2">
            <HeroSlider />
            <FeaturedCategories />
            <FlashSale />
            {homeRails.map((section, index) => {
              const sectionProducts = productsForHomeSection(products, section);
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
                    sourceType={section.sourceType}
                    sourceValue={section.sourceValue}
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
        href={`https://wa.me/${cleanWhatsappNum}?text=Hi%20JollyJuniors!%20I%20need%20help%20choosing%20the%20right%20toy%20or%20baby%20care%20item.`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30 p-2.5 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-110 transition-transform cursor-pointer flex items-center justify-center border-2 border-white"
        title="Chat with WhatsApp Support"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      </a>

      <ScrollToTop />
      <MobileBottomNav />
      <Toast />
    </div>
  );
}
