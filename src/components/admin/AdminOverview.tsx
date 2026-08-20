import React from 'react';
import { 
  DollarSign, ShoppingBag, Layers, Users, AlertTriangle, 
  ArrowUpRight, Plus, PackageCheck, Truck, Clock
} from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { ReloadButton } from './ReloadButton';

interface AdminOverviewProps {
  onNavigateTab: (tab: 'products' | 'categories' | 'orders' | 'users' | 'stock' | 'inventory') => void;
  onOpenAddProduct: () => void;
  onOpenAddCategory: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  onNavigateTab,
  onOpenAddProduct,
  onOpenAddCategory
}) => {
  const { products, categories, orders, users, fetchAdminProducts, fetchAdminCategories, fetchAdminOrders, fetchAdminUsers } = useShopStore();

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const outOfStockProducts = products.filter(p => !p.inStock || (p.stockQuantity ?? 0) <= 0);
  const lowStockProducts = products.filter(p => (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= (p.lowStockThreshold || 5));

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Quick Actions */}
      <div className="bg-[#1E293B] text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-[#334155]">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#0EA5E9] text-white text-[10px] font-bold uppercase tracking-wider mb-1">
            Admin Control Center
          </span>
          <h2 className="text-xl font-bold text-white">Store Overview & Live Analytics</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time management for JollyJuniors client app catalog, orders, and customer base.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ReloadButton
            onReload={async () => {
              await Promise.all([
                fetchAdminProducts(),
                fetchAdminCategories(),
                fetchAdminOrders(),
                fetchAdminUsers(),
              ]);
            }}
            label="Reload Overview"
          />
          <button
            onClick={onOpenAddProduct}
            className="px-3.5 py-2 rounded-lg bg-[#38BDF8] hover:bg-[#0284C7] text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          <button
            onClick={onOpenAddCategory}
            className="px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            Rs. {totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>From {orders.length} placed orders</span>
          </div>
        </div>

        {/* Total Orders */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs cursor-pointer hover:border-slate-400"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {orders.length}
          </div>
          <div className="text-[11px] text-amber-600 font-bold mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingOrders} Pending fulfillment</span>
          </div>
        </div>

        {/* Total Products */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs cursor-pointer hover:border-slate-400"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Products</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {products.length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Across {categories.length} active categories
          </div>
        </div>

        {/* Inventory Health */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs cursor-pointer hover:border-slate-400"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Inventory Health</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {lowStockProducts.length + outOfStockProducts.length}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            {lowStockProducts.length} low stock / {outOfStockProducts.length} out of stock
          </div>
        </div>

        {/* Total Registered Users */}
        <div 
          onClick={() => onNavigateTab('users')}
          className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs cursor-pointer hover:border-slate-400"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Customers</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {users.length}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">
            {users.filter(u => u.status === 'Active').length} Active accounts
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner if applicable */}
      {outOfStockProducts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Inventory Notice:</strong> {outOfStockProducts.length} product(s) marked out of stock.
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold cursor-pointer"
          >
            Manage Inventory
          </button>
        </div>
      )}

      {/* Two Column Section: Recent Orders & Category Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-500" />
              <span>Recent Client Orders</span>
            </h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
            >
              View All Orders ({orders.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-2.5">Order ID</th>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Items</th>
                  <th className="p-2.5">Total</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {orders.slice(0, 5).map((order) => {
                  const statusColors: Record<string, string> = {
                    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
                    Processing: 'bg-blue-100 text-blue-800 border-blue-200',
                    Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
                    Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    Cancelled: 'bg-rose-100 text-rose-800 border-rose-200'
                  };

                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{order.id}</td>
                      <td className="p-2.5">
                        <div className="font-semibold text-slate-800">{order.customerName}</div>
                        <div className="text-[10px] text-slate-400">{order.city}</div>
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} pcs
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">
                        Rs. {order.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${statusColors[order.status] || 'bg-slate-100'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500 text-[11px]">{order.createdAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Active Categories</span>
            </h3>
            <button
              onClick={() => onNavigateTab('categories')}
              className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const catProductCount = products.filter(p => p.categoryId === cat.slug).length;
              return (
                <div key={cat.id} className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    {cat.image ? (
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-8 h-8 rounded-md object-cover border border-slate-200" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-slate-200 border border-slate-200" />
                    )}
                    <div>
                      <div className="font-bold text-slate-800">{cat.name}</div>
                      <div className="text-[10px] text-slate-500">{(cat.subcategories || []).length} Subcategories</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded font-bold text-slate-700 text-[11px]">
                    {catProductCount} Items
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
