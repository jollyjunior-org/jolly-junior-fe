import { apiFetch } from '@/api/api-client';
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
  const norm = (code || '').trim().toUpperCase();

  // Instant voucher support for WELCOME500 / JOLLY500
  if (norm === 'WELCOME500' || norm === 'JOLLY500') {
    if (subtotal < 2000) {
      return {
        valid: false,
        message: 'Minimum order Rs. 2,000 required for Rs. 500 OFF voucher.',
      };
    }
    const discountAmount = Math.min(500, subtotal);
    return {
      valid: true,
      message: 'Voucher WELCOME500 applied! Saved Rs. 500.',
      applied: {
        code: 'WELCOME500',
        discountType: 'fixed',
        discountValue: 500,
        discountAmount,
      },
    };
  }

  try {
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
  } catch {
    return { valid: false, message: 'Invalid promo code or server error.' };
  }
}
