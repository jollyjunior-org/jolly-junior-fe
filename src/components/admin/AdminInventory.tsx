import React, { useEffect, useMemo, useState } from 'react';
import { Boxes, Layers, Search, AlertTriangle, PackageCheck, TrendingUp } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { Product } from '../../types';

export const AdminInventory: React.FC = () => {
  const { products, categories, inventoryStats, fetchInventoryStats } = useShopStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInventoryStats();
  }, [fetchInventoryStats]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
      const matchesSearch = !q || product.name.toLowerCase().includes(q) || product.categoryName.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const categorySummaries = useMemo(() => {
    const summaries = categories.map((category) => {
      const categoryProducts = products.filter((product) => product.categoryId === category.id);
      const totalStock = categoryProducts.reduce((sum, product) => sum + (product.stockQuantity ?? 0), 0);
      const lowStockCount = categoryProducts.filter((product) => (product.stockQuantity ?? 0) > 0 && (product.stockQuantity ?? 0) <= (product.lowStockThreshold || 5)).length;
      const outOfStockCount = categoryProducts.filter((product) => !product.inStock || (product.stockQuantity ?? 0) <= 0).length;

      return {
        id: category.id,
        name: category.name,
        productCount: categoryProducts.length,
        totalStock,
        lowStockCount,
        outOfStockCount,
        products: categoryProducts,
      };
    });

    return summaries.filter((summary) => summary.productCount > 0);
  }, [categories, products]);

  const visibleSummaries = selectedCategory === 'all'
    ? categorySummaries
    : categorySummaries.filter((summary) => summary.id === selectedCategory);

  const totalStockUnits = filteredProducts.reduce((sum, product) => sum + (product.stockQuantity ?? 0), 0);
  const lowStockCount = filteredProducts.filter((product) => (product.stockQuantity ?? 0) > 0 && (product.stockQuantity ?? 0) <= (product.lowStockThreshold || 5)).length;
  const outOfStockCount = filteredProducts.filter((product) => !product.inStock || (product.stockQuantity ?? 0) <= 0).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">Inventory Overview</h2>
              <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold uppercase tracking-wider">
                Category + Product view
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Filter by category or view all products to monitor stock health and product distribution at a glance.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Units</div>
              <div className="text-lg font-black text-slate-900">{inventoryStats.totalStockUnits.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Low Stock</div>
              <div className="text-lg font-black text-amber-700">{inventoryStats.lowStockAlert}</div>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Out of Stock</div>
              <div className="text-lg font-black text-rose-700">{outOfStockCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search product or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-sky-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {visibleSummaries.map((summary) => (
          <div key={summary.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-black text-slate-900">{summary.name}</h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {summary.productCount} product{summary.productCount === 1 ? '' : 's'} • {summary.totalStock} units in stock
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-2.5 py-2 text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category Stock</div>
                <div className="text-base font-black text-slate-900">{summary.totalStock}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Healthy</div>
                <div className="text-sm font-black text-emerald-900">{summary.productCount - summary.lowStockCount - summary.outOfStockCount}</div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Low Stock</div>
                <div className="text-sm font-black text-amber-900">{summary.lowStockCount}</div>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Out of Stock</div>
                <div className="text-sm font-black text-rose-900">{summary.outOfStockCount}</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {summary.products.slice(0, 4).map((product) => {
                const qty = product.stockQuantity ?? 0;
                const isLow = qty > 0 && qty <= (product.lowStockThreshold || 5);
                const isOut = !product.inStock || qty <= 0;

                return (
                  <div key={product.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{product.name}</div>
                      <div className="text-[10px] text-slate-500">{product.categoryName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900">{qty} units</div>
                      <div className={`text-[10px] font-bold ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {isOut ? 'Out of stock' : isLow ? 'Low stock' : 'Healthy'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900">Product Inventory Detail</h3>
            <p className="text-[11px] text-slate-500">Current stock and availability for the selected view.</p>
          </div>
          <div className="rounded-lg bg-sky-50 text-sky-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
            {filteredProducts.length} items
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Base Price</th>
                <th className="p-3">Selling Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const qty = product.stockQuantity ?? 0;
                const isLow = qty > 0 && qty <= (product.lowStockThreshold || 5);
                const isOut = !product.inStock || qty <= 0;

                return (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{product.name}</div>
                      <div className="text-[10px] text-slate-500">{product.slug}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {product.categoryName}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">Rs. {(product.basePrice ?? 0).toLocaleString()}</td>
                    <td className="p-3 font-semibold text-slate-700">Rs. {product.price.toLocaleString()}</td>
                    <td className="p-3 font-black text-slate-900">{qty}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${isOut ? 'bg-rose-100 text-rose-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isOut ? 'Out of stock' : isLow ? 'Low stock' : 'Healthy'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
