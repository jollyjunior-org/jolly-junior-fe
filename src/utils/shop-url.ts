import type { FilterState } from '@/types';

/**
 * Keep shop filters in the URL so refresh restores category / sale / search.
 * Example: ?view=shop&category=educational-toys&sale=azaadi-sale
 */
export function syncShopUrl(
  view: string,
  filter: FilterState,
): void {
  if (typeof window === 'undefined') return;
  // Don't fight admin routes
  if (window.location.pathname.toLowerCase().includes('/jj/admin')) return;

  const params = new URLSearchParams(window.location.search);
  if (view === 'shop') params.set('view', 'shop');
  else params.delete('view');

  if (filter.categoryId) params.set('category', filter.categoryId);
  else params.delete('category');

  if (filter.categoryIds?.length) params.set('categories', filter.categoryIds.join(','));
  else params.delete('categories');

  if (filter.saleKey) params.set('sale', filter.saleKey);
  else params.delete('sale');

  if (filter.searchQuery) params.set('q', filter.searchQuery);
  else params.delete('q');

  if (filter.onSaleOnly) params.set('deals', '1');
  else params.delete('deals');

  const qs = params.toString();
  const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, '', next);
}

/** Read shop filter bits from the current URL. */
export function readShopUrl(): {
  view?: 'shop';
  categoryId: string | null;
  categoryIds: string[];
  saleKey: string | null;
  searchQuery: string;
  onSaleOnly: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      categoryId: null,
      categoryIds: [],
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
    saleKey: params.get('sale'),
    searchQuery: params.get('q') || '',
    onSaleOnly: params.get('deals') === '1',
  };
}
