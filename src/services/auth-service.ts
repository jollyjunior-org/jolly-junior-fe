import { apiFetch } from '@/api/api-client';
import { authEndpoints } from '@/api/endpoints/auth';

/** Check if current user has a valid session/cookie. */
export async function fetchMe(): Promise<{ id: string; role: string; name: string; email: string }> {
  return apiFetch(authEndpoints.me(), { method: 'GET' });
}
