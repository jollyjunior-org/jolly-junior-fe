/**
 * CDN image URL optimizer & browser memory preloader.
 */

const preloadedUrls = new Set<string>();

/**
 * Convert raw Cloudinary URLs to CDN-optimized WebP/AVIF format with width bounds.
 * e.g. https://res.cloudinary.com/.../upload/... -> https://res.cloudinary.com/.../upload/f_auto,q_auto,w_600/...
 */
export function getOptimizedImageUrl(url?: string | null, width?: number): string {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  // Cloudinary URL optimization
  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/upload/')) {
    // Avoid duplicate transformations
    if (trimmed.includes('/f_auto,q_auto')) return trimmed;

    const transformParams = width ? `f_auto,q_auto,w_${width}` : 'f_auto,q_auto';
    return trimmed.replace('/upload/', `/upload/${transformParams}/`);
  }

  return trimmed;
}

/** Preload image URL into browser memory */
export function preloadImage(url?: string | null, width?: number): void {
  if (!url || typeof window === 'undefined') return;
  const optimized = getOptimizedImageUrl(url, width);
  if (!optimized || preloadedUrls.has(optimized)) return;

  preloadedUrls.add(optimized);
  const img = new Image();
  img.src = optimized;
}

/** Preload multiple image URLs into browser memory */
export function preloadImages(urls: (string | null | undefined)[], width?: number): void {
  if (!Array.isArray(urls)) return;
  urls.forEach((u) => preloadImage(u, width));
}

/** Check if image URL has been preloaded in memory */
export function isImagePreloaded(url?: string | null, width?: number): boolean {
  if (!url) return false;
  const optimized = getOptimizedImageUrl(url, width);
  return preloadedUrls.has(optimized);
}
