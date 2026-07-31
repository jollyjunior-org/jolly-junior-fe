import React from 'react';
import { X, Flame, ChevronRight, Home } from 'lucide-react';
import { useShopStore } from '@/store/useShopStore';

/**
 * Mobile hamburger drawer: home, categories, subcategories, live sales.
 */
export const MobileSidebar: React.FC = () => {
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    categories,
    liveSales,
    setFilter,
    setCurrentView,
    setActiveCategorySlug,
  } = useShopStore();

  if (!mobileMenuOpen) return null;

  const enabled = categories.filter((c) => c.isEnabled !== false);

  /** Go to the main homepage. */
  const goHome = () => {
    setFilter({
      categoryId: null,
      categoryIds: [],
      saleKey: null,
      searchQuery: '',
      onSaleOnly: false,
    });
    setActiveCategorySlug(null);
    setCurrentView('home');
    setMobileMenuOpen(false);
  };

  /** Open shop for a category slug. */
  const openCategory = (slug: string | null) => {
    setFilter({
      categoryId: slug,
      categoryIds: slug ? [slug] : [],
      saleKey: null,
      searchQuery: '',
    });
    setActiveCategorySlug(slug);
    setCurrentView('shop');
    setMobileMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[70] md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
      <aside className="absolute left-0 top-0 bottom-0 w-[82%] max-w-sm bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F5F2ED]">
          <h2 className="text-sm font-black text-[#5A5A40]">Browse</h2>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <button
            type="button"
            onClick={goHome}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F5F2ED] text-[#5A5A40] text-xs font-black cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span className="flex-1 text-left">Home</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {liveSales.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-wider text-rose-500 mb-2">
                Sale Categories
              </h3>
              <div className="space-y-1">
                {liveSales.map((sale) => (
                  <button
                    key={sale.id}
                    type="button"
                    onClick={() => {
                      setFilter({ saleKey: sale.key, categoryId: null, categoryIds: [] });
                      setCurrentView('shop');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span className="flex-1 text-left">{sale.title}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Categories
            </h3>
            <button
              type="button"
              onClick={() => openCategory(null)}
              className="w-full text-left px-3 py-2 text-xs font-bold text-[#5A5A40] hover:bg-[#F5F2ED] rounded-xl cursor-pointer"
            >
              Shop All
            </button>
            {enabled.map((cat) => (
              <div key={cat.id} className="mb-1">
                <button
                  type="button"
                  onClick={() => openCategory(cat.slug)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-[#5A5A40] hover:bg-[#F5F2ED] rounded-xl cursor-pointer"
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </button>
                {(cat.subcategories || []).length > 0 && (
                  <div className="pl-4 pb-1 space-y-0.5">
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          setFilter({
                            categoryId: cat.slug,
                            categoryIds: [cat.slug],
                            searchQuery: sub,
                            saleKey: null,
                          });
                          setCurrentView('shop');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:text-[#FFB347] cursor-pointer"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
