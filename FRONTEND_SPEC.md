# Frontend Architecture & Specification Guide

This specification details the structure, state management, component hierarchy, and feature set of the **JollyJuniors** E-Commerce Frontend built with **React**, **TypeScript**, **Tailwind CSS**, and **Zustand**.

---

## 1. Core Feature Overview & UI Modules

### 1.1 Storefront & Browsing Experience
* **Hero Banner Slider**: Dynamic promotional banners highlighting seasonal offers and key collections.
* **Flash Sale Banner with Live Timer**: Discounted products with a counting-down timer and badge indicators (`Flash Sale`, `Discount %`).
* **Category Navigation**: 
  * Header nav dropdowns and category pills.
  * Category toggle on/off: Disabled categories and their products are dynamically hidden across the storefront.
* **Filter & Search**:
  * Full-text product search by name, category, or age group with instant auto-complete suggestions in the header.
  * Filtering by Age Group (`0-6M`, `6-12M`, `1-3Y`, `3-5Y`, `5Y+`), Category, Price range, and Sorting (Price Low-to-High, High-to-Low, Newest, Best Sellers).
* **Interactive Product Cards**:
  * Multi-image previews, rating stars, price & original price discount badges.
  * **Live Stock Status Badges**:
    * `Only X Left` (Low Stock Alert).
    * `Out of Stock` (Disabled order buttons).
  * Wishlist toggle (heart icon).
  * Quick View Modal trigger.
  * Direct "Add to Cart" and "Order via WhatsApp" actions (disabled when out of stock).

### 1.2 Product Detail Modal & Quick View
* **Gallery & Zoom**: High-resolution image switcher.
* **Variant Selection**: Select color/size variants (e.g. Peach Cream, Dusty Blue) with live price updates.
* **Inventory Availability Display**: Real-time indicator showing unit availability (`In Stock - X available`, `Low Stock`, or `Out of Stock`).
* **Frequently Bought Together Bundle**: Cross-sell section with bundle discount calculations and one-click bundle addition.
* **Reviews & Ratings**: Customer rating breakdown, verified purchase badges, and review submission.

### 1.3 Cart & Checkout Engine
* **Slide-over Cart Drawer**:
  * Live quantity adjustment guarded by real-time inventory limits (`stockQuantity`).
  * Free shipping progress bar (threshold calculation).
  * Promo code/Coupon validation engine.
* **Checkout Modal**:
  * Guest or Logged-in checkout flow.
  * Address entry, Cash on Delivery (COD) or Online Payment selection.
  * Live stock deduction upon order completion.
* **Direct WhatsApp Checkout**: Pre-filled structured order message generator with product title, selected variant, price, and customer details.

### 1.4 Admin Portal Modules (`/admin`)
* **Overview Analytics**: Total revenue, orders count, low stock warnings, top performing products, and recent orders feed.
* **Products Manager**:
  * Add/Edit/Delete products with image URLs, descriptions, feature tags, variants, and age groups.
  * Publish toggle (`isPublished`) and live stock quantity assignment (`stockQuantity`).
* **Live Stock & Inventory Audit Tab (`/admin` -> Stock Audit)**:
  * Real-time stock audit table showing remaining units, stock level progress bars, and inventory valuation (Rs.).
  * Quick incremental adjustment buttons (`-10`, `-1`, `+1`, `+10`) and inline editable unit inputs.
  * One-click **Batch Restock** actions for low stock and out of stock items.
  * Individual storefront availability override toggle (`In Stock` / `Disabled`).
* **Categories Manager**:
  * Add/Edit categories and subcategories.
  * Enable/Disable switch (`isEnabled`): Disabling a category hides it from storefront navigation, shop page filters, and featured category grids.
* **Orders Management**:
  * View customer orders, order line items, address, and status update dropdown (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
  * **Stock Auto-Restoration**: Changing an order status to `Cancelled` automatically returns item quantities back to the live product inventory.
* **User Management**: List registered users, role assignments (`customer`, `admin`), order count, and contact info.

---

## 2. Directory & Component Hierarchy

```
src/
├── App.tsx                     # Main application view router
├── types.ts                    # Global TypeScript interfaces
├── main.tsx                    # Entry point mounting React DOM
├── index.css                   # Global CSS & Tailwind imports
├── store/
│   └── useShopStore.ts         # Central Zustand state store
├── data/
│   ├── categories.ts           # Initial categories seed data
│   ├── products.ts             # Initial products seed data
│   ├── initialOrders.ts        # Initial orders seed data
│   └── initialUsers.ts         # Initial users seed data
└── components/
    ├── common/
    │   ├── Header.tsx          # Navigation, search, cart/wishlist icons
    │   ├── Footer.tsx          # Store information, policy links
    │   ├── BrandLogo.tsx       # Logo component
    │   └── Toast.tsx           # Global notification toast
    ├── home/
    │   ├── HeroSlider.tsx      # Main promotional carousel
    │   ├── FeaturedCategories.tsx # Grid of top active categories
    │   ├── FlashSale.tsx       # Flash sale items with live timer
    │   ├── ShopByAge.tsx       # Age-based product filter shortcut
    │   ├── ProductSlider.tsx   # Horizontal scrollable product cards
    │   ├── GiftIdeas.tsx       # Curated gift selector tool
    │   └── InstagramGallery.tsx# Social feed gallery
    ├── product/
    │   ├── ProductCard.tsx     # Reusable product grid item with stock badges
    │   ├── ProductDetailModal.tsx # Full product detail view with variants
    │   └── QuickViewModal.tsx  # Quick view modal dialog
    ├── cart/
    │   ├── CartDrawer.tsx      # Slide-over cart manager
    │   └── WishlistDrawer.tsx  # Saved favorites drawer
    ├── checkout/
    │   └── CheckoutModal.tsx   # Order placement dialog
    ├── shop/
    │   └── ShopPage.tsx        # Main catalog page with filters and sorting
    └── admin/
        ├── AdminDashboard.tsx  # Main admin layout & sidebar/tabs
        ├── AdminOverview.tsx   # Analytics stats & overview cards
        ├── AdminProducts.tsx   # Product creation & list management
        ├── AdminStock.tsx      # Live inventory audit & stock controls
        ├── AdminCategories.tsx # Category enablement & management
        ├── AdminOrders.tsx     # Order status workflow & restock trigger
        └── AdminUsers.tsx      # Customer user list
```

---

## 3. Zustand State Store Contract (`useShopStore`)

The state store handles transient UI state, client-side caching, and action dispatching. When connecting to the FastAPI microservices backend, these store actions will make `fetch`/`axios` requests to the appropriate service REST endpoint.

### Backend Service URL Map (after Docker Compose is running):

| Service | URL | Purpose |
| :--- | :--- | :--- |
| `auth_service` | `http://localhost:8001/api/v1` | Register, Login, Me |
| `admin_service` | `http://localhost:8002/api/v1` | Admin CRUD (products, categories, orders, stock) |
| `jollyjunior_be` | `http://localhost:8003/api/v1` | Public storefront (products, categories, orders) |

```typescript
interface ShopState {
  // Data Collections
  products: Product[];
  categories: Category[];
  orders: Order[];
  users: User[];
  cart: CartItem[];
  wishlist: Product[];
  
  // Auth State
  authToken: string | null;
  currentUser: User | null;

  // Navigation & View State
  currentView: 'home' | 'shop' | 'admin' | 'order-success';
  adminTab: 'overview' | 'products' | 'stock' | 'categories' | 'orders' | 'users';
  selectedProduct: Product | null;
  quickViewProduct: Product | null;
  cartOpen: boolean;
  wishlistOpen: boolean;
  
  // Filters
  filter: {
    categoryId?: string;
    ageGroup?: string;
    searchQuery?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating';
  };

  // Notification Toast
  toastMessage: string | null;

  // Auth Actions (→ auth_service :8001)
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;

  // Store Actions (→ jollyjunior_be :8003)
  setFilter: (filter: Partial<ShopState['filter']>) => void;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, delta: number) => void;
  addOrder: (order: OrderCreatePayload) => Promise<void>;

  // Admin Actions (→ admin_service :8002)
  adjustStock: (productId: string, delta: number) => Promise<void>;
  setStockQuantity: (productId: string, quantity: number) => Promise<void>;
  batchRestock: (productIds: string[], amount: number) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
}
```
