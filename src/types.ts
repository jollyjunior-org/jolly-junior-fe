export interface ProductVariant {
  id: string;
  name: string; // e.g., 'Pink', 'Blue', 'Small'
  price: number;
  originalPrice?: number;
  image?: string;
  inStock: boolean;
  stockQuantity: number;
}

export interface ProductReview {
  id: string;
  userName: string;
  userAvatar?: string;
  city?: string;
  photoUrl?: string;
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
  categoryId: string; // category UUID
  categorySlug?: string; // category slug for filters / home rails
  categoryName: string;
  price: number; // in PKR Rs.
  basePrice?: number;
  originalPrice?: number;
  discountBadge?: number | null; // integer percent in DB (e.g. 10); UI shows "10% OFF"
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
  tagIds?: string[];
  tags?: StoreTag[];
  reviews?: ProductReview[];
  frequentlyBoughtTogetherId?: string; // product ID for bundle recommendation
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  iconName: string;
  color: string; // pastel background tint for cards
  itemCount: number;
  featured?: boolean;
  isEnabled?: boolean; // default true
  showInNav?: boolean;
  showInFeatured?: boolean;
  showInFooter?: boolean;
  navOrder?: number;
  tagId?: string | null;
  tagLabel?: string | null;
  tagColor?: string | null;
  subcategories: string[];
}

export interface StoreTag {
  id: string;
  name: string;
  label: string;
  color: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CampaignConfig {
  id: string;
  key: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  campaignType: string;
  startsAt?: string | null;
  endsAt?: string | null;
  backgroundColor?: string;
  backgroundImageUrl?: string | null;
  accentColor?: string;
  maxItems: number;
  sortOrder?: number;
  isActive: boolean;
  tags: StoreTag[];
  tagIds?: string[];
}

export interface CampaignWithProducts {
  campaign: CampaignConfig;
  isLive: boolean;
  products: Product[];
  serverTime: string;
}

export interface HeroSlideConfig {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  buttonText: string;
  accentColor: string;
  linkType: string;
  linkValue?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface HomeSectionConfig {
  id: string;
  key: string;
  title: string;
  subtitle?: string;
  sectionBadge?: string;
  sourceType: string;
  sourceValue?: string | null;
  maxItems: number;
  sortOrder: number;
  isActive?: boolean;
  showInNav?: boolean;
  tagId?: string | null;
  tagLabel?: string | null;
  tagColor?: string | null;
}

export interface NavSectionChip {
  id: string;
  name: string;
  slug: string;
  kind: 'section';
  sourceType: string;
  sourceValue?: string | null;
  tagLabel?: string | null;
  tagColor?: string | null;
  sortOrder?: number;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface StorefrontConfig {
  tags: StoreTag[];
  navCategories: Category[];
  featuredCategories: Category[];
  footerCategories: Category[];
  heroSlides: HeroSlideConfig[];
  homeSections: HomeSectionConfig[];
  navSectionChips: NavSectionChip[];
  footerInstagramUrl?: string;
  footerFacebookUrl?: string;
  whatsappNumber?: string;
  socialLinks?: SocialLink[];
}


export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface FilterState {
  categoryId: string | null;
  /** Multi-select category slugs for shop filter checkboxes */
  categoryIds: string[];
  searchQuery: string;
  ageGroup: string | null;
  priceRange: [number, number];
  sortBy: 'featured' | 'price-low-high' | 'price-high-low' | 'rating' | 'newest';
  onSaleOnly: boolean;
  inStockOnly: boolean;
  /** Active sale campaign key (e.g. azaadi-sale) — filters by campaign tags */
  saleKey: string | null;
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
  id?: number; // backend order_items.id — needed for partial returns
  productId: string;
  productName: string;
  productImage: string;
  variantName?: string;
  price: number;
  quantity: number;
}

export interface OrderReturnItem {
  id: number;
  orderItemId: number;
  productId: string;
  productName: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  lineAmount: number;
  reason?: string;
}

export interface OrderReturn {
  id: string;
  returnNumber: string;
  orderId: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  refundAmount: number;
  stockRestored: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderReturnItem[];
}

export interface Order {
  id: string; // e.g. 'JJ-1001'
  orderNumber?: string; // backend order_number when available
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  paymentMethod: 'COD' | 'Card' | 'WhatsApp';
  items: OrderItem[];
  returns?: OrderReturn[];
  totalAmount: number;
  originalTotalAmount?: number;
  originalSubtotal?: number;
  status: 'Pending' | 'Processing' | 'Confirmed' | 'Packing' | 'Packed' | 'Ready For Dispatch' | 'Shipped' | 'Delivered' | 'Completed' | 'Cancelled' | 'Returned' | 'Refunded';
  stockDeducted?: boolean;
  createdAt: string;
  notes?: string;
  /** Linked customer user id when logged in at checkout */
  userId?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
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
