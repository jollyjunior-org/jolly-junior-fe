import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';
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
