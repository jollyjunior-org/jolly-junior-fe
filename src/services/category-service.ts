import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';
import { adminEndpoints } from '@/api/endpoints/admin';
import { mapCategory } from '@/services/mappers';
import type { Category } from '@/types';

/**
 * GET public enabled categories.
 * Returns: Category[]
 */
export async function fetchPublicCategories(): Promise<Category[]> {
  const data = await apiFetch<Record<string, unknown>[]>(publicEndpoints.categories(), {
    skipAuth: true,
  });
  return (data || []).map(mapCategory);
}

/**
 * GET admin category list.
 * Returns: Category[]
 */
export async function fetchAdminCategories(): Promise<Category[]> {
  const data = await apiFetch<Record<string, unknown>[]>(adminEndpoints.categories());
  return (data || []).map(mapCategory);
}

/**
 * POST create category.
 * Args: payload — snake_case body for the admin API
 */
export async function createCategory(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetch(adminEndpoints.categories(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * PUT update category by id.
 * Args: id, payload
 */
export async function updateCategory(
  id: string,
  payload: Record<string, unknown>,
): Promise<unknown> {
  return apiFetch(adminEndpoints.category(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * DELETE category by id.
 * Args: id — category UUID
 */
export async function deleteCategory(id: string): Promise<unknown> {
  return apiFetch(adminEndpoints.category(id), { method: 'DELETE' });
}
