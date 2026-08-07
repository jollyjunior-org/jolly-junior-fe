import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Heart, ShoppingBag, User, Flame,
  MessageSquare, Menu,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useShopStore } from '../../store/useShopStore';
import { Product } from '../../types';
import * as customerService from '@/services/customer-service';
import { productPath } from '@/utils/product-path';
import { goToShop, goToHome } from '@/utils/navigate-shop';

export const Header: React.FC = () => {
  const router = useRouter();
  const {
    products,
    categories,
    storefrontConfig,
    wishlist,
    getCartCount,
    setCartOpen,
    setWishlistOpen,
    setMobileMenuOpen,
    setAuthModalOpen,
    setAccountPanelOpen,
    isCustomerAuthenticated,
    liveSales,
    filter,
    activeCategorySlug,
    currentView,
  } = useShopStore();

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [apiResults, setApiResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const disabledCategorySlugs = new Set(
    categories.filter((c) => c.isEnabled === false).map((c) => c.slug),
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced backend search
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setApiResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const items = await customerService.searchStoreProducts(q);
        if (!cancelled) setApiResults(items.slice(0, 8));
      } catch {
        // Fallback to local filter
        if (!cancelled) {
          setApiResults(
            products
              .filter(
                (p) =>
                  p.isPublished !== false &&
                  !disabledCategorySlugs.has(p.categorySlug || p.categoryId) &&
                  (p.name.toLowerCase().includes(q.toLowerCase()) ||
                    p.categoryName.toLowerCase().includes(q.toLowerCase())),
              )
              .slice(0, 5),
          );
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchQuery, products]);

  type NavItem = {
    name: string;
    slug: string;
    badge: string | null;
    kind: 'home' | 'shop-all' | 'category' | 'section' | 'sale';
    sourceType?: string;
    sourceValue?: string | null;
    saleKey?: string;
  };

  const navCategories: NavItem[] = [
    { name: 'Home', slug: 'home', badge: null, kind: 'home' },
    { name: 'Shop All', slug: 'all', badge: null, kind: 'shop-all' },
    ...liveSales.map((s) => ({
      name: s.title,
      slug: `sale-${s.key}`,
      badge: s.badge_text || 'SALE',
      kind: 'sale' as const,
      saleKey: s.key,
    })),
    ...[...(storefrontConfig.navSectionChips || [])]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((chip) => ({
        name: chip.name,
        slug: chip.slug,
        badge: chip.tagLabel || null,
        kind: 'section' as const,
        sourceType: chip.sourceType,
        sourceValue: chip.sourceValue,
      })),
    ...[...(storefrontConfig.navCategories || [])]
      .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0) || a.name.localeCompare(b.name))
      .map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        badge: cat.tagLabel || null,
        kind: 'category' as const,
      })),
  ];

  /** Is this nav item the currently selected one? */
  const isNavActive = (item: NavItem) => {
    if (item.kind === 'home') {
      return currentView === 'home';
    }
    if (item.kind === 'shop-all') {
      return (
        currentView === 'shop' &&
        !filter.categoryId &&
        !filter.saleKey &&
        filter.categoryIds.length === 0 &&
        !filter.onSaleOnly
      );
    }
    if (item.kind === 'sale') return filter.saleKey === item.saleKey;
    if (item.kind === 'category') {
      return (
        filter.categoryId === item.slug ||
        activeCategorySlug === item.slug ||
        filter.categoryIds.includes(item.slug)
      );
    }
    if (item.kind === 'section' && item.sourceType === 'rule' && item.sourceValue === 'sale') {
      return filter.onSaleOnly;
    }
    return false;
  };

  const handleCategoryClick = (item: NavItem) => {
    if (item.kind === 'home') {
      goToHome(router);
    } else if (item.kind === 'shop-all' || item.slug === 'all') {
      goToShop(router, {
        categoryId: null,
        categoryIds: [],
        searchQuery: '',
        onSaleOnly: false,
        saleKey: null,
      });
    } else if (item.kind === 'sale' && item.saleKey) {
      goToShop(router, {
        saleKey: item.saleKey,
        categoryId: null,
        categoryIds: [],
        onSaleOnly: false,
        searchQuery: '',
      });
    } else if (item.kind === 'section') {
      if (item.sourceType === 'rule' && item.sourceValue === 'sale') {
        goToShop(router, {
          categoryId: null,
          categoryIds: [],
          onSaleOnly: true,
          searchQuery: '',
          saleKey: null,
        });
      } else if (item.sourceType === 'badge' && item.sourceValue === 'New') {
        goToShop(router, {
          categoryId: null,
          categoryIds: [],
          sortBy: 'newest',
          searchQuery: '',
          saleKey: null,
        });
      } else if (item.sourceType === 'badge' && item.sourceValue === 'Best Seller') {
        goToShop(router, {
          categoryId: null,
          categoryIds: [],
          sortBy: 'rating',
          searchQuery: '',
          saleKey: null,
        });
      } else if (item.sourceType === 'category' && item.sourceValue) {
        const cat = categories.find((c) => c.id === item.sourceValue);
        const slug = cat?.slug || item.sourceValue;
        goToShop(router, {
          categoryId: slug,
          categoryIds: [slug],
          searchQuery: '',
          saleKey: null,
        });
      } else {
        goToShop(router, {
          categoryId: null,
          categoryIds: [],
          searchQuery: '',
          saleKey: null,
        });
      }
    } else {
      goToShop(router, {
        categoryId: item.slug,
        categoryIds: [item.slug],
        searchQuery: '',
        onSaleOnly: false,
        saleKey: null,
      });
    }
    setHoveredCategory(null);
  };

  const handleSelectSearchResult = (product: Product) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    router.push(productPath(product));
  };

  const runSearch = () => {
    if (!searchQuery.trim()) return;
    goToShop(router, { searchQuery: searchQuery.trim(), saleKey: null });
    setIsSearchFocused(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-[#D9F1F5]">
      <div className="bg-[#0798AE] text-white text-xs py-2 px-4 font-medium border-b border-[#D9F1F5]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-bold">
              🚚 Free Delivery on orders over Rs. 3,000
            </span>
          </div>
          <div className="flex items-center gap-5 text-[11px] sm:text-xs font-semibold">
            <a
              href="https://wa.me/923001234567?text=Hi%20JollyJuniors!"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-white hover:underline"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="md:hidden p-2 rounded-full hover:bg-[#D9F1F5] cursor-pointer"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-[#0798AE]" />
          </button>
          <BrandLogo
            size="md"
            onNavigateHome={() => goToHome(router)}
          />
        </div>

        <div className="hidden md:block flex-1 max-w-2xl relative" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#0798AE] pointer-events-none" />
            <input
              type="text"
              placeholder="Search toys, feeding, baby care..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              className="w-full pl-11 pr-24 py-2.5 bg-[#D9F1F5] border-none rounded-full text-sm font-medium text-[#0798AE] placeholder-[#0798AE] outline-none focus:ring-2 focus:ring-[#0798AE]"
            />
            <button
              onClick={runSearch}
              className="absolute right-1.5 px-4 py-1.5 bg-[#0798AE] hover:bg-[#FFD52F] text-white text-xs font-bold rounded-full cursor-pointer"
            >
              Search
            </button>
          </div>

          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#D9F1F5] p-4 z-50 overflow-hidden">
              {searchQuery.trim().length > 1 ? (
                <div>
                  <div className="text-xs font-bold text-[#0798AE] uppercase tracking-wider mb-2">
                    {searchLoading ? 'Searching…' : `Results (${apiResults.length})`}
                  </div>
                  {apiResults.length > 0 ? (
                    <div className="space-y-2">
                      {apiResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSelectSearchResult(product)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FFFDF7] cursor-pointer"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#0798AE] truncate">{product.name}</h4>
                            <div className="text-[11px] text-[#0798AE]">
                              Rs. {product.price.toLocaleString()} · {product.categoryName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !searchLoading && (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No products found matching &quot;{searchQuery}&quot;
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400">Type at least 2 characters to search</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setWishlistOpen(true)}
            className="relative p-2.5 rounded-full hover:bg-[#D9F1F5] text-[#0798AE] cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D9F1F5] text-white text-[10px] font-extrabold flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {isCustomerAuthenticated ? (
            <button
              onClick={() => setAccountPanelOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-[#D9F1F5] text-[#0798AE] cursor-pointer"
              title="My account"
            >
              <User className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="p-2.5 rounded-full hover:bg-[#D9F1F5] text-[#0798AE] cursor-pointer"
              title="Sign in"
            >
              <User className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 rounded-full bg-[#0798AE] hover:bg-[#484833] text-white cursor-pointer"
            title="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {getCartCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#D9F1F5] text-white text-[10px] font-black flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className="border-t border-[#D9F1F5] bg-[#FFFDF7] relative hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center">
          <div className="flex items-center space-x-1 py-1 overflow-x-auto no-scrollbar">
            {navCategories.map((cat) => {
              const active = isNavActive(cat);
              return (
                <div
                  key={`${cat.kind}-${cat.slug}`}
                  onMouseEnter={() => setHoveredCategory(cat.slug)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="relative py-2.5 shrink-0"
                >
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      active
                        ? 'bg-[#FFD52F]/25 text-[#C47A1A] ring-1 ring-[#FFD52F]/50'
                        : hoveredCategory === cat.slug
                          ? 'bg-[#D9F1F5] text-[#FFD52F]'
                          : 'text-[#0798AE] hover:text-[#FFD52F] hover:bg-[#D9F1F5]'
                    }`}
                  >
                    {cat.kind === 'sale' && <Flame className="w-3 h-3 text-rose-500" />}
                    <span>{cat.name}</span>
                    {cat.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-black tracking-wider ${
                          cat.kind === 'sale'
                            ? 'bg-rose-500 text-white'
                            : cat.badge.toUpperCase().includes('HOT')
                              ? 'bg-[#D9F1F5] text-white'
                              : cat.badge.toUpperCase().includes('NEW')
                                ? 'bg-[#D9F1F5] text-[#0798AE]'
                                : 'bg-[#FFD52F] text-white'
                        }`}
                      >
                        {cat.badge}
                      </span>
                    )}
                  </button>

                  {hoveredCategory === cat.slug && cat.kind === 'category' && (
                    <div className="absolute top-full left-0 w-[420px] bg-white rounded-2xl shadow-xl border border-[#D9F1F5] p-4 z-50">
                      <h4 className="text-xs font-black text-[#0798AE] uppercase tracking-wider mb-2">
                        {cat.name}
                      </h4>
                      <div className="space-y-1">
                        {(categories.find((c) => c.slug === cat.slug)?.subcategories || []).map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => {
                              goToShop(router, {
                                categoryId: cat.slug,
                                categoryIds: [cat.slug],
                                searchQuery: sub,
                              });
                              setHoveredCategory(null);
                              setHoveredCategory(null);
                            }}
                            className="w-full text-left text-xs font-semibold text-[#0798AE] hover:text-[#FFD52F] py-1 cursor-pointer"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};
