/**
 * Read/write admin + customer auth tokens in localStorage.
 */

const ADMIN_TOKEN_KEY = 'admin_token';
const CUSTOMER_TOKEN_KEY = 'customer_token';

/** Get the stored admin JWT, or null if missing. */
export function getAccessToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

/** Persist the admin JWT. */
export function setAccessToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

/** Clear admin auth from localStorage. */
export function clearAuthStorage(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

/** True when an admin token is present. */
export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

/** Get customer JWT (passwordless OTP login). */
export function getCustomerToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

/** Persist customer JWT. */
export function setCustomerToken(token: string): void {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
}

/** Clear customer JWT. */
export function clearCustomerToken(): void {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}

/** True when a customer is signed in. */
export function isCustomerAuthenticated(): boolean {
  return Boolean(getCustomerToken());
}
