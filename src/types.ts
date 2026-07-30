export interface ProductVariant {
  id: string;
  name: string; // e.g., 'Small', 'Medium', 'Large', or 'Pastel Blue', 'Soft Pink'
  price: number;
  originalPrice?: number;
  image?: string;
  inStock: boolean;
}

export interface ProductReview {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  productVariant?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string; // e.g. 'educational-toys', 'baby-toys', 'feeding', 'bath-care', 'newborn-essentials', 'mom-essentials', 'outdoor-toys', 'gift-sets'
  categoryName: string;
  price: number; // in PKR Rs.
  basePrice?: number;
  originalPrice?: number;
  discountBadge?: string; // e.g. '20% OFF', 'FLASH SALE'
  badge?: 'Best Seller' | 'New' | 'Flash Sale' | 'Must Have' | 'Trending';
  rating: number;
  reviewCount: number;
  images: string[];
  hoverImage?: string;
  videoPreviewUrl?: string; // optional MP4 or webm loop preview
  description: string;
  features: string[];
  ageGroup: '0-6M' | '6-12M' | '1-3Y' | '3-5Y' | '5Y+';
  variants?: ProductVariant[];
  inStock: boolean;
  stockQuantity: number; // live inventory remaining count
  lowStockThreshold?: number; // default 5 for warning
  isPublished?: boolean; // default true
  reviews?: ProductReview[];
  frequentlyBoughtTogetherId?: string; // product ID for bundle recommendation
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  iconName: string;
  color: string; // pastel background tint for cards
  itemCount: number;
  featured?: boolean;
  isEnabled?: boolean; // default true
  subcategories: string[];
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface FilterState {
  categoryId: string | null;
  searchQuery: string;
  ageGroup: string | null;
  priceRange: [number, number];
  sortBy: 'featured' | 'price-low-high' | 'price-high-low' | 'rating' | 'newest';
  onSaleOnly: boolean;
  inStockOnly: boolean;
}

export interface OrderDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: 'COD' | 'Card' | 'WhatsApp';
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  variantName?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string; // e.g. 'JJ-1001'
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  paymentMethod: 'COD' | 'Card' | 'WhatsApp';
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Packing' | 'Packed' | 'Ready For Dispatch' | 'Shipped' | 'Delivered' | 'Completed' | 'Cancelled' | 'Returned' | 'Refunded';
  createdAt: string;
  notes?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: 'Active' | 'Suspended';
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  categorySlug: string;
  buttonText: string;
  image: string;
  tag: string;
  bgGradient: string;
}
