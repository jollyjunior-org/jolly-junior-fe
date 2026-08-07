import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Flame, ChevronRight, Home } from 'lucide-react';
import { useShopStore } from '@/store/useShopStore';
import { goToHome, goToShop } from '@/utils/navigate-shop';

/**
 * Mobile hamburger drawer: home, categories, subcategories, live sales.
 */
export const MobileSidebar: React.FC = () => {
  const router = useRouter();
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    categories,
    liveSales,
  } = useShopStore();

  if (!mobileMenuOpen) return null;

  const enabled = categories.filter((c) => c.isEnabled !== false);

  /** Go to the main homepage. */
  const goHome = () => {
    goToHome(router);
    setMobileMenuOpen(false);
  };

  /** Open shop for a category slug. */
  const openCategory = (slug: string | null) => {
    goToShop(router, {
      categoryId: slug,
      categoryIds: slug ? [slug] : [],
      saleKey: null,
      searchQuery: '',
    });
    setMobileMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close menu"
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside className="absolute left-0 top-0 bottom-0 w-[82%] max-w-sm bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#DDE8DC]">
          <span className="font-black text-[#1C2B1E]">Menu</span>
          <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {liveSales.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase text-[#5C7060]">Live Sales</div>
              {liveSales.map((sale) => (
                <button
                  key={sale.id}
                  type="button"
                  onClick={() => {
                    goToShop(router, {
                      saleKey: sale.key,
                      categoryId: null,
                      categoryIds: [],
                    });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between py-2 text-sm font-bold text-[#EF4444]"
                >
                  <span className="flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    {sale.title}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase text-[#5C7060]">Categories</div>
            <button
              type="button"
              onClick={goHome}
              className="w-full text-left py-2 text-sm font-bold text-[#1C2B1E] flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              type="button"
              onClick={() => openCategory(null)}
              className="w-full text-left py-2 text-sm font-bold text-[#1C2B1E]"
            >
              Shop All
            </button>
            {enabled.map((cat) => (
              <div key={cat.id}>
                <button
                  type="button"
                  onClick={() => openCategory(cat.slug)}
                  className="w-full flex items-center justify-between py-2 text-sm font-bold text-[#1C2B1E]"
                >
                  {cat.name}
                  <ChevronRight className="w-4 h-4 text-[#5C7060]" />
                </button>
                {(cat.subcategories || []).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => {
                      goToShop(router, {
                        categoryId: cat.slug,
                        categoryIds: [cat.slug],
                        searchQuery: sub,
                        saleKey: null,
                      });
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left pl-4 py-1.5 text-xs font-semibold text-[#5C7060]"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
