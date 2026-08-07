import React, { useState, useEffect, useMemo } from 'react';
import { Filter, X, RotateCcw, Search, Sparkles, ChevronDown } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { ProductCard } from '../product/ProductCard';

/**
 * Shop catalog — loads products from store APIs by category / search / sale.
 */
export const ShopPage: React.FC = () => {
  const {
    shopProducts,
    shopLoading,
    products,
    categories,
    filter,
    setFilter,
    resetFilter,
    liveSales,
    fetchShopCatalog,
  } = useShopStore();

  // Load / reload catalog whenever shop filters change
  useEffect(() => {
    void fetchShopCatalog();
  }, [
    fetchShopCatalog,
    filter.categoryId,
    filter.categoryIds.join(','),
    filter.saleKey,
    filter.searchQuery,
    filter.sortBy,
    filter.inStockOnly,
    filter.onSaleOnly,
    filter.ageGroup,
  ]);

  const enabledCategories = categories.filter((c) => c.isEnabled !== false);

  const activeSale = liveSales.find((s) => s.key === filter.saleKey);
  const selectedSlugs = useMemo(() => {
    const set = new Set(filter.categoryIds || []);
    if (filter.categoryId) set.add(filter.categoryId);
    return set;
  }, [filter.categoryId, filter.categoryIds]);

  const activeCategory = enabledCategories.find((c) => c.slug === filter.categoryId);

  /** Toggle a category slug in the multi-select filter (reloads via useEffect). */
  const toggleCategory = (slug: string) => {
    const current = new Set(filter.categoryIds || []);
    if (current.has(slug)) current.delete(slug);
    else current.add(slug);
    const next = Array.from(current);
    setFilter({
      categoryIds: next,
      categoryId: next.length === 1 ? next[0] : next.includes(filter.categoryId || '') ? filter.categoryId : null,
    });
  };

  // Prefer API-loaded shop catalog; fall back to in-memory products while loading first time
  let filteredProducts = (shopProducts.length || shopLoading ? shopProducts : products).slice();

  if (filter.sortBy === 'price-low-high') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (filter.sortBy === 'price-high-low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (filter.sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  } else if (filter.sortBy === 'newest') {
    filteredProducts.sort((a, b) => (a.badge === 'New' ? -1 : 1));
  }

  const title = filter.saleKey
    ? activeSale?.title || 'Sale'
    : activeCategory
      ? activeCategory.name
      : selectedSlugs.size > 1
        ? `${selectedSlugs.size} Categories`
        : filter.searchQuery
          ? `Search: ${filter.searchQuery}`
          : 'All Products & Essentials';

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      <div className="bg-gradient-to-r from-[#E8F0E4] via-[#F0F7EC] to-[#DDE8DC] rounded-xl p-6 sm:p-8 border border-[#F1F5F9] shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white text-[#3D6B4F] text-xs font-bold shadow-2xs mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{filter.saleKey ? 'Sale Campaign' : 'Jolly Store Catalog'}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">{title}</h1>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1">
              {activeCategory?.description ||
                'Browse our complete range of certified organic baby care, educational toys & mom essentials'}
            </p>
          </div>
          <div className="text-xs font-bold text-[#1E293B] bg-white px-4 py-2 rounded-full border border-[#E2E8F0] shadow-xs">
            {shopLoading ? 'Loading…' : `Showing ${filteredProducts.length} Products`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6 bg-white p-5 rounded-xl border border-[#F1F5F9] shadow-xs h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="flex items-center gap-2 text-sm font-black text-[#1E293B] lg:cursor-default w-full sm:w-auto justify-between sm:justify-start"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#3D6B4F]" />
                <span>Filter Catalog</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#64748B] lg:hidden transition-transform duration-200 ${
                  isMobileFilterOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <button
              onClick={resetFilter}
              className="text-xs text-[#3D6B4F] hover:underline flex items-center gap-1 font-bold cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className={`${isMobileFilterOpen ? 'block' : 'hidden'} lg:block space-y-6`}>
          {/* Live sales */}
          {liveSales.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                Active Sales
              </label>
              <div className="space-y-1">
                {liveSales.map((sale) => (
                  <button
                    key={sale.id}
                    type="button"
                    onClick={() =>
                      setFilter({
                        saleKey: filter.saleKey === sale.key ? null : sale.key,
                        onSaleOnly: false,
                      })
                    }
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                      filter.saleKey === sale.key
                        ? 'bg-[#DDE8DC] text-[#1C2B1E]'
                        : 'text-[#475569] hover:bg-slate-50'
                    }`}
                  >
                    🔥 {sale.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories as checkboxes */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Categories
            </label>
            <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
              <label className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSlugs.size === 0}
                  onChange={() => setFilter({ categoryId: null, categoryIds: [] })}
                  className="accent-[#3D6B4F] w-4 h-4 rounded"
                />
                <span>All Categories</span>
              </label>
              {enabledCategories.map((cat) => {
                const checked = selectedSlugs.has(cat.slug);
                return (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-[#475569] cursor-pointer hover:bg-slate-50 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(cat.slug)}
                      className="accent-[#3D6B4F] w-4 h-4 rounded"
                    />
                    <span className="flex-1">{cat.name}</span>
                    <span className="text-[10px] opacity-70">({cat.itemCount})</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Age Group
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['0-6M', '6-12M', '1-3Y', '3-5Y', '5Y+'].map((age) => (
                <button
                  key={age}
                  onClick={() => setFilter({ ageGroup: filter.ageGroup === age ? null : age })}
                  className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                    filter.ageGroup === age
                      ? 'bg-[#3D6B4F] text-white shadow-xs'
                      : 'bg-[#F8FBF6] hover:bg-[#E8F0E4] text-[#334155] border border-[#E2E8F0]'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-[#334155] cursor-pointer">
              <input
                type="checkbox"
                checked={filter.onSaleOnly}
                onChange={(e) => setFilter({ onSaleOnly: e.target.checked })}
                className="accent-[#3D6B4F] w-4 h-4 rounded-md"
              />
              <span>Discounted Deals Only</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-[#334155] cursor-pointer">
              <input
                type="checkbox"
                checked={filter.inStockOnly}
                onChange={(e) => setFilter({ inStockOnly: e.target.checked })}
                className="accent-[#3D6B4F] w-4 h-4 rounded-md"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          <div className="pt-2 border-t border-[#F1F5F9]">
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Sort By
            </label>
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ sortBy: e.target.value as typeof filter.sortBy })}
              className="w-full p-2 bg-[#F8FBF6] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#1E293B] outline-none"
            >
              <option value="featured">Featured / Recommended</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">New Arrivals First</option>
            </select>
          </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {(filter.categoryId ||
            filter.categoryIds.length > 0 ||
            filter.searchQuery ||
            filter.ageGroup ||
            filter.onSaleOnly ||
            filter.saleKey) && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-lg border border-[#F1F5F9]">
              <span className="text-xs font-bold text-[#64748B]">Active Filters:</span>
              {filter.saleKey && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#DDE8DC] text-[#1C2B1E] text-xs font-bold">
                  Sale: {activeSale?.title || filter.saleKey}
                  <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => setFilter({ saleKey: null })} />
                </span>
              )}
              {[...selectedSlugs].map((slug) => (
                <span
                  key={slug}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EEF5E8] text-[#4A7A58] text-xs font-bold"
                >
                  {enabledCategories.find((c) => c.slug === slug)?.name || slug}
                  <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => toggleCategory(slug)} />
                </span>
              ))}
              {filter.ageGroup && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#DDE8DC] text-[#3B82F6] text-xs font-bold">
                  Age: {filter.ageGroup}
                  <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => setFilter({ ageGroup: null })} />
                </span>
              )}
              {filter.searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E8F0E4] text-[#3D6B4F] text-xs font-bold">
                  &quot;{filter.searchQuery}&quot;
                  <X
                    className="w-3 h-3 cursor-pointer ml-1"
                    onClick={() => setFilter({ searchQuery: '' })}
                  />
                </span>
              )}
            </div>
          )}

          {shopLoading && filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl p-8 border border-[#F1F5F9]">
              <p className="text-sm font-bold text-[#64748B]">Loading products…</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-xl p-8 border border-[#F1F5F9] space-y-3">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-extrabold text-[#1E293B]">
                No products found matching your search.
              </h3>
              <p className="text-xs text-slate-500">
                Try clearing active filters or searching for another keyword.
              </p>
              <button
                onClick={resetFilter}
                className="mt-2 px-4 py-2 bg-[#3D6B4F] text-white text-xs font-bold rounded-full cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
