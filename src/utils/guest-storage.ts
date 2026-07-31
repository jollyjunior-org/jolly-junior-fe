/** Guest cart / wishlist localStorage helpers. */

import type { CartItem, Product, ProductVariant } from '@/types';

const CART_KEY = 'jj_guest_cart';
const WISHLIST_KEY = 'jj_guest_wishlist';

export type GuestCartLine = {
  productId: string;
  variantId?: string;
  quantity: number;
  /** Snapshot for restore before products load */
  product?: Product;
  variant?: ProductVariant;
};

/** Load guest cart lines from localStorage. */
export function loadGuestCart(): GuestCartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Persist guest cart (product ids + qty; keep light snapshot). */
export function saveGuestCart(cart: CartItem[]): void {
  const lines: GuestCartLine[] = cart.map((item) => ({
    productId: item.product.id,
    variantId: item.variant?.id,
    quantity: item.quantity,
    product: item.product,
    variant: item.variant,
  }));
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
}

/** Load wishlist product ids. */
export function loadGuestWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** Persist wishlist product ids. */
export function saveGuestWishlist(ids: string[]): void {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

/** Clear guest cart after successful server merge. */
export function clearGuestCartStorage(): void {
  localStorage.removeItem(CART_KEY);
}

/** Clear guest wishlist after merge. */
export function clearGuestWishlistStorage(): void {
  localStorage.removeItem(WISHLIST_KEY);
}
