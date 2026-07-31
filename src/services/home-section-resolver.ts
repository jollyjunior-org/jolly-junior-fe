import type { Product, HomeSectionConfig } from '@/types';

/**
 * Resolve which products belong in a home section based on its source rule.
 * Args: products — catalog; section — CMS home section config
 * Returns: filtered Product[] (capped by maxItems)
 */
export function productsForHomeSection(
  products: Product[],
  section: HomeSectionConfig,
): Product[] {
  const published = products.filter((p) => p.isPublished !== false);
  const value = (section.sourceValue || '').trim();
  let matched: Product[] = [];

  switch (section.sourceType) {
    case 'badge':
      matched = published.filter((p) => p.badge === value);
      break;
    case 'tag':
      // Match by Tags-list id or internal name (source_value from Control dropdown)
      matched = published.filter((p) =>
        (p.tags || []).some((t) => t.id === value || t.name === value) ||
        (p.tagIds || []).includes(value),
      );
      break;
    case 'category':
      matched = published.filter(
        (p) => p.categoryId === value || p.categorySlug === value,
      );
      break;
    case 'discount':
      matched = published.filter((p) => Boolean(p.discountBadge));
      break;
    case 'rule':
      if (value === 'sale') {
        matched = published.filter((p) => Boolean(p.discountBadge) || p.badge === 'Flash Sale');
      } else if (value === 'newest') {
        matched = [...published];
      } else if (value === 'rating') {
        matched = published.filter((p) => p.rating >= 4.8 || p.badge === 'Best Seller');
      } else {
        matched = published;
      }
      break;
    default:
      matched = published;
  }

  return matched.slice(0, section.maxItems || 12);
}
