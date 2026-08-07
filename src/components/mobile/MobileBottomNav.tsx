import React from 'react';
import { useRouter } from 'next/navigation';
import { Home, Grid, Heart, ShoppingBag } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { goToHome, goToShop } from '@/utils/navigate-shop';

/**
 * Mobile bottom bar — home / shop / wishlist / cart (works from product pages too).
 */
export const MobileBottomNav: React.FC = () => {
  const router = useRouter();
  const {
    currentView,
    getCartCount,
    wishlist,
    setCartOpen,
    setWishlistOpen,
  } = useShopStore();

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#F1F5F9] z-40 px-3 py-2 flex items-center justify-around shadow-lg">
      <button
        type="button"
        onClick={() => goToHome(router)}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer ${
          currentView === 'home' ? 'text-[#3D6B4F]' : 'text-slate-500'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        type="button"
        onClick={() =>
          goToShop(router, {
            categoryId: null,
            categoryIds: [],
            saleKey: null,
            searchQuery: '',
          })
        }
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer ${
          currentView === 'shop' ? 'text-[#3D6B4F]' : 'text-slate-500'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span>Shop</span>
      </button>

      <button
        type="button"
        onClick={() => setWishlistOpen(true)}
        className="relative flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-500 cursor-pointer"
      >
        <div className="relative">
          <Heart className="w-5 h-5" />
          {wishlist.length > 0 && (
            <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#3D6B4F] text-white text-[9px] font-black flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </div>
        <span>Wishlist</span>
      </button>

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="relative flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-500 cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-[#FB923C]" />
          {getCartCount() > 0 && (
            <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#FB923C] text-white text-[9px] font-black flex items-center justify-center">
              {getCartCount()}
            </span>
          )}
        </div>
        <span>Cart</span>
      </button>
    </div>
  );
};
