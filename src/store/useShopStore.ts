import { create } from 'zustand';
import { Product, ProductVariant, CartItem, FilterState, Category, Order, AppUser, StorefrontConfig } from '@/types';
import * as authService from '@/services/auth-service';
import * as productService from '@/services/product-service';
import * as categoryService from '@/services/category-service';
import * as orderService from '@/services/order-service';
import * as storefrontService from '@/services/storefront-service';
import * as customerService from '@/services/customer-service';
import {
  loadGuestCart,
  saveGuestCart,
  loadGuestWishlist,
  saveGuestWishlist,
} from '@/utils/guest-storage';
import { mapProduct, mapCategory, mapOrder } from '@/services/mappers';
import { preloadImages } from '@/utils/cdn-image';
import { syncShopUrl } from '@/utils/shop-url';

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
  footerInstagramUrl: undefined,
  footerFacebookUrl: undefined,
};

interface ShopStore {
  products: Product[];
  /** Catalog loaded for the shop page via store APIs (by category / search) */
  shopProducts: Product[];
  shopLoading: boolean;
  categories: Category[];
  cart: CartItem[];
  buyNowItem: CartItem | null;
  wishlist: string[];
  filter: FilterState;
  quickViewProduct: Product | null;
  selectedProductDetail: Product | null;
  currentView: 'home' | 'shop' | 'checkout' | 'order-success' | 'order-tracking';
  cartOpen: boolean;
  wishlistOpen: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  authModalOpen: boolean;
  accountPanelOpen: boolean;
  activeCategorySlug: string | null;
  toastMessage: string | null;
  lastOrderNumber: string | null;
  isCustomerAuthenticated: boolean;
  storefrontConfig: StorefrontConfig;
  liveSales: Array<{
    id: string;
    key: string;
    title: string;
    badge_text?: string | null;
    tag_ids?: string[];
  }>;
  /** Delivery fee + free-over threshold from settings */
  shippingConfig: { deliveryFee: number; freeDeliveryThreshold: number };
  /** Promo verified by backend (null = none) */
  appliedPromo: {
    code: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    discountAmount: number;
  } | null;

  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  setBuyNowItem: (item: CartItem | null) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setFilter: (filter: Partial<FilterState>) => void;
  resetFilter: () => void;
  setQuickViewProduct: (product: Product | null) => void;
  setSelectedProductDetail: (product: Product | null) => void;
  setCurrentView: (view: 'home' | 'shop' | 'checkout' | 'order-success' | 'order-tracking') => void;
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
  /** Load shop grid from /store/categories/.../products or /store/products */
  fetchShopCatalog: () => Promise<void>;
  fetchStorefrontConfig: () => Promise<void>;

  addOrder: (order: Order) => Promise<void>;

  getCartTotal: () => number;
  getCartCount: () => number;
  getDeliveryFee: () => number;
  getPromoDiscountAmount: () => number;
  fetchShippingConfig: () => Promise<void>;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  clearPromoCode: () => void;
  getFreeShippingProgress: () => {
    threshold: number;
    remaining: number;
    percentage: number;
    isFree: boolean;
    deliveryFee: number;
  };
}

const initialFilter: FilterState = {
  categoryId: null,
  categoryIds: [],
  subCategory: null,
  searchQuery: '',
  ageGroup: null,
  priceRange: [0, 15000],
  sortBy: 'featured',
  onSaleOnly: false,
  inStockOnly: false,
  saleKey: null,
};

export const useShopStore = create<ShopStore>((set, get) => ({
  products: [],
  shopProducts: [],
  shopLoading: false,
  categories: [],
  // SSR-safe defaults — hydrate from localStorage after mount (avoids hydration mismatch)
  cart: [],
  buyNowItem: null,
  wishlist: [],
  filter: initialFilter,
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
  isCustomerAuthenticated: false,
  storefrontConfig: emptyStorefront,
  liveSales: [],
  shippingConfig: { deliveryFee: 250, freeDeliveryThreshold: 3000 },
  appliedPromo: null,

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

  setBuyNowItem: (item) => {
    set({ buyNowItem: item });
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
    set({ cart: [], appliedPromo: null });
    void get().syncCartToServer();
  },

  toggleWishlist: (productId) => {
    if (!get().isCustomerAuthenticated) {
      get().showToast('Please log in to use your wishlist ❤️');
      get().setAuthModalOpen(true);
      return;
    }

    const wasIn = get().wishlist.includes(productId);
    set((state) => {
      const updated = wasIn
        ? state.wishlist.filter((id) => id !== productId)
        : [...state.wishlist, productId];
      saveGuestWishlist(updated);
      return { wishlist: updated };
    });

    get().showToast(!wasIn ? 'Added to your Wishlist ❤️' : 'Removed from Wishlist');

    void (wasIn
      ? customerService.removeWishlistRemote(productId)
      : customerService.addWishlistRemote(productId)
    ).catch(() => undefined);
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
        subCategory: null,
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
    if (typeof window === 'undefined') return;
    const products = get().products;
    const cart = hydrateCartFromStorage(products);
    const wishlist = loadGuestWishlist();
    set({
      cart,
      wishlist,
    });
    
    // Check if customer session cookie is valid
    authService.fetchMe()
      .then((user) => {
        if (user && user.role === 'customer') {
          set({ isCustomerAuthenticated: true });
          customerService.fetchCustomerWishlist().then((remoteWishlist) => {
            const clean = (remoteWishlist || []).filter((id) => id && id.trim() !== '' && id !== 'null' && id !== 'undefined');
            set({ wishlist: clean });
            saveGuestWishlist(clean);
          }).catch(() => undefined);
        }
      })
      .catch(() => {
        set({ isCustomerAuthenticated: false });
      });
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
      await customerService.verifyLoginOtp(email, code);
      set({
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

  logoutCustomer: async () => {
    try {
      await customerService.logoutCustomer();
    } catch {
      // ignore
    }
    set({ isCustomerAuthenticated: false });
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
      // Home rails still need a product list; shop grid uses fetchShopCatalog
      const products = await productService.fetchPublicProducts(slugById);
      set({ products, categories, storefrontConfig });
      preloadImages(categories.map((c) => c.image).filter(Boolean), 400);
      preloadImages(products.map((p) => p.images[0]).filter(Boolean), 400);
      get().hydrateGuestState();
      void get().fetchLiveSales();
      void get().fetchShippingConfig();
    } catch (err) {
      console.error('Failed to fetch public data', err);
    }
  },

  fetchShopCatalog: async () => {
    const filter = get().filter;
    set({ shopLoading: true });
    try {
      const sort = filter.sortBy || 'featured';
      const cats =
        filter.categoryIds?.length > 0
          ? filter.categoryIds
          : filter.categoryId
            ? [filter.categoryId]
            : [];

      let items: Product[] = [];
      if (filter.saleKey) {
        try {
          const sale = await customerService.fetchSaleProducts(filter.saleKey, {
            categoryId: cats[0],
            ageGroup: filter.ageGroup || undefined,
          });
          items = sale.items;
        } catch (err) {
          console.warn(`Sale/campaign "${filter.saleKey}" not found, falling back to catalog query:`, err);
          const page = await customerService.fetchStoreProducts({
            categoryIds: cats.length ? cats : undefined,
            q: filter.searchQuery.trim() || undefined,
            sort,
            inStock: filter.inStockOnly || undefined,
            ageGroup: filter.ageGroup || undefined,
            onSaleOnly: filter.onSaleOnly || undefined,
          });
          items = page.items;
        }
      } else if (cats.length === 1 && !filter.searchQuery.trim()) {
        const page = await customerService.fetchCategoryProducts(cats[0], {
          sort,
          subCategory: filter.subCategory || undefined,
          inStock: filter.inStockOnly || undefined,
          ageGroup: filter.ageGroup || undefined,
          onSaleOnly: filter.onSaleOnly || undefined,
        });
        items = page.items;
      } else {
        const page = await customerService.fetchStoreProducts({
          categoryIds: cats.length ? cats : undefined,
          subCategory: filter.subCategory || undefined,
          q: filter.searchQuery.trim() || undefined,
          sort,
          inStock: filter.inStockOnly || undefined,
          ageGroup: filter.ageGroup || undefined,
          onSaleOnly: filter.onSaleOnly || undefined,
        });
        items = page.items;
      }

      set({ shopProducts: items, shopLoading: false });
      preloadImages(items.map((p) => p.images[0]).filter(Boolean), 400);
    } catch (err) {
      console.error('Failed to fetch shop catalog', err);
      set({ shopLoading: false });
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

  addOrder: async (order) => {
    try {
      const subtotal = get().getCartTotal();
      const shipping_fee = get().getDeliveryFee();
      const discount_amount = get().getPromoDiscountAmount();
      const total_amount = Math.max(0, subtotal - discount_amount) + shipping_fee;

      const mappedOrder = await orderService.createOrder({
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        shipping_address: order.address,
        city: order.city,
        payment_method: 'COD',
        user_id: (order.userId as string | undefined) || null,
        subtotal,
        shipping_fee,
        discount_amount,
        total_amount: order.totalAmount || total_amount,
        items: order.items.map((item) => ({
          product_id: item.productId,
          product_name: item.productName,
          variant_name: item.variantName,
          price: item.price,
          quantity: item.quantity,
        })),
      });

      if (mappedOrder.orderNumber) {
        set({ lastOrderNumber: mappedOrder.orderNumber });
      }
      get().showToast('Order placed successfully');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      get().showToast(`Error: ${message}`);
    }
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

  getDeliveryFee: () => {
    const progress = get().getFreeShippingProgress();
    return progress.isFree ? 0 : progress.deliveryFee;
  },

  getPromoDiscountAmount: () => {
    const promo = get().appliedPromo;
    if (!promo) return 0;
    // Recompute from current cart so discount stays honest after cart edits
    const subtotal = get().getCartTotal();
    if (promo.discountType === 'percent') {
      return Math.min(subtotal, Math.round((subtotal * promo.discountValue) / 100));
    }
    return Math.min(subtotal, Math.round(promo.discountValue));
  },

  fetchShippingConfig: async () => {
    try {
      const { fetchShippingConfig } = await import('@/services/promo-service');
      const shippingConfig = await fetchShippingConfig();
      set({ shippingConfig });
    } catch {
      /* keep defaults */
    }
  },

  applyPromoCode: async (code) => {
    try {
      const { validatePromoCode } = await import('@/services/promo-service');
      const subtotal = get().getCartTotal();
      const result = await validatePromoCode(code, subtotal);
      if (!result.valid || !result.applied) {
        set({ appliedPromo: null });
        return { success: false, message: result.message || 'Invalid promo code.' };
      }
      set({ appliedPromo: result.applied });
      return { success: true, message: result.message };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not verify promo code';
      return { success: false, message };
    }
  },

  clearPromoCode: () => set({ appliedPromo: null }),

  getFreeShippingProgress: () => {
    const total = get().getCartTotal();
    const threshold = get().shippingConfig.freeDeliveryThreshold || 3000;
    const deliveryFee = get().shippingConfig.deliveryFee ?? 250;
    const remaining = Math.max(0, threshold - total);
    const percentage = Math.min(100, Math.round((total / threshold) * 100));
    return {
      threshold,
      remaining,
      percentage,
      isFree: total >= threshold,
      deliveryFee,
    };
  },
}));
