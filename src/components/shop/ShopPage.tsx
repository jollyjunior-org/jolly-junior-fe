import React from 'react';
import { Filter, X, RotateCcw, Search, Sparkles } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { ProductCard } from '../product/ProductCard';

export const ShopPage: React.FC = () => {
  const { products, categories, filter, setFilter, resetFilter, setCurrentView } = useShopStore();

  // Enabled categories map
  const enabledCategories = categories.filter(c => c.isEnabled !== false);
  const disabledCategorySlugs = new Set(
    categories.filter(c => c.isEnabled === false).map(c => c.slug)
  );

  const activeCategory = enabledCategories.find(c => c.slug === filter.categoryId);

  // Filter logic
  let filteredProducts = products.filter((p) => {
    // Hide unpublished products
    if (p.isPublished === false) return false;

    // Hide products belonging to disabled categories
    if (disabledCategorySlugs.has(p.categoryId)) return false;

    // Category match
    if (filter.categoryId && p.categoryId !== filter.categoryId) return false;

    // Search query match
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(q);
      const catMatch = p.categoryName.toLowerCase().includes(q);
      const descMatch = p.description.toLowerCase().includes(q);
      if (!nameMatch && !catMatch && !descMatch) return false;
    }

    // Age group match
    if (filter.ageGroup && p.ageGroup !== filter.ageGroup) return false;

    // On sale match
    if (filter.onSaleOnly && !p.discountBadge && p.badge !== 'Flash Sale') return false;

    return true;
  });

  // Sorting logic
  if (filter.sortBy === 'price-low-high') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (filter.sortBy === 'price-high-low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (filter.sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  } else if (filter.sortBy === 'newest') {
    filteredProducts.sort((a, b) => (a.badge === 'New' ? -1 : 1));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Banner / Header */}
      <div className="bg-gradient-to-r from-[#FCE7F3] via-[#FFF7ED] to-[#E0E7FF] rounded-3xl p-6 sm:p-8 border border-[#F1F5F9] shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white text-[#EC4899] text-xs font-bold shadow-2xs mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Jolly Store Catalog</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
              {activeCategory ? activeCategory.name : 'All Products & Essentials'}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1">
              {activeCategory
                ? activeCategory.description
                : 'Browse our complete range of certified organic baby care, educational toys & mom essentials'}
            </p>
          </div>

          <div className="text-xs font-bold text-[#1E293B] bg-white px-4 py-2 rounded-full border border-[#E2E8F0] shadow-xs">
            Showing {filteredProducts.length} Products
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filter Controls */}
        <div className="space-y-6 bg-white p-5 rounded-3xl border border-[#F1F5F9] shadow-xs h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2 text-sm font-black text-[#1E293B]">
              <Filter className="w-4 h-4 text-[#EC4899]" />
              <span>Filter Catalog</span>
            </div>
            <button
              onClick={resetFilter}
              className="text-xs text-[#EC4899] hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Categories
            </label>
            <div className="space-y-1 max-h-56 overflow-y-auto no-scrollbar">
              <button
                onClick={() => setFilter({ categoryId: null })}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  filter.categoryId === null
                    ? 'bg-[#FEF3C7] text-[#D97706]'
                    : 'text-[#475569] hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {enabledCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter({ categoryId: cat.slug })}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-between transition-colors ${
                    filter.categoryId === cat.slug
                      ? 'bg-[#FEF3C7] text-[#D97706]'
                      : 'text-[#475569] hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-70">({cat.itemCount})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Age Group
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['0-6M', '6-12M', '1-3Y', '3-5Y', '5Y+'].map((age) => (
                <button
                  key={age}
                  onClick={() =>
                    setFilter({ ageGroup: filter.ageGroup === age ? null : age })
                  }
                  className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                    filter.ageGroup === age
                      ? 'bg-[#EC4899] text-white shadow-xs'
                      : 'bg-[#FFFDF8] hover:bg-[#FCE7F3] text-[#334155] border border-[#E2E8F0]'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* Special Toggle Filters */}
          <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-[#334155] cursor-pointer">
              <input
                type="checkbox"
                checked={filter.onSaleOnly}
                onChange={(e) => setFilter({ onSaleOnly: e.target.checked })}
                className="accent-[#EC4899] w-4 h-4 rounded-md"
              />
              <span>Discounted Deals Only</span>
            </label>
          </div>

          {/* Sort By Dropdown */}
          <div className="pt-2 border-t border-[#F1F5F9]">
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Sort By
            </label>
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ sortBy: e.target.value as any })}
              className="w-full p-2 bg-[#FFFDF8] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#1E293B] outline-none"
            >
              <option value="featured">Featured / Recommended</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">New Arrivals First</option>
            </select>
          </div>
        </div>

        {/* Right Main Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Filter Pills */}
          {(filter.categoryId || filter.searchQuery || filter.ageGroup || filter.onSaleOnly) && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-2xl border border-[#F1F5F9]">
              <span className="text-xs font-bold text-[#64748B]">Active Filters:</span>
              {filter.categoryId && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-bold">
                  Cat: {activeCategory?.name}
                  <X
                    className="w-3 h-3 cursor-pointer ml-1"
                    onClick={() => setFilter({ categoryId: null })}
                  />
                </span>
              )}
              {filter.ageGroup && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E0E7FF] text-[#3B82F6] text-xs font-bold">
                  Age: {filter.ageGroup}
                  <X
                    className="w-3 h-3 cursor-pointer ml-1"
                    onClick={() => setFilter({ ageGroup: null })}
                  />
                </span>
              )}
              {filter.searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FCE7F3] text-[#EC4899] text-xs font-bold">
                  "{filter.searchQuery}"
                  <X
                    className="w-3 h-3 cursor-pointer ml-1"
                    onClick={() => setFilter({ searchQuery: '' })}
                  />
                </span>
              )}
              {filter.onSaleOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FEE2E2] text-[#EF4444] text-xs font-bold">
                  On Sale
                  <X
                    className="w-3 h-3 cursor-pointer ml-1"
                    onClick={() => setFilter({ onSaleOnly: false })}
                  />
                </span>
              )}
            </div>
          )}

          {/* Product Cards Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-3xl p-8 border border-[#F1F5F9] space-y-3">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-extrabold text-[#1E293B]">
                No products found matching your search.
              </h3>
              <p className="text-xs text-slate-500">
                Try clearing active filters or searching for another keyword.
              </p>
              <button
                onClick={resetFilter}
                className="mt-2 px-5 py-2 bg-[#EC4899] text-white text-xs font-bold rounded-full shadow-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
