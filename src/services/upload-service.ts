import { apiFetch } from '@/api/api-client';
import { adminEndpoints } from '@/api/endpoints/admin';

export type UploadResult = {
  url: string;
};

/**
 * POST multipart image upload to admin service.
 * Args: formData — FormData with a `file` field
 * Returns: { url } of uploaded image
 */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  return apiFetch<UploadResult>(adminEndpoints.upload(), {
    method: 'POST',
    body: formData,
  });
}
