/**
 * Backend base URLs — Next.js public env (available in the browser).
 * On Vercel, set Public Environment Variables Prefix to NEXT_PUBLIC_
 */

export const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ?? 'http://localhost:8001/api/v1';

export const ADMIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ?? 'http://localhost:8002/api/v1';

export const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_API_BASE_URL ?? 'http://localhost:8003/api/v1';
