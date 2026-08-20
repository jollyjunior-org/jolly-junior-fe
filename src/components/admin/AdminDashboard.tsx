import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Layers, ShoppingBag, 
  Users, Store, ShieldCheck, ChevronRight, LogOut, Boxes, Settings, SlidersHorizontal, Tag, RotateCcw
} from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { AdminLogin } from './AdminLogin';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminOrders } from './AdminOrders';
import { AdminUsers } from './AdminUsers';
import { AdminStock } from './AdminStock';
import { AdminInventory } from './AdminInventory';
import { AdminSettings } from './AdminSettings';
import { AdminControl } from './AdminControl';
import { AdminReturns } from './AdminReturns';

export const AdminDashboard: React.FC = () => {
  const { 
    setCurrentView, 
    products, 
    categories, 
    orders, 
    users, 
    isAdminAuthenticated, 
    logoutAdmin,
    fetchAdminData,
    fetchAdminProducts,
    fetchInventoryStats,
    fetchAdminCategories,
    fetchAdminOrders,
    fetchAdminUsers,
    isLoadingAdminData
  } = useShopStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'stock' | 'inventory' | 'categories' | 'control' | 'orders' | 'returns' | 'users' | 'settings'>('overview');
  const [openAddProductModal, setOpenAddProductModal] = useState(false);
  const [openAddCategoryModal, setOpenAddCategoryModal] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAdminAuthenticated) return;
    if (loadedTabs[activeTab]) return; // Skip if tab data is already loaded

    const markLoaded = () => {
      setLoadedTabs((prev) => ({ ...prev, [activeTab]: true }));
    };

    switch (activeTab) {
      case 'overview':
        Promise.all([
          fetchAdminProducts(),
          fetchAdminCategories(),
          fetchAdminOrders(),
          fetchAdminUsers(),
        ]).then(markLoaded);
        break;
      case 'products':
      case 'stock':
      case 'inventory':
        Promise.all([fetchAdminProducts(), fetchInventoryStats()]).then(markLoaded);
        break;
      case 'categories':
      case 'control':
        fetchAdminCategories().then(markLoaded);
        break;
      case 'orders':
      case 'returns':
        fetchAdminOrders().then(markLoaded);
        break;
      case 'users':
        fetchAdminUsers().then(markLoaded);
        break;
      case 'settings':
        markLoaded();
        break;
    }
  }, [isAdminAuthenticated, activeTab, loadedTabs]);

  // If not authenticated, present Admin Login Screen
  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const lowStockCount = products.filter(p => !p.inStock || (p.stockQuantity ?? 0) <= 5).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-24 md:pb-16">
      {/* Top Fixed Admin Control Header */}
      <header className="bg-[#0F172A] text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Upper Title & User Actions Row */}
          <div className="flex items-center justify-between py-2.5 sm:py-3.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-500 text-slate-950 flex items-center justify-center font-black text-xs sm:text-sm">
                JJ
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">JollyJuniors</h1>
                  <span className="px-1.5 sm:px-2 py-0.5 bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[9px] sm:text-[10px] font-bold rounded-md">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Control catalog, inventory stock, orders, and customer accounts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setCurrentView('home')}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Switch to Storefront"
              >
                <Store className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden xs:inline">Storefront</span>
              </button>

              <button
                onClick={() => {
                  logoutAdmin();
                  window.history.pushState(null, '', '/jj/admin');
                }}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Log out of Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation Row for Desktop & Tablet */}
          <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors border ${
                activeTab === 'overview'
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors border ${
                activeTab === 'products'
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors border ${
                activeTab === 'stock'
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Stock Audit</span>
              {lowStockCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white font-black text-[10px] rounded-full">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors border ${
                activeTab === 'inventory'
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors border ${
                activeTab === 'categories'
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Categories ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('control')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors border ${
                activeTab === 'control'
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Control</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors border ${
                activeTab === 'orders'
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({orders.length})</span>
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('returns')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors border ${
                activeTab === 'returns'
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Returns</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors border ${
                activeTab === 'users'
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors border ${
                activeTab === 'settings'
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {activeTab === 'overview' && (
          <AdminOverview
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenAddProduct={() => {
              setActiveTab('products');
              setOpenAddProductModal(true);
            }}
            onOpenAddCategory={() => {
              setActiveTab('categories');
              setOpenAddCategoryModal(true);
            }}
          />
        )}

        {activeTab === 'products' && (
          <AdminProducts
            openAddModalInitially={openAddProductModal}
            onCloseAddModal={() => setOpenAddProductModal(false)}
          />
        )}

        {activeTab === 'stock' && <AdminStock />}

        {activeTab === 'inventory' && <AdminInventory />}

        {activeTab === 'categories' && (
          <AdminCategories
            openAddModalInitially={openAddCategoryModal}
            onCloseAddModal={() => setOpenAddCategoryModal(false)}
          />
        )}

        {activeTab === 'control' && <AdminControl />}

        {activeTab === 'orders' && <AdminOrders />}

        {activeTab === 'returns' && <AdminReturns />}

        {activeTab === 'users' && <AdminUsers />}

        {activeTab === 'settings' && <AdminSettings />}
      </main>

      {/* Mobile Sticky Bottom Tab Bar for Admin Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-800 z-50 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold cursor-pointer transition-colors ${
            activeTab === 'overview' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold cursor-pointer transition-colors ${
            activeTab === 'products' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`relative flex flex-col items-center gap-1 p-1 text-[10px] font-bold cursor-pointer transition-colors ${
            activeTab === 'stock' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <div className="relative">
            <Boxes className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3 h-3 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
                {lowStockCount}
              </span>
            )}
          </div>
          <span>Stock</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold cursor-pointer transition-colors ${
            activeTab === 'inventory' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`relative flex flex-col items-center gap-1 p-1 text-[10px] font-bold cursor-pointer transition-colors ${
            activeTab === 'orders' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4" />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3 h-3 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black flex items-center justify-center">
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <span>Orders</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold cursor-pointer transition-colors ${
            activeTab === 'categories' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold cursor-pointer transition-colors ${
            activeTab === 'users' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users</span>
        </button>
      </div>
    </div>
  );
};
