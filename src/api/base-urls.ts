/**
 * Backend base URLs from Vite environment variables.
 * One VITE_*_API_BASE_URL per microservice (same pattern as multi-service apps).
 * Defaults point at local Docker Compose ports.
 */

export const AUTH_API_BASE_URL =
  import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://localhost:8001/api/v1';

export const ADMIN_API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL ?? 'http://localhost:8002/api/v1';

export const PUBLIC_API_BASE_URL =
  import.meta.env.VITE_PUBLIC_API_BASE_URL ?? 'http://localhost:8003/api/v1';
