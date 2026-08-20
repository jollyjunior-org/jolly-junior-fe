import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';
import { mapOrder } from '@/services/mappers';
import type { Order } from '@/types';

/**
 * POST create order (guest checkout — no auth).
 * Args: payload — snake_case order body
 * Returns: mapped Order
 */
export async function createOrder(payload: Record<string, unknown>): Promise<Order> {
  const created = await apiFetch<Record<string, unknown>>(publicEndpoints.createOrder(), {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  return mapOrder(created);
}
