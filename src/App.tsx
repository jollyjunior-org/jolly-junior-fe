import React, { useEffect } from 'react';
import { useShopStore } from './store/useShopStore';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { BackgroundDecorations } from './components/common/Decorations';
import { HeroSlider } from './components/home/HeroSlider';
import { FeaturedCategories } from './components/home/FeaturedCategories';
import { FlashSale } from './components/home/FlashSale';
import { ProductSlider } from './components/home/ProductSlider';
import { ShopByAge } from './components/home/ShopByAge';
import { GiftIdeas } from './components/home/GiftIdeas';
import { ParentReviews } from './components/home/ParentReviews';
import { InstagramGallery } from './components/home/InstagramGallery';
import { ShopPage } from './components/shop/ShopPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CartDrawer } from './components/cart/CartDrawer';
import { WishlistDrawer } from './components/cart/WishlistDrawer';
import { QuickViewModal } from './components/product/QuickViewModal';
import { ProductDetailModal } from './components/product/ProductDetailModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { Toast } from './components/common/Toast';
import { MessageSquare } from 'lucide-react';

export default function App() {
  const { currentView, setCurrentView, products, fetchPublicData, isAdminAuthenticated } = useShopStore();

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      const hash = window.location.hash.toLowerCase();
      const isAdminRoute = path === '/jj/admin' || path === '/jj/admin/dashboard' || path.startsWith('/jj/admin/') || path === '/admin' || path.endsWith('/admin') || hash === '#jj/admin' || hash === '#/jj/admin' || hash === '#admin' || hash === '#/admin';

      if (!isAdminRoute) {
        return;
      }

      setCurrentView('admin');

      if (isAdminAuthenticated && path === '/jj/admin') {
        window.history.replaceState(null, '', '/jj/admin/dashboard');
      } else if (!isAdminAuthenticated && path === '/jj/admin/dashboard') {
        window.history.replaceState(null, '', '/jj/admin');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [setCurrentView, isAdminAuthenticated]);

  if (currentView === 'admin') {
    return (
      <>
        <AdminDashboard />
        <Toast />
      </>
    );
  }

  const newArrivals = products.filter(p => p.badge === 'New' || p.discountBadge);
  const educationalToys = products.filter(p => p.categoryId === 'educational-toys');
  const bestSellers = products.filter(p => p.badge === 'Best Seller' || p.rating >= 4.9);

  return (
    <div className="min-h-screen flex flex-col relative bg-[#FFFDF8] text-[#334155] selection:bg-[#FCE7F3] selection:text-[#EC4899]">
      {/* Subtle Floating Background Decorations */}
      <BackgroundDecorations />

      {/* Main Navigation Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {currentView === 'home' ? (
          <div className="space-y-4 sm:space-y-8">
            <HeroSlider />
            <FeaturedCategories />
            <FlashSale />
            <ProductSlider
              title="New Toy & Care Arrivals"
              subtitle="Freshly added organic cotton Rattles, Swaddles & Montessori tools"
              products={newArrivals}
              badge="Just Arrived ✨"
              badgeColor="bg-[#D1FAE5] text-[#059669]"
            />
            <ShopByAge />
            <ProductSlider
              title="Educational & Montessori Toys"
              subtitle="Promote early brain development, motor skills and logical thinking"
              products={educationalToys}
              categoryFilterSlug="educational-toys"
              badge="Montessori Approved 🧩"
              badgeColor="bg-[#FEF3C7] text-[#D97706]"
            />
            <GiftIdeas />
            <ProductSlider
              title="Customer Favorites & Best Sellers"
              subtitle="Parent approved staples rated 4.9+ stars across Pakistan"
              products={bestSellers}
              badge="Top Rated ❤️"
              badgeColor="bg-[#FCE7F3] text-[#EC4899]"
            />
            <ParentReviews />
            <InstagramGallery />
          </div>
        ) : (
          <ShopPage />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Drawers & Modals */}
      <CartDrawer />
      <WishlistDrawer />
      <QuickViewModal />
      <ProductDetailModal />
      <CheckoutModal />

      {/* Floating WhatsApp Support Bubble */}
      <a
        href="https://wa.me/923001234567?text=Hi%20JollyJuniors!%20I%20need%20help%20choosing%20the%20right%20toy%20or%20baby%20care%20item."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30 p-3.5 rounded-full bg-[#22C55E] text-white shadow-xl hover:scale-110 transition-transform cursor-pointer flex items-center justify-center border-2 border-white"
        title="Chat with WhatsApp Support"
      >
        <MessageSquare className="w-6 h-6 fill-current" />
      </a>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}
