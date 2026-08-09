import { apiFetch } from '@/api/api-client';
import { authEndpoints } from '@/api/endpoints/auth';
import { publicEndpoints } from '@/api/endpoints/public';
import { mapProduct } from '@/services/mappers';
import type { CartItem, Product } from '@/types';

/** Request a 6-digit login OTP by email. */
export async function requestLoginOtp(email: string): Promise<{
  ok: boolean;
  message: string;
  dev_code?: string;
}> {
  return apiFetch(authEndpoints.otpRequest(), {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email }),
  });
}

/** Verify OTP and return access token. */
export async function verifyLoginOtp(
  email: string,
  code: string,
): Promise<{ access_token: string; token_type: string }> {
  return apiFetch(authEndpoints.otpVerify(), {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email, code }),
  });
}

/** Merge guest cart into logged-in user's DB cart. */
export async function mergeCustomerCart(cart: CartItem[]): Promise<unknown> {
  return apiFetch(publicEndpoints.meCartMerge(), {
    method: 'POST',
    authMode: 'customer',
    body: JSON.stringify({
      items: cart.map((c) => ({
        product_id: c.product.id,
        variant_id: c.variant?.id || null,
        quantity: c.quantity,
      })),
    }),
  });
}

/** Fetch server cart and map to CartItem-like product ids. */
export async function fetchCustomerCart(): Promise<
  Array<{ productId: string; variantId?: string; quantity: number; product: Product }>
> {
  const data = await apiFetch<{
    items: Array<{
      product_id: string;
      variant_id?: string | null;
      quantity: number;
      product: Record<string, unknown>;
    }>;
  }>(publicEndpoints.meCart(), { authMode: 'customer' });

  return (data.items || []).map((i) => ({
    productId: i.product_id,
    variantId: i.variant_id || undefined,
    quantity: i.quantity,
    product: mapProduct(i.product),
  }));
}

/** Merge guest wishlist ids into DB. */
export async function mergeCustomerWishlist(productIds: string[]): Promise<string[]> {
  const data = await apiFetch<{ product_ids: string[] }>(publicEndpoints.meWishlistMerge(), {
    method: 'POST',
    authMode: 'customer',
    body: JSON.stringify({ product_ids: productIds }),
  });
  return data.product_ids || [];
}

/** Fetch wishlist product ids from server. */
export async function fetchCustomerWishlist(): Promise<string[]> {
  const data = await apiFetch<{ product_ids: string[] }>(publicEndpoints.meWishlist(), {
    authMode: 'customer',
  });
  return data.product_ids || [];
}

/** Toggle wishlist on server. */
export async function addWishlistRemote(productId: string): Promise<void> {
  await apiFetch(publicEndpoints.meWishlistItem(productId), {
    method: 'POST',
    authMode: 'customer',
  });
}

export async function removeWishlistRemote(productId: string): Promise<void> {
  await apiFetch(publicEndpoints.meWishlistItem(productId), {
    method: 'DELETE',
    authMode: 'customer',
  });
}

/** Search products via store API. */
export async function searchStoreProducts(q: string): Promise<Product[]> {
  const data = await apiFetch<{ items: Record<string, unknown>[] }>(
    publicEndpoints.search(q),
    { skipAuth: true },
  );
  return (data.items || []).map((p) => mapProduct(p));
}

/**
 * Products for one category (slug or id) — store category API.
 * Args: categoryRef — category slug/uuid; optional query string extras.
 * Returns: Product[]
 */
export async function fetchCategoryProducts(
  categoryRef: string,
  opts?: { page?: number; pageSize?: number; sort?: string; inStock?: boolean },
): Promise<{ items: Product[]; total: number }> {
  const params = new URLSearchParams();
  params.set('page', String(opts?.page || 1));
  params.set('page_size', String(opts?.pageSize || 500));
  if (opts?.sort) params.set('sort', opts.sort);
  if (opts?.inStock != null) params.set('in_stock', String(opts.inStock));
  const data = await apiFetch<{ items: Record<string, unknown>[]; total: number }>(
    publicEndpoints.categoryProducts(categoryRef, params.toString()),
    { skipAuth: true },
  );
  return { items: (data.items || []).map((p) => mapProduct(p)), total: data.total || 0 };
}

/**
 * Store product list with optional multi-category + search.
 * Args: opts — category slugs, q, sort, pagination
 * Returns: Product[] page
 */
export async function fetchStoreProducts(opts?: {
  categoryIds?: string[];
  q?: string;
  sort?: string;
  inStock?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Product[]; total: number }> {
  const params = new URLSearchParams();
  params.set('page', String(opts?.page || 1));
  params.set('page_size', String(opts?.pageSize || 500));
  if (opts?.categoryIds?.length) params.set('category_ids', opts.categoryIds.join(','));
  if (opts?.q) params.set('q', opts.q);
  if (opts?.sort) params.set('sort', opts.sort);
  if (opts?.inStock != null) params.set('in_stock', String(opts.inStock));
  const data = await apiFetch<{ items: Record<string, unknown>[]; total: number }>(
    publicEndpoints.storeProducts(params.toString()),
    { skipAuth: true },
  );
  return { items: (data.items || []).map((p) => mapProduct(p)), total: data.total || 0 };
}

/** Fetch live sales for nav. */
export async function fetchLiveSales(): Promise<
  Array<{
    id: string;
    key: string;
    title: string;
    badge_text?: string | null;
    tag_ids: string[];
  }>
> {
  const data = await apiFetch<{ items: Record<string, unknown>[] }>(publicEndpoints.sales(), {
    skipAuth: true,
  });
  return (data.items || []).map((c) => ({
    id: String(c.id),
    key: String(c.key),
    title: String(c.title ?? ''),
    badge_text: c.badge_text ? String(c.badge_text) : null,
    tag_ids: Array.isArray(c.tag_ids) ? (c.tag_ids as string[]).map(String) : [],
  }));
}

/** Sale products page. */
export async function fetchSaleProducts(
  saleRef: string,
  opts?: { categoryId?: string; page?: number },
): Promise<{ items: Product[]; total: number }> {
  const params = new URLSearchParams();
  params.set('page', String(opts?.page || 1));
  params.set('page_size', '48');
  if (opts?.categoryId) params.set('category_id', opts.categoryId);
  const data = await apiFetch<{ items: Record<string, unknown>[]; total: number }>(
    publicEndpoints.saleProducts(saleRef, params.toString()),
    { skipAuth: true },
  );
  return { items: (data.items || []).map((p) => mapProduct(p)), total: data.total || 0 };
}
