import { create } from 'zustand';
import { Product, ProductVariant, CartItem, FilterState, Category, Order, AppUser, StorefrontConfig } from '@/types';
import {
  getAccessToken,
  isAuthenticated,
  getCustomerToken,
  setCustomerToken,
  clearCustomerToken,
  isCustomerAuthenticated,
} from '@/api/auth-tokens';
import * as authService from '@/services/auth-service';
import * as productService from '@/services/product-service';
import * as categoryService from '@/services/category-service';
import * as orderService from '@/services/order-service';
import * as userService from '@/services/user-service';
import * as inventoryService from '@/services/inventory-service';
import * as storefrontService from '@/services/storefront-service';
import * as customerService from '@/services/customer-service';
import {
  loadGuestCart,
  saveGuestCart,
  loadGuestWishlist,
  saveGuestWishlist,
} from '@/utils/guest-storage';
import { syncShopUrl } from '@/utils/shop-url';
import type { InventoryStats } from '@/services/inventory-service';

/** Rebuild CartItem[] from guest storage using current product catalog when possible. */
function hydrateCartFromStorage(products: Product[]): CartItem[] {
  return loadGuestCart()
    .map((line) => {
      const product =
        products.find((p) => p.id === line.productId) || line.product;
      if (!product) return null;
      return {
        product,
        variant: line.variant,
        quantity: line.quantity,
      } as CartItem;
    })
    .filter(Boolean) as CartItem[];
}

const emptyStorefront: StorefrontConfig = {
  tags: [],
  navCategories: [],
  featuredCategories: [],
  footerCategories: [],
  heroSlides: [],
  homeSections: [],
  navSectionChips: [],
};

interface ShopStore {
  products: Product[];
  categories: Category[];
  orders: Order[];
  users: AppUser[];
  inventoryStats: InventoryStats;
  cart: CartItem[];
  wishlist: string[];
  filter: FilterState;
  quickViewProduct: Product | null;
  selectedProductDetail: Product | null;
  currentView: 'home' | 'shop' | 'checkout' | 'order-success' | 'admin';
  cartOpen: boolean;
  wishlistOpen: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  authModalOpen: boolean;
  accountPanelOpen: boolean;
  activeCategorySlug: string | null;
  toastMessage: string | null;
  lastOrderNumber: string | null;
  isAdminAuthenticated: boolean;
  isCustomerAuthenticated: boolean;
  customerToken: string | null;
  authToken: string | null;
  isLoadingAdminData: boolean;
  storefrontConfig: StorefrontConfig;
  liveSales: Array<{
    id: string;
    key: string;
    title: string;
    badge_text?: string | null;
    tag_ids?: string[];
  }>;

  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setFilter: (filter: Partial<FilterState>) => void;
  resetFilter: () => void;
  setQuickViewProduct: (product: Product | null) => void;
  setSelectedProductDetail: (product: Product | null) => void;
  setCurrentView: (view: 'home' | 'shop' | 'checkout' | 'order-success' | 'admin') => void;
  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setAccountPanelOpen: (open: boolean) => void;
  setActiveCategorySlug: (slug: string | null) => void;
  showToast: (msg: string) => void;
  setLastOrderNumber: (num: string) => void;
  hydrateGuestState: () => void;
  loginCustomerWithOtp: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
  logoutCustomer: () => void;
  fetchLiveSales: () => Promise<void>;
  syncCartToServer: () => Promise<void>;

  fetchPublicData: () => Promise<void>;
  fetchStorefrontConfig: () => Promise<void>;
  fetchInventoryStats: () => Promise<void>;
  refreshInventoryStats: () => Promise<void>;
  adjustStock: (productId: string, delta: number) => Promise<void>;
  setStockQuantity: (productId: string, quantity: number) => Promise<void>;
  batchRestock: (productIds: string[], amount: number) => Promise<void>;

  fetchAdminData: () => Promise<void>;
  fetchAdminProducts: () => Promise<void>;
  fetchAdminCategories: () => Promise<void>;
  fetchAdminOrders: () => Promise<void>;
  fetchAdminUsers: () => Promise<void>;
  addProduct: (newProduct: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addCategory: (newCategory: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updated: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  createOrderReturn: (
    orderId: string,
    payload: {
      reason: string;
      notes?: string;
      items: Array<{ orderItemId: number; quantity: number; reason?: string }>;
    },
  ) => Promise<boolean>;

  addUser: (newUser: Omit<AppUser, 'id'>) => Promise<void>;
  updateUserStatus: (userId: string, status: 'Active' | 'Suspended') => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;

  getCartTotal: () => number;
  getCartCount: () => number;
  getFreeShippingProgress: () => {
    threshold: number;
    remaining: number;
    percentage: number;
    isFree: boolean;
  };
}

const initialFilter: FilterState = {
  categoryId: null,
  categoryIds: [],
  searchQuery: '',
  ageGroup: null,
  priceRange: [0, 15000],
  sortBy: 'featured',
  onSaleOnly: false,
  inStockOnly: false,
  saleKey: null,
};

const emptyInventoryStats: InventoryStats = {
  totalStockUnits: 0,
  lowStockAlert: 0,
  totalInvestmentValue: 0,
  totalRetailValue: 0,
  deliveredSalesValue: 0,
  deliveredCostValue: 0,
  totalProfitEarned: 0,
  currentInventoryValue: 0,
};

export const useShopStore = create<ShopStore>((set, get) => ({
  products: [],
  categories: [],
  orders: [],
  users: [],
  cart: [],
  wishlist: typeof window !== 'undefined' ? loadGuestWishlist() : [],
  filter: initialFilter,
  inventoryStats: emptyInventoryStats,
  quickViewProduct: null,
  selectedProductDetail: null,
  currentView: 'home',
  cartOpen: false,
  wishlistOpen: false,
  searchOpen: false,
  mobileMenuOpen: false,
  authModalOpen: false,
  accountPanelOpen: false,
  activeCategorySlug: null,
  toastMessage: null,
  lastOrderNumber: null,
  isAdminAuthenticated: isAuthenticated(),
  isCustomerAuthenticated: isCustomerAuthenticated(),
  customerToken: getCustomerToken(),
  authToken: getAccessToken(),
  isLoadingAdminData: false,
  storefrontConfig: emptyStorefront,
  liveSales: [],

  addToCart: (product, variant, quantity = 1) => {
    const targetProduct = get().products.find((p) => p.id === product.id) || product;
    const currentStock = targetProduct.stockQuantity ?? 0;
    const tags = targetProduct.tags || [];
    const comingSoon = tags.some((t) => {
      const name = (t.name || '').toLowerCase().replace(/\s+/g, '-');
      const label = (t.label || '').toLowerCase();
      return name === 'coming-soon' || name === 'comingsoon' || label.includes('coming soon');
    });
    if (comingSoon) {
      get().showToast(`"${targetProduct.name}" is Coming Soon — not available to buy yet.`);
      return;
    }
    const isAvailable = targetProduct.inStock && currentStock > 0;

    if (!isAvailable) {
      get().showToast(`Sorry, "${targetProduct.name.slice(0, 20)}..." is currently out of stock!`);
      return;
    }

    let isCapped = false;

    set((state) => {
      const existingIndex = state.cart.findIndex((item) => {
        if (item.product.id !== product.id) return false;
        if (!variant && !item.variant) return true;
        return item.variant?.id === variant?.id;
      });

      const updatedCart = [...state.cart];
      if (existingIndex > -1) {
        const existingQty = updatedCart[existingIndex].quantity;
        const totalRequested = existingQty + quantity;

        if (totalRequested > currentStock) {
          isCapped = true;
          updatedCart[existingIndex] = { ...updatedCart[existingIndex], quantity: currentStock };
        } else {
          updatedCart[existingIndex] = { ...updatedCart[existingIndex], quantity: totalRequested };
        }
      } else {
        const initialQty = Math.min(quantity, currentStock);
        if (initialQty < quantity) isCapped = true;
        updatedCart.push({ product: targetProduct, variant, quantity: initialQty });
      }

      saveGuestCart(updatedCart);
      return { cart: updatedCart, cartOpen: true };
    });

    if (isCapped) {
      get().showToast(`Only ${currentStock} units available in stock! Added maximum available.`);
    } else {
      get().showToast(`Added "${targetProduct.name.slice(0, 24)}..." to cart! 🛍️`);
    }
    void get().syncCartToServer();
  },

  removeFromCart: (productId, variantId) => {
    set((state) => {
      const cart = state.cart.filter((item) => {
        if (item.product.id !== productId) return true;
        if (!variantId && !item.variant) return false;
        return item.variant?.id !== variantId;
      });
      saveGuestCart(cart);
      return { cart };
    });
    get().showToast('Item removed from cart');
    void get().syncCartToServer();
  },

  updateQuantity: (productId, variantId, delta) => {
    const targetProduct = get().products.find((p) => p.id === productId);
    const maxStock = targetProduct?.stockQuantity ?? 99;

    set((state) => {
      const updatedCart = state.cart
        .map((item) => {
          if (item.product.id !== productId) return item;
          if (variantId && item.variant?.id !== variantId) return item;
          if (!variantId && item.variant) return item;

          const newQty = item.quantity + delta;
          if (newQty > maxStock) {
            get().showToast(`Cannot exceed remaining stock limit (${maxStock} left)`);
            return { ...item, quantity: maxStock };
          }
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        })
        .filter(Boolean) as CartItem[];

      saveGuestCart(updatedCart);
      return { cart: updatedCart };
    });
    void get().syncCartToServer();
  },

  clearCart: () => {
    saveGuestCart([]);
    set({ cart: [] });
    void get().syncCartToServer();
  },

  toggleWishlist: (productId) => {
    const wasIn = get().wishlist.includes(productId);
    set((state) => {
      const updated = wasIn
        ? state.wishlist.filter((id) => id !== productId)
        : [...state.wishlist, productId];
      saveGuestWishlist(updated);
      return { wishlist: updated };
    });

    get().showToast(!wasIn ? 'Added to your Wishlist ❤️' : 'Removed from Wishlist');

    if (get().isCustomerAuthenticated) {
      void (wasIn
        ? customerService.removeWishlistRemote(productId)
        : customerService.addWishlistRemote(productId)
      ).catch(() => undefined);
    }
  },

  isInWishlist: (productId) => get().wishlist.includes(productId),

  setFilter: (newFilter) => {
    set((state) => {
      const filter = { ...state.filter, ...newFilter };
      const activeCategorySlug =
        filter.categoryId ??
        (filter.categoryIds.length === 1 ? filter.categoryIds[0] : state.activeCategorySlug);
      syncShopUrl(state.currentView === 'shop' || filter.categoryId || filter.saleKey ? 'shop' : state.currentView, filter);
      return { filter, activeCategorySlug: activeCategorySlug || null };
    });
  },

  resetFilter: () => {
    set({ filter: initialFilter, activeCategorySlug: null });
    syncShopUrl(get().currentView, initialFilter);
  },

  setQuickViewProduct: (product) => set({ quickViewProduct: product }),
  setSelectedProductDetail: (product) => set({ selectedProductDetail: product }),
  setCurrentView: (view) => {
    set({ currentView: view });
    if (view === 'shop') {
      syncShopUrl('shop', get().filter);
    } else if (view === 'home') {
      // Clear shop query params so refresh stays on home
      syncShopUrl('home', {
        categoryId: null,
        categoryIds: [],
        searchQuery: '',
        ageGroup: null,
        priceRange: [0, 15000],
        sortBy: 'featured',
        onSaleOnly: false,
        inStockOnly: false,
        saleKey: null,
      });
    }
  },
  setCartOpen: (open) => set({ cartOpen: open }),
  setWishlistOpen: (open) => set({ wishlistOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setAccountPanelOpen: (open) => set({ accountPanelOpen: open }),
  setActiveCategorySlug: (slug) => set({ activeCategorySlug: slug }),

  hydrateGuestState: () => {
    const products = get().products;
    const cart = hydrateCartFromStorage(products);
    const wishlist = loadGuestWishlist();
    set({ cart, wishlist });
  },

  syncCartToServer: async () => {
    if (!get().isCustomerAuthenticated) return;
    try {
      await customerService.mergeCustomerCart(get().cart);
    } catch {
      /* offline / not critical */
    }
  },

  loginCustomerWithOtp: async (email, code) => {
    try {
      const res = await customerService.verifyLoginOtp(email, code);
      setCustomerToken(res.access_token);
      set({
        customerToken: res.access_token,
        isCustomerAuthenticated: true,
        authModalOpen: false,
      });
      // Merge guest cart + wishlist into DB
      try {
        await customerService.mergeCustomerCart(get().cart);
        const ids = await customerService.mergeCustomerWishlist(get().wishlist);
        set({ wishlist: ids });
        saveGuestWishlist(ids);
        const remoteCart = await customerService.fetchCustomerCart();
        const cart: CartItem[] = remoteCart.map((line) => ({
          product: line.product,
          variant: undefined,
          quantity: line.quantity,
        }));
        set({ cart });
        saveGuestCart(cart);
      } catch {
        /* merge best-effort */
      }
      get().showToast('Welcome back! Signed in ⭐');
      return { success: true };
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : 'Login failed' };
    }
  },

  logoutCustomer: () => {
    clearCustomerToken();
    set({ customerToken: null, isCustomerAuthenticated: false });
    get().showToast('Signed out');
  },

  fetchLiveSales: async () => {
    try {
      const liveSales = await customerService.fetchLiveSales();
      set({ liveSales });
    } catch {
      set({ liveSales: [] });
    }
  },

  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) {
        set({ toastMessage: null });
      }
    }, 3200);
  },

  setLastOrderNumber: (num) => set({ lastOrderNumber: num }),

  fetchPublicData: async () => {
    try {
      const [categories, storefrontConfig] = await Promise.all([
        categoryService.fetchPublicCategories(),
        storefrontService.fetchStorefrontConfig().catch(() => emptyStorefront),
      ]);
      const slugById = new Map(categories.map((c) => [c.id, c.slug]));
      const products = await productService.fetchPublicProducts(slugById);
      set({ products, categories, storefrontConfig });
      get().hydrateGuestState();
      void get().fetchLiveSales();
    } catch (err) {
      console.error('Failed to fetch public data', err);
    }
  },

  fetchStorefrontConfig: async () => {
    try {
      const storefrontConfig = await storefrontService.fetchStorefrontConfig();
      set({ storefrontConfig });
    } catch (err) {
      console.error('Failed to fetch storefront config', err);
    }
  },

  fetchAdminProducts: async () => {
    if (!get().authToken) return;
    try {
      const slugById = new Map(get().categories.map((c) => [c.id, c.slug]));
      const products = await productService.fetchAdminProducts(slugById);
      set({ products });
    } catch (err) {
      console.error('Failed to fetch admin products', err);
    }
  },

  fetchAdminCategories: async () => {
    if (!get().authToken) return;
    try {
      const categories = await categoryService.fetchAdminCategories();
      set({ categories });
    } catch (err) {
      console.error('Failed to fetch admin categories', err);
    }
  },

  fetchAdminOrders: async () => {
    if (!get().authToken) return;
    try {
      const orders = await orderService.fetchAdminOrders();
      set({ orders });
    } catch (err) {
      console.error('Failed to fetch admin orders', err);
    }
  },

  fetchAdminUsers: async () => {
    if (!get().authToken) return;
    try {
      const users = await userService.fetchAdminUsers();
      set({ users });
    } catch (err) {
      console.error('Failed to fetch admin users', err);
    }
  },

  fetchAdminData: async () => {
    if (!get().authToken) return;
    set({ isLoadingAdminData: true });
    try {
      await Promise.all([
        get().fetchAdminProducts(),
        get().fetchAdminCategories(),
        get().fetchAdminOrders(),
        get().fetchAdminUsers(),
      ]);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      set({ isLoadingAdminData: false });
    }
  },

  fetchInventoryStats: async () => {
    try {
      const inventoryStats = await inventoryService.fetchInventoryDashboard();
      set({ inventoryStats });
    } catch (err) {
      console.error('Failed to fetch inventory stats', err);
    }
  },

  refreshInventoryStats: async () => {
    await get().fetchInventoryStats();
  },

  adjustStock: async (productId, delta) => {
    try {
      await inventoryService.adjustStock(productId, delta);
      await get().fetchAdminProducts();
      await get().refreshInventoryStats();
      get().showToast('Stock updated');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to adjust stock';
      get().showToast(`Error: ${message}`);
    }
  },

  setStockQuantity: async (productId, quantity) => {
    try {
      await inventoryService.setStockQuantity(productId, quantity);
      await get().fetchAdminProducts();
      await get().refreshInventoryStats();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update stock';
      get().showToast(`Error: ${message}`);
    }
  },

  batchRestock: async (productIds, amount) => {
    try {
      await inventoryService.batchAdjustStock(productIds, amount);
      await get().fetchAdminProducts();
      await get().refreshInventoryStats();
      get().showToast(`Restocked ${productIds.length} items with +${amount} units each`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to batch restock';
      get().showToast(`Error: ${message}`);
    }
  },

  addProduct: async (newProdData) => {
    try {
      await productService.createProduct({
        name: newProdData.name,
        slug: newProdData.name.toLowerCase().replace(/\s+/g, '-'),
        description: newProdData.description,
        price: newProdData.price,
        base_price: newProdData.basePrice,
        original_price: newProdData.originalPrice,
        category_id: newProdData.categoryId || null,
        category_name: newProdData.categoryName || 'Uncategorized',
        badge: newProdData.badge,
        discount_badge: newProdData.discountBadge,
        tag_ids: newProdData.tagIds || [],
        in_stock: newProdData.inStock,
        stock_quantity: newProdData.stockQuantity,
        is_featured: false,
        age_group: newProdData.ageGroup,
        images: newProdData.images,
      });
      await get().fetchAdminData();
      get().showToast(`Product "${newProdData.name}" created successfully!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      get().showToast(`Error: ${message}`);
    }
  },

  updateProduct: async (id, updated) => {
    try {
      const payload: Record<string, unknown> = {};
      if (updated.name !== undefined) payload.name = updated.name;
      if (updated.description !== undefined) payload.description = updated.description;
      if (updated.price !== undefined) payload.price = updated.price;
      if (updated.basePrice !== undefined) payload.base_price = updated.basePrice;
      if (updated.originalPrice !== undefined) payload.original_price = updated.originalPrice;
      if (updated.categoryId !== undefined) payload.category_id = updated.categoryId;
      if (updated.categoryName !== undefined) payload.category_name = updated.categoryName;
      if (updated.badge !== undefined) payload.badge = updated.badge;
      if (updated.discountBadge !== undefined) payload.discount_badge = updated.discountBadge;
      if (updated.tagIds !== undefined) payload.tag_ids = updated.tagIds;
      if (updated.inStock !== undefined) payload.in_stock = updated.inStock;
      if (updated.stockQuantity !== undefined) payload.stock_quantity = updated.stockQuantity;
      if (updated.ageGroup !== undefined) payload.age_group = updated.ageGroup;
      if (updated.isPublished !== undefined) payload.is_published = updated.isPublished;
      if (updated.images !== undefined) payload.images = updated.images;

      await productService.updateProduct(id, payload);
      await get().fetchAdminData();
      get().showToast('Product updated successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      get().showToast(`Error: ${message}`);
    }
  },

  deleteProduct: async (id) => {
    try {
      await productService.deleteProduct(id);
      await get().fetchAdminData();
      get().showToast('Product deleted');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      get().showToast(`Error: ${message}`);
    }
  },

  addCategory: async (newCatData) => {
    try {
      await categoryService.createCategory({
        name: newCatData.name,
        slug: newCatData.slug || newCatData.name.toLowerCase().replace(/\s+/g, '-'),
        description: newCatData.description,
        image: newCatData.image,
        is_enabled: newCatData.isEnabled !== false,
        show_in_nav: newCatData.showInNav ?? false,
        show_in_featured: newCatData.showInFeatured ?? newCatData.featured ?? true,
        show_in_footer: newCatData.showInFooter ?? false,
        nav_order: newCatData.navOrder ?? 0,
        tag_id: newCatData.tagId || null,
        subcategories: (newCatData.subcategories || []).filter(Boolean),
        icon: newCatData.iconName || 'Shapes',
        color: newCatData.color || '#FEF3C7',
      });
      await get().fetchAdminData();
      get().showToast(`Category "${newCatData.name}" added!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      get().showToast(`Error: ${message}`);
    }
  },

  updateCategory: async (id, updated) => {
    try {
      const payload: Record<string, unknown> = {};
      if (updated.name !== undefined) payload.name = updated.name;
      if (updated.slug !== undefined) payload.slug = updated.slug;
      if (updated.description !== undefined) payload.description = updated.description;
      if (updated.image !== undefined) payload.image = updated.image;
      if (updated.isEnabled !== undefined) payload.is_enabled = updated.isEnabled;
      if (updated.showInNav !== undefined) payload.show_in_nav = updated.showInNav;
      if (updated.showInFeatured !== undefined) payload.show_in_featured = updated.showInFeatured;
      if (updated.showInFooter !== undefined) payload.show_in_footer = updated.showInFooter;
      if (updated.featured !== undefined && updated.showInFeatured === undefined) {
        payload.show_in_featured = updated.featured;
      }
      if (updated.navOrder !== undefined) payload.nav_order = updated.navOrder;
      if (updated.tagId !== undefined) payload.tag_id = updated.tagId || null;
      if (updated.subcategories !== undefined) {
        payload.subcategories = updated.subcategories.filter(Boolean);
      }
      if (updated.iconName !== undefined) payload.icon = updated.iconName;
      if (updated.color !== undefined) payload.color = updated.color;
      if (updated.featured !== undefined) payload.featured = updated.featured;

      await categoryService.updateCategory(id, payload);
      await get().fetchAdminData();
      get().showToast('Category updated');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update category';
      get().showToast(`Error: ${message}`);
    }
  },

  deleteCategory: async (id) => {
    try {
      await categoryService.deleteCategory(id);
      await get().fetchAdminData();
      get().showToast('Category removed');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      get().showToast(`Error: ${message}`);
    }
  },

  addOrder: async (order) => {
    try {
      const mappedOrder = await orderService.createOrder({
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        shipping_address: order.address,
        city: order.city,
        payment_method: 'COD',
        user_id: (order.userId as string | undefined) || null,
        subtotal: order.totalAmount,
        shipping_fee: 0,
        discount_amount: 0,
        total_amount: order.totalAmount,
        items: order.items.map((item) => ({
          product_id: item.productId,
          product_name: item.productName,
          variant_name: item.variantName,
          price: item.price,
          quantity: item.quantity,
        })),
      });

      set((state) => ({ orders: [mappedOrder, ...state.orders] }));
      if (mappedOrder.orderNumber) {
        set({ lastOrderNumber: mappedOrder.orderNumber });
      }
      get().showToast('Order placed successfully');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      get().showToast(`Error: ${message}`);
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      await get().fetchAdminData();
      get().showToast(`Order status updated to ${status}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      get().showToast(`Error: ${message}`);
    }
  },

  deleteOrder: async (orderId) => {
    try {
      await orderService.deleteOrder(orderId);
      set((state) => ({
        orders: state.orders.filter((order) => order.id !== orderId),
      }));
      get().showToast('Order deleted');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete order';
      get().showToast(`Error: ${message}`);
    }
  },

  createOrderReturn: async (orderId, payload) => {
    try {
      const created = await orderService.createOrderReturn(orderId, payload);
      await get().fetchAdminData();
      get().showToast(`Return ${created.returnNumber} processed — stock updated`);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process return';
      get().showToast(`Error: ${message}`);
      return false;
    }
  },

  addUser: async () => {
    get().showToast('User registration via admin endpoint available');
  },

  updateUserStatus: async (userId, status) => {
    try {
      await userService.updateUserStatus(userId, status === 'Active');
      await get().fetchAdminData();
      get().showToast(`User status updated to ${status}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update user status';
      get().showToast(`Error: ${message}`);
    }
  },

  deleteUser: async () => {
    get().showToast('User deletion not permitted');
  },

  loginAdmin: async (email, pass) => {
    const result = await authService.loginAdmin(email, pass);
    if (!result.success) return result;

    set({ isAdminAuthenticated: true, authToken: result.token || getAccessToken() });
    await get().fetchAdminData();
    get().showToast('Admin authenticated successfully! Welcome back.');
    return { success: true };
  },

  logoutAdmin: () => {
    authService.logoutAdmin();
    set({ isAdminAuthenticated: false, authToken: null });
    get().showToast('Logged out of Admin Portal');
  },

  getCartTotal: () => {
    return get().cart.reduce((total, item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      return total + price * item.quantity;
    }, 0);
  },

  getCartCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },

  getFreeShippingProgress: () => {
    const total = get().getCartTotal();
    const threshold = 3000;
    const remaining = Math.max(0, threshold - total);
    const percentage = Math.min(100, Math.round((total / threshold) * 100));
    return { threshold, remaining, percentage, isFree: total >= threshold };
  },
}));
