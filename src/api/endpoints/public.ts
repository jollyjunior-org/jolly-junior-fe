import { PUBLIC_API_BASE_URL } from '@/api/base-urls';

/** Public (customer-facing) catalog endpoint builders. */
export const publicEndpoints = {
  products: () => `${PUBLIC_API_BASE_URL}/products/`,
  /** Product by UUID or slug */
  product: (idOrSlug: string) =>
    `${PUBLIC_API_BASE_URL}/products/${encodeURIComponent(idOrSlug)}`,
  /** Related products ("You may also like") for a product id or slug */
  relatedProducts: (idOrSlug: string, limit = 8) =>
    `${PUBLIC_API_BASE_URL}/products/${encodeURIComponent(idOrSlug)}/related?limit=${limit}`,
  categories: () => `${PUBLIC_API_BASE_URL}/categories/`,
  storefrontConfig: () => `${PUBLIC_API_BASE_URL}/storefront/config`,
  campaign: (key: string) =>
    `${PUBLIC_API_BASE_URL}/storefront/campaigns/${encodeURIComponent(key)}`,
  activeCampaigns: (type?: string) =>
    type
      ? `${PUBLIC_API_BASE_URL}/storefront/campaigns/active?campaign_type=${encodeURIComponent(type)}`
      : `${PUBLIC_API_BASE_URL}/storefront/campaigns/active`,
  productsByTag: (tagRef: string, limit = 50) =>
    `${PUBLIC_API_BASE_URL}/storefront/products/by-tag/${encodeURIComponent(tagRef)}?limit=${limit}`,
  search: (q: string, page = 1, pageSize = 24) =>
    `${PUBLIC_API_BASE_URL}/store/search?q=${encodeURIComponent(q)}&page=${page}&page_size=${pageSize}&sort=relevance`,
  categoryProducts: (categoryRef: string, qs = '') =>
    `${PUBLIC_API_BASE_URL}/store/categories/${encodeURIComponent(categoryRef)}/products${qs ? `?${qs}` : ''}`,
  storeProducts: (qs = '') => `${PUBLIC_API_BASE_URL}/store/products${qs ? `?${qs}` : ''}`,
  shippingConfig: () => `${PUBLIC_API_BASE_URL}/store/shipping-config`,
  promoValidate: () => `${PUBLIC_API_BASE_URL}/store/promo/validate`,
  sales: () => `${PUBLIC_API_BASE_URL}/store/sales`,
  sale: (ref: string) => `${PUBLIC_API_BASE_URL}/store/sales/${encodeURIComponent(ref)}`,
  saleCategories: (ref: string) =>
    `${PUBLIC_API_BASE_URL}/store/sales/${encodeURIComponent(ref)}/categories`,
  saleProducts: (ref: string, qs = '') =>
    `${PUBLIC_API_BASE_URL}/store/sales/${encodeURIComponent(ref)}/products${qs ? `?${qs}` : ''}`,
  meCart: () => `${PUBLIC_API_BASE_URL}/store/me/cart`,
  meCartMerge: () => `${PUBLIC_API_BASE_URL}/store/me/cart/merge`,
  meWishlist: () => `${PUBLIC_API_BASE_URL}/store/me/wishlist`,
  meWishlistItem: (productId: string) =>
    `${PUBLIC_API_BASE_URL}/store/me/wishlist/${encodeURIComponent(productId)}`,
  meWishlistMerge: () => `${PUBLIC_API_BASE_URL}/store/me/wishlist/merge`,
  meProfile: () => `${PUBLIC_API_BASE_URL}/store/me/profile`,
  meAddresses: () => `${PUBLIC_API_BASE_URL}/store/me/addresses`,
  meOrders: () => `${PUBLIC_API_BASE_URL}/store/me/orders`,
  meCreateReturn: (orderId: string) =>
    `${PUBLIC_API_BASE_URL}/store/me/orders/${encodeURIComponent(orderId)}/return`,
  meCancelOrder: (orderId: string) =>
    `${PUBLIC_API_BASE_URL}/store/me/orders/${encodeURIComponent(orderId)}/cancel`,
  meReturns: () => `${PUBLIC_API_BASE_URL}/store/me/returns`,
  testimonials: () => `${PUBLIC_API_BASE_URL}/store/testimonials`,
  testimonialInvite: (token: string) =>
    `${PUBLIC_API_BASE_URL}/store/testimonials/invite/${encodeURIComponent(token)}`,
  storeUpload: () => `${PUBLIC_API_BASE_URL}/store/upload`,
  createOrder: () => `${PUBLIC_API_BASE_URL}/store/orders`,
} as const;
