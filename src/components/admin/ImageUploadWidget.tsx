import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage } from '@/services/upload-service';

interface ImageUploadWidgetProps {
  initialImage?: string;
  onUploadSuccess: (url: string) => void;
}

const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      const aspectRatio = width / height;
      if (width > maxWidth) {
        width = maxWidth;
        height = Math.round(width / aspectRatio);
      }
      if (height > maxHeight) {
        height = maxHeight;
        width = Math.round(height * aspectRatio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const outputType = ['image/png', 'image/webp'].includes(file.type) ? file.type : 'image/jpeg';
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob);
      }, outputType, 0.8);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
};

export const ImageUploadWidget: React.FC<ImageUploadWidgetProps> = ({ 
  initialImage, 
  onUploadSuccess 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialImage || null);
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
      const resizedBlob = await resizeImage(file, 1200, 1200);
      if (!resizedBlob) {
        setError('Failed to resize image');
        return;
      }

      // Show local preview immediately
      const localUrl = URL.createObjectURL(resizedBlob);
      setPreview(localUrl);
      setIsUploading(true);
      setError(null);

      const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const filename = `${file.name.replace(/\.[^.]+$/, '')}.${extension}`;
      const formData = new FormData();
      formData.append('file', resizedBlob, filename);

      const data = await uploadImage(formData);
      if (data.url) {
        setPreview(data.url);
        onUploadSuccess(data.url);
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
      // Revert preview on failure
      setPreview(initialImage || null);
    } finally {
      setIsUploading(false);
      // Clear input so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreview(null);
    onUploadSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      
      {preview ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[#E2E8F0] group">
          <img 
            src={preview} 
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
          <span className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP up to 5MB</span>
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
