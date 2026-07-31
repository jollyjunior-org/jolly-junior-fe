import { apiFetch } from '@/api/api-client';
import { adminEndpoints } from '@/api/endpoints/admin';
import { mapUser } from '@/services/mappers';
import type { AppUser } from '@/types';

/**
 * GET admin users list.
 * Returns: AppUser[]
 */
export async function fetchAdminUsers(): Promise<AppUser[]> {
  const data = await apiFetch<Record<string, unknown>[]>(adminEndpoints.users());
  return (data || []).map(mapUser);
}

/**
 * PATCH toggle user active status.
 * Args: userId, isActive
 */
export async function updateUserStatus(userId: string, isActive: boolean): Promise<unknown> {
  return apiFetch(adminEndpoints.userStatus(userId), {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
}
