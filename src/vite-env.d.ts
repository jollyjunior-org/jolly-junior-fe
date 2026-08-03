/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Auth service — login, OTP, register */
  readonly VITE_AUTH_API_BASE_URL?: string;
  /** Admin service — products, orders, CMS, settings */
  readonly VITE_ADMIN_API_BASE_URL?: string;
  /** Public / store service — catalog, cart, checkout, storefront */
  readonly VITE_PUBLIC_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
