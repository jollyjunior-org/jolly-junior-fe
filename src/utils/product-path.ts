import type { Product } from '@/types';

/**
 * Shareable storefront path for a product.
 * Args: product with slug (falls back to id).
 * Returns: e.g. /product/wooden-sorting-tower
 */
export function productPath(product: Pick<Product, 'slug' | 'id'>): string {
  const ref = (product.slug || product.id || '').trim();
  return `/product/${encodeURIComponent(ref)}`;
}
