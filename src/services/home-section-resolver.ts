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
      matched = published.filter(
        (p) =>
          (p.tags || []).some((t) => t.id === value || t.name === value) ||
          (p.tagIds || []).includes(value),
      );
      break;
    case 'category': {
      // Support single or multi-category comma-separated IDs/slugs (e.g. "cat1,cat2")
      const catList = value.split(',').map((v) => v.trim()).filter(Boolean);
      if (!catList.length) {
        matched = published;
      } else {
        matched = published.filter(
          (p) =>
            catList.includes(p.categoryId) ||
            (p.categorySlug && catList.includes(p.categorySlug)),
        );
      }
      break;
    }
    case 'category_badge': {
      // Format: "cat1,cat2|BadgeName" (e.g. "baby-care,toys|New")
      const [catsPart, badgePart] = value.split('|');
      const catList = (catsPart || '').split(',').map((v) => v.trim()).filter(Boolean);
      const badgeVal = (badgePart || '').trim();
      matched = published.filter((p) => {
        const inCat =
          !catList.length ||
          catList.includes(p.categoryId) ||
          (p.categorySlug && catList.includes(p.categorySlug));
        const hasBadge = !badgeVal || p.badge === badgeVal;
        return inCat && hasBadge;
      });
      break;
    }
    case 'category_tag': {
      // Format: "cat1,cat2|TagIdOrName" (e.g. "toys|montessori")
      const [catsPart, tagPart] = value.split('|');
      const catList = (catsPart || '').split(',').map((v) => v.trim()).filter(Boolean);
      const tagVal = (tagPart || '').trim();
      matched = published.filter((p) => {
        const inCat =
          !catList.length ||
          catList.includes(p.categoryId) ||
          (p.categorySlug && catList.includes(p.categorySlug));
        const hasTag =
          !tagVal ||
          (p.tags || []).some((t) => t.id === tagVal || t.name === tagVal) ||
          (p.tagIds || []).includes(tagVal);
        return inCat && hasTag;
      });
      break;
    }
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
