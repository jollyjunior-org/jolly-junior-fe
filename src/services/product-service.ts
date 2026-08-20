import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';
import { mapProduct } from '@/services/mappers';
import type { Product } from '@/types';

/**
 * GET one published product by UUID or slug.
 * Args: idOrSlug — product id or URL slug
 * Returns: Product
 */
export async function fetchPublicProduct(idOrSlug: string): Promise<Product> {
  const data = await apiFetch<Record<string, unknown>>(publicEndpoints.product(idOrSlug), {
    skipAuth: true,
  });
  return mapProduct(data || {});
}

/**
 * GET related products for "You may also like".
 * Args: idOrSlug — product id or URL slug; limit — max items (default 8)
 * Returns: Product[]
 */
export async function fetchRelatedProducts(
  idOrSlug: string,
  limit = 8,
): Promise<Product[]> {
  const data = await apiFetch<{ items?: Record<string, unknown>[] }>(
    publicEndpoints.relatedProducts(idOrSlug, limit),
    { skipAuth: true },
  );
  return (data.items || []).map((p) => mapProduct(p));
}

/**
 * GET public published products.
 * Args: categorySlugById — optional UUID→slug map for filters
 * Returns: Product[]
 */
export async function fetchPublicProducts(
  categorySlugById?: Map<string, string>,
): Promise<Product[]> {
  const data = await apiFetch<Record<string, unknown>[]>(publicEndpoints.products(), {
    skipAuth: true,
  });
  return (data || []).map((p) => mapProduct(p, categorySlugById));
}
