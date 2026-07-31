import { getAccessToken, getCustomerToken, clearAuthStorage, clearCustomerToken } from '@/api/auth-tokens';

type AuthMode = 'admin' | 'customer' | 'none';

type RequestOptions = RequestInit & {
  /** Skip attaching the Bearer token (public / login calls). */
  skipAuth?: boolean;
  /** Which token to attach. Default: admin (legacy). */
  authMode?: AuthMode;
};

/**
 * Parse JSON or text body from a Response.
 * Args: res — fetch Response
 * Returns: parsed JSON, raw text, or null
 */
async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Shared HTTP client — attaches Bearer token and throws on non-OK responses.
 * Args: url — full request URL; options — fetch options + skipAuth / authMode
 * Returns: typed response body
 */
export async function apiClient<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth, authMode = 'admin', headers: extraHeaders, ...rest } = options;
  const headers = new Headers(extraHeaders);

  if (!skipAuth && authMode !== 'none') {
    const token = authMode === 'customer' ? getCustomerToken() : getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  // Don't force JSON content-type for FormData (multipart uploads)
  const isFormData = typeof FormData !== 'undefined' && rest.body instanceof FormData;
  if (rest.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...rest, headers });
  const body = await parseBody(res);

  if (res.status === 401 && !skipAuth) {
    if (authMode === 'customer') clearCustomerToken();
    else clearAuthStorage();
  }

  if (!res.ok) {
    const detail =
      typeof body === 'object' && body && 'detail' in body
        ? String((body as { detail: unknown }).detail)
        : res.statusText;
    throw new Error(detail || 'Request failed');
  }

  return body as T;
}

/** Drop-in alias used by service modules. */
export async function apiFetch<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  return apiClient<T>(url, options);
}
