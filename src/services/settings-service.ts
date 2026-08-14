import { apiFetch } from '@/api/api-client';
import { adminEndpoints } from '@/api/endpoints/admin';

export type SystemSettingsPayload = {
  cloudinary_cloud_name?: string;
  cloudinary_api_key?: string;
  cloudinary_api_secret?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_from_email?: string;
  smtp_from_name?: string;
  smtp_use_tls?: boolean;
  smtp_use_ssl?: boolean;
  whatsapp_access_token?: string;
  whatsapp_phone_number_id?: string;
  whatsapp_number?: string;
  whatsapp_template_otp?: string;
  whatsapp_template_order_placed?: string;
  whatsapp_template_order_delivered?: string;
  whatsapp_template_order_cancelled?: string;
  has_cloudinary_api_secret?: boolean;
  has_smtp_password?: boolean;
  has_whatsapp_access_token?: boolean;
};

export type StoreSettingsPayload = {
  delivery_fee?: number;
  free_delivery_threshold?: number;
  footer_instagram_url?: string | null;
  footer_facebook_url?: string | null;
  social_links?: Array<{ platform: string; url: string }>;
};


/** GET system settings (Cloudinary + SMTP). */
export async function fetchSettings(): Promise<SystemSettingsPayload> {
  return apiFetch<SystemSettingsPayload>(adminEndpoints.settings());
}

/** POST upsert system settings. */
export async function saveSettings(settings: SystemSettingsPayload): Promise<unknown> {
  return apiFetch(adminEndpoints.settings(), {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}

/** GET store settings. */
export async function fetchStoreSettings(): Promise<StoreSettingsPayload> {
  return apiFetch<StoreSettingsPayload>(adminEndpoints.storeSettings());
}

/** POST upsert store settings. */
export async function saveStoreSettings(settings: StoreSettingsPayload): Promise<unknown> {
  return apiFetch(adminEndpoints.storeSettings(), {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}
