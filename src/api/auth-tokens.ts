/**
 * Read/write admin + customer auth tokens in localStorage.
 */

const ADMIN_TOKEN_KEY = 'admin_token';

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


