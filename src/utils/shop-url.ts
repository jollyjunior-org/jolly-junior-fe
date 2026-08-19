import type { FilterState } from '@/types';

/**
 * Build storefront shop href always on `/` (never under /product/...).
 * Example: /?view=shop&category=baby-toys&categories=baby-toys
 */
export function buildShopHref(filter: Partial<FilterState> & { view?: 'shop' | 'home' }): string {
  const params = new URLSearchParams();
  const view = filter.view ?? 'shop';
  if (view === 'shop') params.set('view', 'shop');

  if (filter.categoryId) params.set('category', filter.categoryId);
  if (filter.categoryIds?.length) params.set('categories', filter.categoryIds.join(','));
  if (filter.subCategory) params.set('subcategory', filter.subCategory);
  if (filter.saleKey) params.set('sale', filter.saleKey);
  if (filter.searchQuery) params.set('q', filter.searchQuery);
  if (filter.onSaleOnly) params.set('deals', '1');

  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

/**
 * Keep shop filters in the URL on the home route `/`.
 * Uses history only when already on `/` — product pages must use Next router.push(buildShopHref).
 */
export function syncShopUrl(
  view: string,
  filter: FilterState,
): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname.toLowerCase().includes('/jj/admin')) return;

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  // Never stick shop query params on /product/... — leave those routes alone here
  if (path !== '/' && path !== '') return;

  const href = buildShopHref({
    ...filter,
    view: view === 'shop' || Boolean(filter.categoryId || filter.subCategory || filter.saleKey || filter.categoryIds?.length)
      ? 'shop'
      : 'home',
  });
  window.history.replaceState(null, '', href);
}

/** Read shop filter bits from the current URL. */
export function readShopUrl(): {
  view?: 'shop';
  categoryId: string | null;
  categoryIds: string[];
  subCategory: string | null;
  saleKey: string | null;
  searchQuery: string;
  onSaleOnly: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      categoryId: null,
      categoryIds: [],
      subCategory: null,
      saleKey: null,
      searchQuery: '',
      onSaleOnly: false,
    };
  }
  const params = new URLSearchParams(window.location.search);
  const categories = (params.get('categories') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    view: params.get('view') === 'shop' ? 'shop' : undefined,
    categoryId: params.get('category'),
    categoryIds: categories,
    subCategory: params.get('subcategory'),
    saleKey: params.get('sale'),
    searchQuery: params.get('q') || '',
    onSaleOnly: params.get('deals') === '1',
  };
}
