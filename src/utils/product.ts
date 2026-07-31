import type { Product } from '@/types';

/**
 * True when product has a Coming Soon merchandising tag (by name or label).
 * Args: product — store Product with optional tags.
 * Returns: whether Add to Cart / purchase should be blocked.
 */
export function isComingSoonProduct(product: Product): boolean {
  const tags = product.tags || [];
  return tags.some((t) => {
    const name = (t.name || '').toLowerCase().replace(/\s+/g, '-');
    const label = (t.label || '').toLowerCase();
    return (
      name === 'coming-soon' ||
      name === 'comingsoon' ||
      label.includes('coming soon')
    );
  });
}
