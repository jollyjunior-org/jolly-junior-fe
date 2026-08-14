import { apiFetch } from '@/api/api-client';
import { authEndpoints } from '@/api/endpoints/auth';
import { setAccessToken, clearAuthStorage } from '@/api/auth-tokens';

export type LoginResult = {
  access_token: string;
  token_type?: string;
};

/**
 * POST /auth/login — OAuth2 password form; stores JWT on success.
 * Args: email, password
 * Returns: { success, message? }
 */
export async function loginAdmin(
  email: string,
  password: string,
): Promise<{ success: boolean; message?: string; token?: string }> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  try {
    const data = await apiFetch<LoginResult>(authEndpoints.login(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
      skipAuth: true,
    });

    setAccessToken(data.access_token);
    return { success: true, token: data.access_token };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid email or password';
    return { success: false, message };
  }
}

/** Clear admin JWT from storage. */
export function logoutAdmin(): void {
  clearAuthStorage();
}

/** Check if current user (customer or admin) has a valid session/cookie. */
export async function fetchMe(): Promise<{ id: string; role: string; name: string; email: string }> {
  return apiFetch(authEndpoints.me(), { method: 'GET' });
}
