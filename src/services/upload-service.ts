import { apiFetch } from '@/api/api-client';
import { adminEndpoints } from '@/api/endpoints/admin';

export type UploadResult = {
  url: string;
  secure_url: string;
  /** Cloudinary public_id — stored directly, eliminates URL-parsing for deletion */
  public_id: string;
  storage: 'cloudinary' | 'local';
  folder?: string;
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
 * POST multipart image upload to admin service into a Cloudinary entity sub-folder.
 * Args:
 *   formData  — FormData with `file` field (+ optional `folder`, `entity_id`, `session_id`)
 *   folderKey — entity type key e.g. 'products', 'categories'
 * Returns: { url, secure_url, public_id, storage }
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

/**
 * Mark all pending_uploads for a session as committed.
 * Call this AFTER a product/category/etc is saved successfully.
 */
export async function commitSession(sessionId: string): Promise<void> {
  await apiFetch(adminEndpoints.uploadCommit(), {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Immediately delete all uncommitted Cloudinary uploads for a session from Cloudinary + DB.
 * Call this when admin cancels a create/edit modal without saving.
 */
export async function cleanupSession(sessionId: string): Promise<void> {
  await apiFetch(adminEndpoints.uploadCleanupSession(sessionId), {
    method: 'POST',
  });
}
