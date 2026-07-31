import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';
import { adminEndpoints } from '@/api/endpoints/admin';
import { mapProduct } from '@/services/mappers';
import type { Product } from '@/types';

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

/**
 * GET admin product list (includes unpublished).
 * Args: categorySlugById — optional UUID→slug map
 * Returns: Product[]
 */
export async function fetchAdminProducts(
  categorySlugById?: Map<string, string>,
): Promise<Product[]> {
  const data = await apiFetch<Record<string, unknown>[]>(adminEndpoints.products());
  return (data || []).map((p) => mapProduct(p, categorySlugById));
}

/**
 * POST create product.
 * Args: payload — snake_case body for the admin API
 * Returns: raw created product JSON
 */
export async function createProduct(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetch(adminEndpoints.products(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * PUT update product by id.
 * Args: id, payload — fields to update
 */
export async function updateProduct(
  id: string,
  payload: Record<string, unknown>,
): Promise<unknown> {
  return apiFetch(adminEndpoints.product(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * DELETE product by id.
 * Args: id — product UUID
 */
export async function deleteProduct(id: string): Promise<unknown> {
  return apiFetch(adminEndpoints.product(id), { method: 'DELETE' });
}
