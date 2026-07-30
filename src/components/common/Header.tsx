import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Heart, ShoppingBag, User, Phone, Sparkles, 
  Flame, ChevronDown, MessageSquare, X, Filter,
  ArrowRight
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useShopStore } from '../../store/useShopStore';
import { Product } from '../../types';

export const Header: React.FC = () => {
  const { 
    products,
    categories,
    cart, 
    wishlist, 
    getCartCount, 
    getCartTotal,
    setCartOpen, 
    setWishlistOpen,
    setCurrentView,
    setFilter,
    setSelectedProductDetail,
    setQuickViewProduct
  } = useShopStore();

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Enabled categories map
  const disabledCategorySlugs = new Set(
    categories.filter(c => c.isEnabled === false).map(c => c.slug)
  );

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim().length > 1
    ? products.filter(p => 
        p.isPublished !== false &&
        !disabledCategorySlugs.has(p.categoryId) &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.ageGroup.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const baseNavCategories = [
    { name: 'Shop All', slug: 'all', badge: null },
    { name: 'New Arrivals', slug: 'new-arrivals', badge: 'NEW' },
    { name: 'Best Sellers', slug: 'best-sellers', badge: 'HOT' },
    { name: 'Educational Toys', slug: 'educational-toys', badge: null },
    { name: 'Baby Toys', slug: 'baby-toys', badge: null },
    { name: 'Feeding', slug: 'feeding', badge: null },
    { name: 'Bath Care', slug: 'bath-care', badge: null },
    { name: 'Newborn Essentials', slug: 'newborn-essentials', badge: null },
    { name: 'Mom Essentials', slug: 'mom-essentials', badge: null },
    { name: 'Outdoor Toys', slug: 'outdoor-toys', badge: null },
    { name: 'Gift Sets', slug: 'gift-sets', badge: null },
    { name: 'Sale', slug: 'sale', badge: 'UP TO 30%' }
  ];

  const navCategories = baseNavCategories.filter(cat => {
    if (['all', 'new-arrivals', 'best-sellers', 'sale'].includes(cat.slug)) return true;
    return !disabledCategorySlugs.has(cat.slug);
  });

  const handleCategoryClick = (slug: string) => {
    setCurrentView('shop');
    if (slug === 'all') {
      setFilter({ categoryId: null, searchQuery: '' });
    } else if (slug === 'new-arrivals') {
      setFilter({ categoryId: null, sortBy: 'newest' });
    } else if (slug === 'best-sellers') {
      setFilter({ categoryId: null, sortBy: 'rating' });
    } else if (slug === 'sale') {
      setFilter({ categoryId: null, onSaleOnly: true });
    } else {
      setFilter({ categoryId: slug, searchQuery: '' });
    }
    setHoveredCategory(null);
  };

  const handleSelectSearchResult = (product: Product) => {
    setSelectedProductDetail(product);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-[#F5F2ED]">
      {/* Top Bar */}
      <div className="bg-[#A0D2EB] text-white text-xs py-2 px-4 font-medium border-b border-[#F5F2ED]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-bold">
              🚚 Free Delivery on orders over Rs. 3,000
            </span>
            <span className="hidden md:inline opacity-60">|</span>
            <span className="hidden md:inline-flex items-center gap-1 opacity-90">
              ⚡ Same Day Dispatch in Major Cities
            </span>
          </div>

          <div className="flex items-center gap-5 text-[11px] sm:text-xs font-semibold">
            <a 
              href="https://wa.me/923001234567?text=Hi%20JollyJuniors!%20I%20have%20a%20question%20about%20your%20products." 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-white hover:underline transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Support (+92 300 1234567)
            </a>
            <button 
              onClick={() => handleCategoryClick('sale')}
              className="inline-flex items-center gap-1 font-bold text-white hover:underline cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 fill-[#FFB347] text-white" />
              Daily Deals
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <div onClick={() => setCurrentView('home')}>
          <BrandLogo size="md" />
        </div>

        {/* Large Search Bar */}
        <div className="hidden md:block flex-1 max-w-2xl relative" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#8C8C70] pointer-events-none" />
            <input
              type="text"
              placeholder="Search magical toys, feeding, and baby care..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-11 pr-24 py-2.5 bg-[#F5F2ED] border-none rounded-full text-sm font-medium text-[#5A5A40] placeholder-[#8C8C70] outline-none focus:ring-2 focus:ring-[#A0D2EB] transition-all duration-200"
            />
            <button 
              onClick={() => {
                if (searchQuery.trim()) {
                  setFilter({ searchQuery });
                  setCurrentView('shop');
                }
              }}
              className="absolute right-1.5 px-4 py-1.5 bg-[#5A5A40] hover:bg-[#FFB347] text-white text-xs font-bold rounded-full shadow-xs transition-all cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Search Dropdown Modal */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#F5F2ED] p-4 z-50 overflow-hidden">
              {searchQuery.trim().length > 1 ? (
                <div>
                  <div className="text-xs font-bold text-[#8C8C70] uppercase tracking-wider mb-2">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSelectSearchResult(product)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FFFDF8] cursor-pointer transition-colors"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#5A5A40] truncate">
                              {product.name}
                            </h4>
                            <div className="text-[11px] text-[#8C8C70] flex items-center gap-2">
                              <span className="font-bold text-[#FFB347]">Rs. {product.price.toLocaleString()}</span>
                              <span>•</span>
                              <span className="text-[#5A5A40] font-medium">{product.categoryName}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No products found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-xs font-bold text-[#8C8C70] uppercase tracking-wider mb-2">
                    Popular Searches
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Montessori Wooden Tower', 'Silicone Feeding Set', 'Organic Swaddle', 'Diaper Backpack', 'Teether Keys', 'Balance Bike'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                          setFilter({ searchQuery: tag });
                          setCurrentView('shop');
                          setIsSearchFocused(false);
                        }}
                        className="px-3 py-1 bg-[#F5F2ED] hover:bg-[#FFB347]/20 border border-[#F5F2ED] rounded-full text-xs font-medium text-[#5A5A40] cursor-pointer transition-colors"
                      >
                        🔍 {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          {/* Wishlist Icon */}
          <button
            onClick={() => setWishlistOpen(true)}
            className="relative p-2.5 rounded-full hover:bg-[#F5F2ED] text-[#5A5A40] transition-colors cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FFB7CE] text-white text-[10px] font-extrabold flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Account Icon */}
          <button
            onClick={() => useShopStore.getState().showToast("Welcome to JollyJuniors! Signed in as Parent ⭐")}
            className="hidden sm:flex p-2.5 rounded-full hover:bg-[#F5F2ED] text-[#5A5A40] transition-colors cursor-pointer"
            title="Account"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Direct WhatsApp Order Pill */}
          <a
            href="https://wa.me/923001234567?text=Hi%20JollyJuniors!%20I%20would%20like%20to%20order%20directly%20via%20WhatsApp."
            target="_blank"
            rel="noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#B4F8C8] text-[#2E6038] hover:bg-[#A0E8B8] rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>WhatsApp Order</span>
          </a>

          {/* Cart Icon */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 pl-3 pr-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-full shadow-md transition-all cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#FFB7CE] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {getCartCount()}
                </span>
              )}
            </div>
            <span className="font-extrabold text-xs">
              Rs. {getCartTotal().toLocaleString()}
            </span>
          </button>
        </div>
      </div>

      {/* Main Navigation with Hover Mega Menu */}
      <nav className="border-t border-[#F5F2ED] bg-[#FFFDF8] relative hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1 py-1">
            {navCategories.map((cat) => (
              <div
                key={cat.slug}
                onMouseEnter={() => setHoveredCategory(cat.slug)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="relative py-2.5"
              >
                <button
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    hoveredCategory === cat.slug
                      ? 'bg-[#F5F2ED] text-[#FFB347]'
                      : 'text-[#5A5A40] hover:text-[#FFB347] hover:bg-[#F5F2ED]'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black tracking-wider ${
                      cat.badge === 'HOT' ? 'bg-[#FFB7CE] text-white' :
                      cat.badge === 'NEW' ? 'bg-[#B4F8C8] text-[#2E6038]' :
                      'bg-[#FFB347] text-white'
                    }`}>
                      {cat.badge}
                    </span>
                  )}
                </button>

                {/* Mega Menu Dropdown */}
                {hoveredCategory === cat.slug && cat.slug !== 'all' && (
                  <div className="absolute top-full left-0 w-[580px] bg-white rounded-2xl shadow-xl border border-[#F5F2ED] p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Subcategories list */}
                      <div>
                        <h4 className="text-xs font-black text-[#8C8C70] uppercase tracking-wider mb-3">
                          {cat.name} Collections
                        </h4>
                        <div className="space-y-2">
                          {categories.find(c => c.slug === cat.slug)?.subcategories.map(sub => (
                            <div
                              key={sub}
                              onClick={() => {
                                setFilter({ categoryId: cat.slug, searchQuery: sub });
                                setCurrentView('shop');
                                setHoveredCategory(null);
                              }}
                              className="text-xs font-semibold text-[#5A5A40] hover:text-[#FFB347] flex items-center justify-between py-1 cursor-pointer group/sub"
                            >
                              <span>{sub}</span>
                              <ArrowRight className="w-3 h-3 text-[#CBD5E1] group-hover/sub:text-[#FFB347] group-hover/sub:translate-x-1 transition-all" />
                            </div>
                          )) || (
                            <div className="text-xs text-slate-500 space-y-1.5">
                              <p className="hover:text-[#FFB347] cursor-pointer" onClick={() => handleCategoryClick(cat.slug)}>• Top Rated Products</p>
                              <p className="hover:text-[#FFB347] cursor-pointer" onClick={() => handleCategoryClick(cat.slug)}>• Age Wise Curated Selection</p>
                              <p className="hover:text-[#FFB347] cursor-pointer" onClick={() => handleCategoryClick(cat.slug)}>• Express Shipping Bundles</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Featured image preview card */}
                      <div className="bg-[#FFFDF8] rounded-xl p-3 border border-[#F5F2ED] flex flex-col justify-between">
                        <div>
                          <div className="relative rounded-lg overflow-hidden h-32 mb-2">
                            <img
                              src={categories.find(c => c.slug === cat.slug)?.image || products[0]?.images[0]}
                              alt={cat.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-[10px] font-black px-2 py-0.5 rounded-full text-[#5A5A40]">
                              Featured Collection
                            </div>
                          </div>
                          <h5 className="text-xs font-bold text-[#5A5A40]">
                            {cat.name} Essentials
                          </h5>
                          <p className="text-[11px] text-[#8C8C70] line-clamp-2 mt-0.5">
                            {categories.find(c => c.slug === cat.slug)?.description || "Discover premium quality baby products."}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCategoryClick(cat.slug)}
                          className="mt-3 w-full py-1.5 bg-[#F5F2ED] hover:bg-[#FFB347]/20 text-[#5A5A40] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Explore Category →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};
