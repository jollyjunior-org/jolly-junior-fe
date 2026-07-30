import { create } from 'zustand';
import { Product, ProductVariant, CartItem, FilterState, Category, Order, AppUser } from '../types';

interface ImportMetaEnv {
  readonly VITE_AUTH_API_URL?: string;
  readonly VITE_ADMIN_API_URL?: string;
  readonly VITE_PUBLIC_API_URL?: string;
}

interface AppImportMeta {
  readonly env: ImportMetaEnv;
}

interface InventoryStats {
  totalStockUnits: number;
  lowStockAlert: number;
  totalInvestmentValue: number;
  totalRetailValue: number;
  deliveredSalesValue: number;
  deliveredCostValue: number;
  totalProfitEarned: number;
  currentInventoryValue: number;
}

interface ShopStore {
  products: Product[];
  categories: Category[];
  orders: Order[];
  users: AppUser[];
  inventoryStats: InventoryStats;
  cart: CartItem[];
  wishlist: string[]; // product IDs
  filter: FilterState;
  quickViewProduct: Product | null;
  selectedProductDetail: Product | null;
  currentView: 'home' | 'shop' | 'checkout' | 'order-success' | 'admin';
  cartOpen: boolean;
  wishlistOpen: boolean;
  searchOpen: boolean;
  activeCategorySlug: string | null;
  toastMessage: string | null;
  lastOrderNumber: string | null;
  isAdminAuthenticated: boolean;
  authToken: string | null;
  isLoadingAdminData: boolean;

  // Actions
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
  setActiveCategorySlug: (slug: string | null) => void;
  showToast: (msg: string) => void;
  setLastOrderNumber: (num: string) => void;

  // Stock & Inventory Actions
  fetchPublicData: () => Promise<void>;
  fetchInventoryStats: () => Promise<void>;
  refreshInventoryStats: () => Promise<void>;
  adjustStock: (productId: string, delta: number) => Promise<void>;
  setStockQuantity: (productId: string, quantity: number) => Promise<void>;
  batchRestock: (productIds: string[], amount: number) => Promise<void>;

  // Admin Management Actions
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

  addUser: (newUser: Omit<AppUser, 'id'>) => Promise<void>;
  updateUserStatus: (userId: string, status: 'Active' | 'Suspended') => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;

  // Computed helpers
  getCartTotal: () => number;
  getCartCount: () => number;
  getFreeShippingProgress: () => { threshold: number; remaining: number; percentage: number; isFree: boolean };
}

const initialFilter: FilterState = {
  categoryId: null,
  searchQuery: '',
  ageGroup: null,
  priceRange: [0, 15000],
  sortBy: 'featured',
  onSaleOnly: false,
  inStockOnly: false
};

const AUTH_API = (import.meta as unknown as AppImportMeta).env.VITE_AUTH_API_URL || 'http://localhost:8001/api/v1';
const ADMIN_API = (import.meta as unknown as AppImportMeta).env.VITE_ADMIN_API_URL || 'http://localhost:8002/api/v1';

export const useShopStore = create<ShopStore>((set, get) => ({
  products: [],
  categories: [],
  orders: [],
  users: [],
  cart: [],
  wishlist: [],
  filter: initialFilter,
  inventoryStats: {
    totalStockUnits: 0,
    lowStockAlert: 0,
    totalInvestmentValue: 0,
    totalRetailValue: 0,
    deliveredSalesValue: 0,
    deliveredCostValue: 0,
    totalProfitEarned: 0,
    currentInventoryValue: 0
  },
  quickViewProduct: null,
  selectedProductDetail: null,
  currentView: 'home',
  cartOpen: false,
  wishlistOpen: false,
  searchOpen: false,
  activeCategorySlug: null,
  toastMessage: null,
  lastOrderNumber: null,
  isAdminAuthenticated: !!localStorage.getItem('admin_token'),
  authToken: localStorage.getItem('admin_token') || null,
  isLoadingAdminData: false,

  addToCart: (product, variant, quantity = 1) => {
    const targetProduct = get().products.find(p => p.id === product.id) || product;
    const currentStock = targetProduct.stockQuantity ?? 0;
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

      let updatedCart = [...state.cart];
      if (existingIndex > -1) {
        const existingQty = updatedCart[existingIndex].quantity;
        const totalRequested = existingQty + quantity;

        if (totalRequested > currentStock) {
          isCapped = true;
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: currentStock
          };
        } else {
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: totalRequested
          };
        }
      } else {
        const initialQty = Math.min(quantity, currentStock);
        if (initialQty < quantity) isCapped = true;
        updatedCart.push({ product: targetProduct, variant, quantity: initialQty });
      }

      return { cart: updatedCart, cartOpen: true };
    });

    if (isCapped) {
      get().showToast(`Only ${currentStock} units available in stock! Added maximum available.`);
    } else {
      get().showToast(`Added "${targetProduct.name.slice(0, 24)}..." to cart! 🛍️`);
    }
  },

  removeFromCart: (productId, variantId) => {
    set((state) => ({
      cart: state.cart.filter((item) => {
        if (item.product.id !== productId) return true;
        if (!variantId && !item.variant) return false;
        return item.variant?.id !== variantId;
      })
    }));
    get().showToast('Item removed from cart');
  },

  updateQuantity: (productId, variantId, delta) => {
    const targetProduct = get().products.find(p => p.id === productId);
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

      return { cart: updatedCart };
    });
  },

  clearCart: () => set({ cart: [] }),

  toggleWishlist: (productId) => {
    set((state) => {
      const exists = state.wishlist.includes(productId);
      const updated = exists
        ? state.wishlist.filter((id) => id !== productId)
        : [...state.wishlist, productId];

      return { wishlist: updated };
    });

    const isAdded = get().wishlist.includes(productId);
    get().showToast(isAdded ? 'Added to your Wishlist ❤️' : 'Removed from Wishlist');
  },

  isInWishlist: (productId) => get().wishlist.includes(productId),

  setFilter: (newFilter) =>
    set((state) => ({
      filter: { ...state.filter, ...newFilter }
    })),

  resetFilter: () => set({ filter: initialFilter }),

  setQuickViewProduct: (product) => set({ quickViewProduct: product }),

  setSelectedProductDetail: (product) => set({ selectedProductDetail: product }),

  setCurrentView: (view) => set({ currentView: view }),

  setCartOpen: (open) => set({ cartOpen: open }),

  setWishlistOpen: (open) => set({ wishlistOpen: open }),

  setSearchOpen: (open) => set({ searchOpen: open }),

  setActiveCategorySlug: (slug) => set({ activeCategorySlug: slug }),

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
      const PUBLIC_API = (import.meta as unknown as AppImportMeta).env.VITE_PUBLIC_API_URL || 'http://localhost:8003/api/v1';
      const [prodsRes, catsRes] = await Promise.all([
        fetch(`${PUBLIC_API}/products/`),
        fetch(`${PUBLIC_API}/categories/`)
      ]);

      const prods = prodsRes.ok ? await prodsRes.json() : [];
      const cats = catsRes.ok ? await catsRes.json() : [];

      set({
        products: prods.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          originalPrice: p.original_price,
          categoryId: p.category_id || p.categoryId || null,
          categoryName: p.category_name || p.categoryName || 'Uncategorized',
          images: p.images || [],
          badge: p.badge,
          discountBadge: p.discount_badge || '',
          inStock: p.in_stock,
          stockQuantity: p.stock_quantity,
          lowStockThreshold: p.low_stock_threshold || 5,
          isPublished: p.is_published !== false,
          isFeatured: p.is_featured,
          ageGroup: p.age_group,
          rating: p.rating || 5.0,
          reviewCount: p.review_count || 0
        })),
        categories: cats.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image,
          description: c.description,
          itemCount: c.item_count || 0,
          color: c.color || '#FEF3C7',
          iconName: c.icon_name || c.icon || 'Shapes',
          featured: c.featured ?? true,
          isEnabled: c.is_enabled !== false,
          subcategories: c.subcategories || []
        }))
      });
    } catch (err) {
      console.error('Failed to fetch public data', err);
    }
  },

  fetchAdminProducts: async () => {
    const token = get().authToken;
    if (!token) return;
    try {
      const res = await fetch(`${ADMIN_API}/admin/products/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const prods = await res.json();
        set({
          products: prods.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            basePrice: p.base_price,
            originalPrice: p.original_price,
            categoryId: p.category_id || p.categoryId || null,
            categoryName: p.category_name || p.categoryName || 'Uncategorized',
            images: p.images || [],
            badge: p.badge,
            discountBadge: p.discount_badge || '',
            inStock: p.in_stock,
            stockQuantity: p.stock_quantity,
            lowStockThreshold: p.low_stock_threshold || 5,
            isPublished: p.is_published !== false,
            isFeatured: p.is_featured,
            ageGroup: p.age_group,
            rating: p.rating || 5.0,
            reviewCount: p.review_count || 0
          }))
        });
      }
    } catch (err) {
      console.error('Failed to fetch admin products', err);
    }
  },

  fetchAdminCategories: async () => {
    const token = get().authToken;
    if (!token) return;
    try {
      const res = await fetch(`${ADMIN_API}/admin/categories/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const cats = await res.json();
        set({
          categories: cats.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            image: c.image,
            description: c.description,
            itemCount: c.item_count || 0,
            color: c.color || '#FEF3C7',
            iconName: c.icon_name || c.icon || 'Shapes',
            featured: c.featured ?? true,
            isEnabled: c.is_enabled !== false,
            subcategories: c.subcategories || []
          }))
        });
      }
    } catch (err) {
      console.error('Failed to fetch admin categories', err);
    }
  },

  fetchAdminOrders: async () => {
    const token = get().authToken;
    if (!token) return;
    try {
      const res = await fetch(`${ADMIN_API}/admin/orders/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const orders = await res.json();
        set({
          orders: orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.order_number,
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            customerPhone: o.customer_phone,
            address: o.shipping_address || o.address || '',
            city: o.city,
            paymentMethod: o.payment_method,
            status: o.status || 'Pending',
            subtotal: o.subtotal,
            shippingFee: o.shipping_fee,
            discountAmount: o.discount_amount,
            totalAmount: o.total_amount,
            createdAt: o.created_at,
            items: (o.items || []).map((i: any) => ({
              productId: i.product_id,
              productName: i.product_name,
              productImage: i.product_image || '',
              price: i.price,
              quantity: i.quantity,
              variantName: i.variant_name
            }))
          }))
        });
      }
    } catch (err) {
      console.error('Failed to fetch admin orders', err);
    }
  },

  fetchAdminUsers: async () => {
    const token = get().authToken;
    if (!token) return;
    try {
      const res = await fetch(`${ADMIN_API}/admin/users/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const users = await res.json();
        set({
          users: users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            address: u.address || '',
            city: u.city || '',
            role: u.role,
            status: u.is_active ? 'Active' : 'Suspended',
            joinedDate: u.created_at?.split('T')[0] || ''
          }))
        });
      }
    } catch (err) {
      console.error('Failed to fetch admin users', err);
    }
  },

  fetchAdminData: async () => {
    const token = get().authToken;
    if (!token) return;

    set({ isLoadingAdminData: true });
    try {
      await Promise.all([
        get().fetchAdminProducts(),
        get().fetchAdminCategories(),
        get().fetchAdminOrders(),
        get().fetchAdminUsers()
      ]);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      set({ isLoadingAdminData: false });
    }
  },

  fetchInventoryStats: async () => {
    const token = get().authToken;
    try {
      const res = await fetch(`${ADMIN_API}/admin/inventory/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch inventory stats');
      const stats = await res.json();
      set({ inventoryStats: stats });
    } catch (err) {
      console.error('Failed to fetch inventory stats', err);
    }
  },

  refreshInventoryStats: async () => {
    await get().fetchInventoryStats();
  },

  // Stock Management Actions
  adjustStock: async (productId, delta) => {
    const token = get().authToken;
    try {
      const res = await fetch(`${ADMIN_API}/admin/inventory/${productId}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ delta })
      });
      if (!res.ok) throw new Error('Failed to adjust stock');
      await get().fetchAdminProducts();
      await get().refreshInventoryStats();
      get().showToast('Stock updated');
    } catch (err: any) {
      get().showToast(`Error: ${err.message}`);
    }
  },

  setStockQuantity: async (productId, quantity) => {
    const token = get().authToken;
    try {
      const res = await fetch(`${ADMIN_API}/admin/inventory/${productId}/set-quantity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      if (!res.ok) throw new Error('Failed to update stock quantity');
      await get().fetchAdminProducts();
      await get().refreshInventoryStats();
    } catch (err: any) {
      get().showToast(`Error: ${err.message}`);
    }
  },

  batchRestock: async (productIds, amount) => {
    const token = get().authToken;
    try {
      const res = await fetch(`${ADMIN_API}/admin/inventory/batch-adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_ids: productIds, delta: amount })
      });
      if (!res.ok) throw new Error('Failed to batch restock');
      await get().fetchAdminProducts();
      await get().refreshInventoryStats();
      get().showToast(`Restocked ${productIds.length} items with +${amount} units each`);
    } catch (err: any) {
      get().showToast(`Error: ${err.message}`);
    }
  },

  // Admin Actions
  addProduct: async (newProdData) => {
    const token = get().authToken;
    try {
      const payload = {
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
        in_stock: newProdData.inStock,
        stock_quantity: newProdData.stockQuantity,
        is_featured: false,
        age_group: newProdData.ageGroup,
        images: newProdData.images
      };

      const res = await fetch(`${ADMIN_API}/admin/products/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create product');

      await get().fetchAdminData();
      get().showToast(`Product "${newProdData.name}" created successfully!`);
    } catch (err: any) {
      get().showToast(`Error: ${err.message}`);
    }
  },

  updateProduct: async (id, updated) => {
    const token = get().authToken;
    try {
      const payload: any = {};
      if (updated.name !== undefined) payload.name = updated.name;
      if (updated.description !== undefined) payload.description = updated.description;
      if (updated.price !== undefined) payload.price = updated.price;
      if (updated.basePrice !== undefined) payload.base_price = updated.basePrice;
      if (updated.originalPrice !== undefined) payload.original_price = updated.originalPrice;
      if (updated.categoryId !== undefined) payload.category_id = updated.categoryId;
      if (updated.categoryName !== undefined) payload.category_name = updated.categoryName;
      if (updated.badge !== undefined) payload.badge = updated.badge;
      if (updated.discountBadge !== undefined) payload.discount_badge = updated.discountBadge;
      if (updated.inStock !== undefined) payload.in_stock = updated.inStock;
      if (updated.stockQuantity !== undefined) payload.stock_quantity = updated.stockQuantity;
      if (updated.ageGroup !== undefined) payload.age_group = updated.ageGroup;
      if (updated.isPublished !== undefined) payload.is_published = updated.isPublished;
      if (updated.images !== undefined) payload.images = updated.images;

      const res = await fetch(`${ADMIN_API}/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update product');

      await get().fetchAdminData();
      get().showToast('Product updated successfully!');
    } catch (err: any) {
      get().showToast(`Error: ${err.message}`);
    }
  },

  deleteProduct: async (id) => {
    const token = get().authToken;
    try {
      const res = await fetch(`${ADMIN_API}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      await get().fetchAdminData();
      get().showToast('Product deleted');
    } catch (err: any) {
      get().showToast(`Error: ${err.message}`);
    }
  },

  addCategory: async (newCatData) => {
    const token = get().authToken;
    try {
      const payload = {
        name: newCatData.name,
        slug: newCatData.slug || newCatData.name.toLowerCase().replace(/\s+/g, '-'),
        description: newCatData.description,
        image: newCatData.image,
        is_enabled: newCatData.isEnabled !== false,
        subcategories: (newCatData.subcategories || []).filter(Boolean),
        icon: newCatData.iconName || 'Shapes',
        color: newCatData.color || '#FEF3C7',
        featured: newCatData.featured ?? true
      };

      const res = await fetch(`${ADMIN_API}/admin/categories/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create category');

      await get().fetchAdminData();
      get().showToast(`Category "${newCatData.name}" added!`);
    } catch (err: any) {
      get().showToast(`Error: ${err.message}`);
    }
  },

  updateCategory: async (id, updated) => {
    const token = get().authToken;
    try {
      const payload: any = {};
      if (updated.name !== undefined) payload.name = updated.name;
      if (updated.slug !== undefined) payload.slug = updated.slug;
      if (updated.description !== undefined) payload.description = updated.description;
      if (updated.image !== undefined) payload.image = updated.image;
      if (updated.isEnabled !== undefined) payload.is_enabled = updated.isEnabled;
      if (updated.subcategories !== undefined) payload.subcategories = updated.subcategories.filter(Boolean);
      if (updated.iconName !== undefined) payload.icon = updated.iconName;
      if (updated.color !== undefined) payload.color = updated.color;
      if (updated.featured !== undefined) payload.featured = updated.featured;

      const res = await fetch(`${ADMIN_API}/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update category');

      await get().fetchAdminData();
      get().showToast('Category updated');
    } catch (err: any) {
      get().showToast(`Error: ${err.message}`);
    }
  },

  deleteCategory: async (id) => {
    const token = get().authToken;
    try {
      const res = await fetch(`${ADMIN_API}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete category');
      await get().fetchAdminData();
      get().showToast('Category removed');
    } catch (err: any) {
      get().showToast(`Error: ${err.message}`);
    }
  },

  addOrder: async (order) => {
    try {
      const payload = {
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        shipping_address: order.address,
        city: order.city,
        payment_method: order.paymentMethod,
        subtotal: order.totalAmount,
        shipping_fee: 0,
        discount_amount: 0,
        total_amount: order.totalAmount,
        items: order.items.map((item) => ({
          product_id: item.productId,
          product_name: item.productName,
          variant_name: item.variantName,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const res = await fetch(`${ADMIN_API}/admin/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || 'Failed to place order');
      }

      const created = await res.json();
      const mappedOrder = {
        id: created.id,
        orderNumber: created.order_number,
        customerName: created.customer_name,
        customerEmail: created.customer_email,
        customerPhone: created.customer_phone,
        address: created.shipping_address,
        city: created.city,
        paymentMethod: created.payment_method,
        status: created.status || 'Pending',
        subtotal: created.subtotal,
        shippingFee: created.shipping_fee,
        discountAmount: created.discount_amount,
        totalAmount: created.total_amount,
        createdAt: created.created_at,
        items: (created.items || []).map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          productImage: '',
          price: item.price,
          quantity: item.quantity,
          variantName: item.variant_name
        }))
      };

      set((state) => ({ orders: [mappedOrder, ...state.orders] }));
      get().showToast('Order placed successfully');
    } catch (err: any) {
      get().showToast(`Error: ${err.message}`);
    }
  },

  updateOrderStatus: async (orderId, status) => {
    const token = get().authToken;
    try {
      const res = await fetch(`${ADMIN_API}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error('Failed to update order status');

      await get().fetchAdminData();
      get().showToast(`Order status updated to ${status}`);
    } catch (err: any) {
      get().showToast(`Error: ${err.message}`);
    }
  },

  addUser: async (newUserData) => {
    // For admin creating users manually if needed
    get().showToast('User registration via admin endpoint available');
  },

  updateUserStatus: async (userId, status) => {
    const token = get().authToken;
    try {
      const res = await fetch(`${ADMIN_API}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: status === 'Active' })
      });

      if (!res.ok) throw new Error('Failed to update user status');

      await get().fetchAdminData();
      get().showToast(`User status updated to ${status}`);
    } catch (err: any) {
      get().showToast(`Error: ${err.message}`);
    }
  },

  deleteUser: async (userId) => {
    get().showToast('User deletion not permitted');
  },

  loginAdmin: async (email, pass) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', pass);

      const res = await fetch(`${AUTH_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, message: err.detail || 'Invalid email or password' };
      }

      const data = await res.json();
      const token = data.access_token;
      
      localStorage.setItem('admin_token', token);
      set({ isAdminAuthenticated: true, authToken: token });
      
      // Fetch initial live admin data
      await get().fetchAdminData();

      get().showToast('Admin authenticated successfully! Welcome back.');
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection error to Auth service' };
    }
  },

  logoutAdmin: () => {
    localStorage.removeItem('admin_token');
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
    return {
      threshold,
      remaining,
      percentage,
      isFree: total >= threshold
    };
  }
}));
