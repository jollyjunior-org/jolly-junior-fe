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
  delivery_fee?: number;
  free_delivery_threshold?: number;
  footer_instagram_url?: string | null;
  footer_facebook_url?: string | null;
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
