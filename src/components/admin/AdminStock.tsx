import React, { useEffect, useState } from 'react';
import { 
  Boxes, Search, AlertTriangle, CheckCircle2, XCircle, 
  Plus, Minus, RefreshCw, Layers, ArrowUpDown, ShieldAlert, DollarSign, PackagePlus, FileText
} from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { ReloadButton } from './ReloadButton';

export const AdminStock: React.FC = () => {
  const { products, categories, inventoryStats, adjustStock, setStockQuantity, batchRestock, updateProduct, fetchInventoryStats, fetchAdminProducts } = useShopStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'healthy' | 'low' | 'out'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingStockMap, setEditingStockMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchInventoryStats();
  }, [fetchInventoryStats]);

  // Calculations
  const totalProducts = products.length;
  const totalStockUnits = inventoryStats.totalStockUnits || products.reduce((acc, p) => acc + (p.stockQuantity ?? 0), 0);
  const lowStockProducts = products.filter(p => (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= (p.lowStockThreshold || 5));
  const outOfStockProducts = products.filter(p => !p.inStock || (p.stockQuantity ?? 0) <= 0);
  const totalValuation = inventoryStats.totalRetailValue || products.reduce((acc, p) => acc + (p.price * (p.stockQuantity ?? 0)), 0);

  // Filtered Products
  const filteredProducts = products.filter(p => {
    // Search
    if (searchQuery.trim() && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
      return false;
    }

    // Stock Status Filter
    const qty = p.stockQuantity ?? 0;
    const isOut = !p.inStock || qty <= 0;
    const isLow = !isOut && qty <= (p.lowStockThreshold || 5);

    if (stockFilter === 'out' && !isOut) return false;
    if (stockFilter === 'low' && !isLow) return false;
    if (stockFilter === 'healthy' && (isOut || isLow)) return false;

    return true;
  });

  const handleRestockAllLow = () => {
    const lowIds = lowStockProducts.map(p => p.id);
    if (lowIds.length === 0) return;
    batchRestock(lowIds, 10);
  };

  const handleRestockAllOut = () => {
    const outIds = outOfStockProducts.map(p => p.id);
    if (outIds.length === 0) return;
    batchRestock(outIds, 15);
  };

  const handleStockInputChange = (id: string, val: string) => {
    setEditingStockMap(prev => ({ ...prev, [id]: val }));
  };

  const handleStockInputBlur = (id: string, currentQty: number) => {
    const raw = editingStockMap[id];
    if (raw === undefined) return;
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setStockQuantity(id, parsed);
    }
    // Clear editing state for this item
    setEditingStockMap(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Live Stock & Inventory Audit</h2>
            <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[11px] font-bold rounded-full">
              Real-time Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit inventory levels, set safety thresholds, and manage live product availability across store front.
          </p>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <ReloadButton
            onReload={async () => {
              await Promise.all([fetchAdminProducts(), fetchInventoryStats()]);
            }}
            label="Reload Stock"
          />
          <button
            className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <PackagePlus className="w-3.5 h-3.5 text-sky-600" />
            <span>Receive Stock</span>
          </button>

          <button
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Inventory History</span>
          </button>
          {lowStockProducts.length > 0 && (
            <button
              onClick={handleRestockAllLow}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>Restock Low Stock (+10)</span>
            </button>
          )}

          {outOfStockProducts.length > 0 && (
            <button
              onClick={handleRestockAllOut}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reactivate Out of Stock (+15)</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Total Units */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Stock Units</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalStockUnits.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across {totalProducts} products</p>
        </div>

        {/* Card 2: Low Stock Warning */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600">Low Stock Alert (&le;5)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {lowStockProducts.length}
          </div>
          <p className="text-[11px] text-amber-500 mt-0.5">Needs restock soon</p>
        </div>

        {/* Card 3: Out of Stock */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600">Out of Stock</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">
            {outOfStockProducts.length}
          </div>
          <p className="text-[11px] text-rose-500 mt-0.5">Disabled on store</p>
        </div>

        {/* Card 4: Inventory Valuation */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600">Stock Valuation</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            Rs. {totalValuation.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 mt-0.5">Total retail value</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search product name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-sky-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-sky-500"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Stock Status Filter */}
        <div>
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as any)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-sky-500"
          >
            <option value="all">All Inventory Levels</option>
            <option value="healthy">Healthy Stock (&gt;5 units)</option>
            <option value="low">Low Stock Alert (&le;5 units)</option>
            <option value="out">Out of Stock (0 units)</option>
          </select>
        </div>
      </div>

      {/* Inventory Management Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Available Goods</div>
          <div className="text-xl font-black text-slate-900 mt-1">{products.filter(p => p.inStock && (p.stockQuantity ?? 0) > 0).length} products</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Needs Attention</div>
          <div className="text-xl font-black text-slate-900 mt-1">{lowStockProducts.length + outOfStockProducts.length} items</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Warehouse Status</div>
          <div className="text-xl font-black text-slate-900 mt-1">Ready for dispatch</div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Unit Price</th>
                <th className="p-3.5">Stock Level & Status</th>
                <th className="p-3.5 text-center">Quick Adjust</th>
                <th className="p-3.5 text-right">Store Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                    No products matched your inventory filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const qty = p.stockQuantity ?? 0;
                  const isOut = !p.inStock || qty <= 0;
                  const isLow = !isOut && qty <= (p.lowStockThreshold || 5);
                  const maxDisplayQty = 30;
                  const stockPercent = Math.min(100, Math.round((qty / maxDisplayQty) * 100));

                  const inputValue = editingStockMap[p.id] !== undefined 
                    ? editingStockMap[p.id] 
                    : qty.toString();

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      {/* Thumbnail & Title */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1 max-w-xs">{p.name}</div>
                            <div className="text-[10px] text-slate-400">ID: {p.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                          {p.categoryName}
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="p-3.5 font-bold text-slate-900">
                        Rs. {p.price.toLocaleString()}
                      </td>

                      {/* Stock Level Progress Bar & Badge */}
                      <td className="p-3.5">
                        <div className="space-y-1.5 min-w-[140px]">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className={isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-600'}>
                              {isOut ? '0 Units Left' : `${qty} in stock`}
                            </span>
                            {isOut ? (
                              <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[9px] font-black rounded">OUT</span>
                            ) : isLow ? (
                              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-black rounded">LOW</span>
                            ) : (
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded">OK</span>
                            )}
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${isOut ? 5 : Math.max(10, stockPercent)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Quick Adjust Buttons & Numeric Input */}
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => adjustStock(p.id, -10)}
                            className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold rounded cursor-pointer border border-slate-200"
                            title="-10 Stock"
                          >
                            -10
                          </button>
                          <button
                            onClick={() => adjustStock(p.id, -1)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer border border-slate-200"
                            title="-1 Stock"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          {/* Editable quantity input */}
                          <input
                            type="number"
                            min="0"
                            value={inputValue}
                            onChange={e => handleStockInputChange(p.id, e.target.value)}
                            onBlur={() => handleStockInputBlur(p.id, qty)}
                            className="w-14 py-1 text-center font-bold bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-500 focus:bg-white"
                          />

                          <button
                            onClick={() => adjustStock(p.id, 1)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer border border-slate-200"
                            title="+1 Stock"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => adjustStock(p.id, 10)}
                            className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold rounded cursor-pointer border border-slate-200"
                            title="+10 Stock"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      {/* Storefront Override Toggle */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => updateProduct(p.id, { inStock: !p.inStock })}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer border inline-flex items-center gap-1 ${
                            p.inStock && qty > 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                          title="Click to toggle availability on storefront"
                        >
                          {p.inStock && qty > 0 ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>In Stock</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
