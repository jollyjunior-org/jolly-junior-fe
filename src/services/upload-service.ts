import { apiFetch } from '@/api/api-client';
import { adminEndpoints } from '@/api/endpoints/admin';

export type UploadResult = {
  url: string;
};

export type AdminUploadFolder =
  | 'admin'
  | 'products'
  | 'categories'
  | 'hero'
  | 'campaigns'
  | 'testimonials'
  | 'avatars';

/**
 * POST multipart image upload to admin service into a Cloudinary folder.
 * Args: formData — FormData with `file` (+ optional `folder`); folderKey overrides folder field
 * Returns: { url } of uploaded image
 */
export async function uploadImage(
  formData: FormData,
  folderKey: AdminUploadFolder = 'admin',
): Promise<UploadResult> {
  if (!formData.has('folder')) {
    formData.append('folder', folderKey);
  }
  return apiFetch<UploadResult>(adminEndpoints.upload(), {
    method: 'POST',
    body: formData,
  });
}
