import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';

/**
 * Upload an image into a dedicated Cloudinary folder (public).
 * Args: file, folderKey — 'testimonials' | 'avatars'
 */
export async function uploadStoreImage(
  file: File | Blob,
  folderKey: 'testimonials' | 'avatars',
  filename = 'photo.jpg',
): Promise<string> {
  const form = new FormData();
  form.append('file', file, filename);
  form.append('folder', folderKey);
  const data = await apiFetch<{ url: string }>(publicEndpoints.storeUpload(), {
    method: 'POST',
    body: form,
    skipAuth: true,
  });
  return data.url;
}
