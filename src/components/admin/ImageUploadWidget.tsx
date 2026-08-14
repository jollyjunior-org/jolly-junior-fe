import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage, type AdminUploadFolder } from '@/services/upload-service';

/** Result returned by the widget after a successful upload. */
export interface UploadedImage {
  public_id: string;
  secure_url: string;
}

interface ImageUploadWidgetProps {
  /** Existing image — either a full {public_id, secure_url} object or a plain URL string (legacy). */
  initialImage?: UploadedImage | string | null;
  /** Called with the uploaded image object, or null when the image is cleared. */
  onUploadSuccess: (result: UploadedImage | null) => void;
  /** Cloudinary folder key — keeps storage organised */
  folder?: AdminUploadFolder;
  /**
   * Entity or session ID used to scope the Cloudinary sub-folder.
   * For existing entities pass the real ID; for new items pass a temp session UUID.
   */
  entityId?: string;
}

/** Downscale an image file to a maximum bounding box, preserving aspect ratio. */
const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob | null> =>
  new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      let { width, height } = img;
      const ratio = width / height;

      if (width > maxWidth) { width = maxWidth; height = Math.round(width / ratio); }
      if (height > maxHeight) { height = maxHeight; width = Math.round(height * ratio); }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(objectUrl); resolve(null); return; }

      ctx.drawImage(img, 0, 0, width, height);
      const mime = ['image/png', 'image/webp'].includes(file.type) ? file.type : 'image/jpeg';
      canvas.toBlob((blob) => { URL.revokeObjectURL(objectUrl); resolve(blob); }, mime, 0.82);
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(null); };
    img.src = objectUrl;
  });

/** Extract the display URL from an initialImage prop (handles both string and UploadedImage). */
function resolveInitialUrl(initial: UploadedImage | string | null | undefined): string | null {
  if (!initial) return null;
  if (typeof initial === 'string') return initial || null;
  return initial.secure_url || null;
}

export const ImageUploadWidget: React.FC<ImageUploadWidgetProps> = ({
  initialImage,
  onUploadSuccess,
  folder = 'products',
  entityId,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(resolveInitialUrl(initialImage));
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      const blob = await resizeImage(file, 1200, 1200);
      if (!blob) { setError('Failed to resize image'); return; }

      // Show local preview immediately while uploading
      const localUrl = URL.createObjectURL(blob);
      setPreviewUrl(localUrl);
      setIsUploading(true);
      setError(null);

      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const filename = `${file.name.replace(/\.[^.]+$/, '')}.${ext}`;

      const formData = new FormData();
      formData.append('file', blob, filename);
      if (entityId) {
        formData.append('entity_id', entityId);
        formData.append('session_id', entityId);
      }

      const data = await uploadImage(formData, folder);

      if (data.secure_url) {
        setPreviewUrl(data.secure_url);
        onUploadSuccess({ public_id: data.public_id, secure_url: data.secure_url });
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      console.error('Upload error:', err);
      setError(msg);
      // Revert to original image on failure
      setPreviewUrl(resolveInitialUrl(initialImage));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreviewUrl(null);
    setError(null);
    onUploadSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[#E2E8F0] group">
          <img
            src={previewUrl}
            alt="Upload preview"
            className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : ''}`}
          />

          <button
            onClick={clearImage}
            className="absolute top-2 right-2 z-20 p-2 bg-rose-500/90 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
            aria-label="Remove uploaded image"
          >
            <X className="w-4 h-4" />
          </button>

          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                className="px-3 py-1.5 bg-white text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
              >
                Change
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-[#E2E8F0] rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50 transition-all cursor-pointer bg-slate-50/50"
        >
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
            <Upload className="w-5 h-5 text-sky-500" />
          </div>
          <span className="text-sm font-medium">Click to upload image</span>
          <span className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP · max 1200 × 1200 px</span>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-rose-500 font-medium flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
};
