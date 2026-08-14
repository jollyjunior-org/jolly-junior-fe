import { AUTH_API_BASE_URL } from '@/api/base-urls';

const base = `${AUTH_API_BASE_URL}/auth`;

/** Auth service endpoint builders. */
export const authEndpoints = {
  login: () => `${base}/login`,
  register: () => `${base}/register`,
  me: () => `${base}/me`,
  otpRequest: () => `${base}/otp/request`,
  otpVerify: () => `${base}/otp/verify`,
  logout: () => `${base}/logout`,
} as const;
