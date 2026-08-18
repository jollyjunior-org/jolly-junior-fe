'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ImageOff } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  loaderSize?: 'sm' | 'md' | 'lg';
  fallbackText?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  loaderSize = 'md',
  fallbackText,
  style,
  onLoad,
  onError,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Reset states when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  const spinnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName || 'w-full h-full'}`}>
      {/* Loading Skeleton & Spinner */}
      {!loaded && !error && src && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-r from-slate-100 via-slate-200/80 to-slate-100 animate-pulse">
          <Loader2 className={`${spinnerSizes[loaderSize]} text-[#0798AE] animate-spin drop-shadow-xs`} />
        </div>
      )}

      {/* Error Fallback */}
      {(error || !src) ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center">
          <ImageOff className={`${spinnerSizes[loaderSize]} mb-1 opacity-60`} />
          {fallbackText && <span className="text-[10px] font-medium">{fallbackText}</span>}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={(e) => {
            setLoaded(true);
            onLoad?.(e);
          }}
          onError={(e) => {
            setError(true);
            onError?.(e);
          }}
          className={`w-full h-full transition-opacity duration-500 ease-in-out ${
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
