'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ImageOff } from 'lucide-react';
import { getOptimizedImageUrl, isImagePreloaded, preloadImage } from '@/utils/cdn-image';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  loaderSize?: 'sm' | 'md' | 'lg';
  fallbackText?: string;
  targetWidth?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  loaderSize = 'md',
  fallbackText,
  targetWidth,
  style,
  onLoad,
  onError,
  ...props
}) => {
  const imageSrcStr = typeof src === 'string' ? src : '';
  const optimizedSrc = getOptimizedImageUrl(imageSrcStr, targetWidth);
  const imgRef = useRef<HTMLImageElement>(null);

  const [loaded, setLoaded] = useState(() => {
    if (!optimizedSrc) return false;
    return isImagePreloaded(optimizedSrc, targetWidth);
  });

  const [error, setError] = useState(false);

  useEffect(() => {
    if (!optimizedSrc) {
      setLoaded(false);
      setError(false);
      return;
    }

    if (isImagePreloaded(optimizedSrc, targetWidth)) {
      setLoaded(true);
      setError(false);
      return;
    }

    setLoaded(false);
    setError(false);

    // Preload image object in browser memory
    preloadImage(optimizedSrc, targetWidth);

    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setLoaded(true);
      }
    }
  }, [optimizedSrc, targetWidth]);

  const spinnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      data-protected-image="true"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className={`relative overflow-hidden select-none ${containerClassName || 'w-full h-full'}`}
    >
      {/* Invisible Overlay Shield Layer preventing direct right click / drag saving */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[5] bg-transparent select-none"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />

      {/* Loading Skeleton & Spinner */}
      {!loaded && !error && optimizedSrc && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 animate-pulse">
          <Loader2 className={`${spinnerSizes[loaderSize]} text-[#0798AE] animate-spin drop-shadow-xs`} />
        </div>
      )}

      {/* Error Fallback */}
      {error || !optimizedSrc ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center">
          <ImageOff className={`${spinnerSizes[loaderSize]} mb-1 opacity-60`} />
          {fallbackText && <span className="text-[10px] font-medium">{fallbackText}</span>}
        </div>
      ) : (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          onLoad={(e) => {
            setLoaded(true);
            onLoad?.(e);
          }}
          onError={(e) => {
            setError(true);
            onError?.(e);
          }}
          className={`w-full h-full transition-opacity duration-300 ease-in-out select-none pointer-events-none ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          style={style}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
