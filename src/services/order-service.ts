import { apiFetch } from '@/api/api-client';
import { adminEndpoints } from '@/api/endpoints/admin';
import { mapOrder, mapOrderReturn } from '@/services/mappers';
import type { Order, OrderReturn } from '@/types';

/**
 * GET admin orders list.
 * Returns: Order[]
 */
export async function fetchAdminOrders(): Promise<Order[]> {
  const data = await apiFetch<Record<string, unknown>[]>(adminEndpoints.orders());
  return (data || []).map(mapOrder);
}

/**
 * POST create order (guest checkout — no auth).
 * Args: payload — snake_case order body
 * Returns: mapped Order
 */
export async function createOrder(payload: Record<string, unknown>): Promise<Order> {
  const created = await apiFetch<Record<string, unknown>>(adminEndpoints.orders(), {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  return mapOrder(created);
}

/**
 * PATCH update order status.
 * Args: orderId, status
 * Delivered/Completed deducts stock; Cancelled restocks net held qty.
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<unknown> {
  return apiFetch(adminEndpoints.orderStatus(orderId), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/**
 * DELETE an order permanently (admin).
 * Args: orderId — order UUID
 * Returns: API confirmation payload
 */
export async function deleteOrder(orderId: string): Promise<unknown> {
  return apiFetch(adminEndpoints.order(orderId), {
    method: 'DELETE',
  });
}

/**
 * GET returns for one order.
 * Args: orderId
 * Returns: OrderReturn[]
 */
export async function fetchOrderReturns(orderId: string): Promise<OrderReturn[]> {
  const data = await apiFetch<Record<string, unknown>[]>(adminEndpoints.orderReturns(orderId));
  return (data || []).map(mapOrderReturn);
}

export interface CreateReturnPayload {
  reason: string;
  notes?: string;
  processImmediately?: boolean;
  items: Array<{ orderItemId: number; quantity: number; reason?: string }>;
}

/**
 * POST create a return (full or partial) against an order.
 * Restocks returned qty when processImmediately is true (default).
 */
export async function createOrderReturn(
  orderId: string,
  payload: CreateReturnPayload,
): Promise<OrderReturn> {
  const body = {
    reason: payload.reason,
    notes: payload.notes,
    process_immediately: payload.processImmediately !== false,
    items: payload.items.map((item) => ({
      order_item_id: item.orderItemId,
      quantity: item.quantity,
      reason: item.reason,
    })),
  };
  const created = await apiFetch<Record<string, unknown>>(adminEndpoints.orderReturns(orderId), {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return mapOrderReturn(created);
}
