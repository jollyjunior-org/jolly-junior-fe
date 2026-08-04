import { apiFetch } from '@/api/api-client';
import { adminEndpoints } from '@/api/endpoints/admin';
import { publicEndpoints } from '@/api/endpoints/public';

export type PromoCode = {
  id: string;
  code: string;
  description?: string | null;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses?: number | null;
  used_count: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
};

export type ShippingConfig = {
  deliveryFee: number;
  freeDeliveryThreshold: number;
};

export type AppliedPromo = {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  discountAmount: number;
};

/** Admin: list promo codes. */
export async function fetchAdminPromoCodes(): Promise<PromoCode[]> {
  const data = await apiFetch<PromoCode[]>(adminEndpoints.promoCodes());
  return data || [];
}

/** Admin: create promo. */
export async function createPromoCode(payload: Record<string, unknown>): Promise<PromoCode> {
  return apiFetch<PromoCode>(adminEndpoints.promoCodes(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Admin: update promo. */
export async function updatePromoCode(
  id: string,
  payload: Record<string, unknown>,
): Promise<PromoCode> {
  return apiFetch<PromoCode>(adminEndpoints.promoCode(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/** Admin: delete promo. */
export async function deletePromoCode(id: string): Promise<unknown> {
  return apiFetch(adminEndpoints.promoCode(id), { method: 'DELETE' });
}

/** Public: load delivery fee + free-shipping threshold. */
export async function fetchShippingConfig(): Promise<ShippingConfig> {
  const data = await apiFetch<{
    delivery_fee?: number;
    free_delivery_threshold?: number;
  }>(publicEndpoints.shippingConfig(), { skipAuth: true });
  return {
    deliveryFee: Number(data.delivery_fee ?? 250),
    freeDeliveryThreshold: Number(data.free_delivery_threshold ?? 3000),
  };
}

/**
 * Public: validate promo against cart subtotal via backend.
 * Args: code, subtotal (Rs.)
 * Returns: AppliedPromo or throws / returns invalid shape
 */
export async function validatePromoCode(
  code: string,
  subtotal: number,
): Promise<{
  valid: boolean;
  message: string;
  applied?: AppliedPromo;
}> {
  const data = await apiFetch<{
    valid: boolean;
    code?: string | null;
    discount_type?: 'percent' | 'fixed' | null;
    discount_value?: number | null;
    discount_amount?: number;
    message: string;
  }>(publicEndpoints.promoValidate(), {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ code, subtotal }),
  });

  if (!data.valid || !data.code) {
    return { valid: false, message: data.message || 'Invalid promo code.' };
  }

  return {
    valid: true,
    message: data.message,
    applied: {
      code: data.code,
      discountType: data.discount_type || 'percent',
      discountValue: Number(data.discount_value || 0),
      discountAmount: Number(data.discount_amount || 0),
    },
  };
}
