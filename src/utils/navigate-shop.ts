import type { FilterState } from '@/types';
import { buildShopHref } from '@/utils/shop-url';
import { useShopStore } from '@/store/useShopStore';

type RouterLike = { push: (href: string) => void; replace?: (href: string) => void };

/**
 * Navigate to the shop view on `/` with filters (works from product pages too).
 * Also triggers the category/store products API load.
 */
export function goToShop(router: RouterLike, filterPatch: Partial<FilterState>): void {
  const store = useShopStore.getState();
  const nextFilter = { ...store.filter, ...filterPatch };
  store.setFilter(filterPatch);
  store.setCurrentView('shop');
  const slug =
    nextFilter.categoryId ||
    (nextFilter.categoryIds?.length === 1 ? nextFilter.categoryIds[0] : null);
  store.setActiveCategorySlug(slug);
  void store.fetchShopCatalog();
  // Always absolute `/?...` so we leave /product/[slug] instead of sticking query on it
  router.push(buildShopHref({ ...nextFilter, view: 'shop' }));
}

/**
 * Go home on `/` and clear shop filters.
 */
export function goToHome(router: RouterLike): void {
  const store = useShopStore.getState();
  store.resetFilter();
  store.setCurrentView('home');
  store.setActiveCategorySlug(null);
  router.push('/');
}
