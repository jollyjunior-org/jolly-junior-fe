import { ADMIN_API_BASE_URL } from '@/api/base-urls';

const base = `${ADMIN_API_BASE_URL}/admin`;

/** Admin service endpoint builders. */
export const adminEndpoints = {
  products: () => `${base}/products/`,
  product: (id: string) => `${base}/products/${id}`,
  categories: () => `${base}/categories/`,
  category: (id: string) => `${base}/categories/${id}`,
  orders: () => `${base}/orders/`,
  order: (id: string) => `${base}/orders/${id}`,
  orderStatus: (id: string) => `${base}/orders/${id}/status`,
  orderReturns: (orderId: string) => `${base}/orders/${orderId}/returns`,
  returns: () => `${base}/returns/`,
  returnItem: (id: string) => `${base}/returns/${id}`,
  returnStatus: (id: string) => `${base}/returns/${id}/status`,
  users: () => `${base}/users/`,
  userStatus: (id: string) => `${base}/users/${id}/status`,
  inventoryDashboard: () => `${base}/inventory/dashboard`,
  inventoryAdjust: (id: string) => `${base}/inventory/${id}/adjust`,
  inventorySetQuantity: (id: string) => `${base}/inventory/${id}/set-quantity`,
  inventoryBatchAdjust: () => `${base}/inventory/batch-adjust`,
  settings: () => `${base}/settings`,
  upload: () => `${base}/upload/`,
  tags: () => `${base}/tags/`,
  tag: (id: string) => `${base}/tags/${id}`,
  heroSlides: () => `${base}/hero-slides/`,
  heroSlide: (id: string) => `${base}/hero-slides/${id}`,
  homeSections: () => `${base}/home-sections/`,
  homeSection: (id: string) => `${base}/home-sections/${id}`,
  campaigns: () => `${base}/campaigns/`,
  campaign: (id: string) => `${base}/campaigns/${id}`,
  emailTemplates: () => `${base}/email-templates`,
  emailTemplate: (id: string) => `${base}/email-templates/${id}`,
} as const;
