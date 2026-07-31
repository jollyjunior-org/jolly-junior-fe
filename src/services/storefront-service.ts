import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';
import { adminEndpoints } from '@/api/endpoints/admin';
import { mapCategory } from '@/services/mappers';
import type {
  StoreTag,
  HeroSlideConfig,
  HomeSectionConfig,
  StorefrontConfig,
  NavSectionChip,
  Category,
  CampaignConfig,
  CampaignWithProducts,
  Product,
} from '@/types';
import { mapProduct } from '@/services/mappers';

/** Map public storefront config payload. */
function mapStorefrontConfig(raw: Record<string, unknown>): StorefrontConfig {
  const navCategories = ((raw.navCategories as Record<string, unknown>[]) || []).map(mapCategory);
  const featuredCategories = ((raw.featuredCategories as Record<string, unknown>[]) || []).map(
    mapCategory,
  );
  const footerCategories = ((raw.footerCategories as Record<string, unknown>[]) || []).map(
    mapCategory,
  );

  const tags: StoreTag[] = ((raw.tags as Record<string, unknown>[]) || []).map((t) => ({
    id: String(t.id),
    name: String(t.name ?? ''),
    label: String(t.label ?? ''),
    color: String(t.color ?? '#F97316'),
    sortOrder: Number(t.sort_order ?? 0),
  }));

  const heroSlides: HeroSlideConfig[] = ((raw.heroSlides as Record<string, unknown>[]) || []).map(
    (s) => ({
      id: String(s.id),
      badge: s.badge ? String(s.badge) : undefined,
      title: String(s.title ?? ''),
      subtitle: s.subtitle ? String(s.subtitle) : undefined,
      imageUrl: String(s.image_url ?? s.imageUrl ?? ''),
      buttonText: String(s.button_text ?? s.buttonText ?? 'Shop Now'),
      accentColor: String(s.accent_color ?? s.accentColor ?? '#F59E0B'),
      linkType: String(s.link_type ?? s.linkType ?? 'category'),
      linkValue: (s.link_value ?? s.linkValue ?? null) as string | null,
      sortOrder: Number(s.sort_order ?? 0),
    }),
  );

  const homeSections: HomeSectionConfig[] = (
    (raw.homeSections as Record<string, unknown>[]) || []
  ).map((s) => ({
    id: String(s.id),
    key: String(s.key ?? ''),
    title: String(s.title ?? ''),
    subtitle: s.subtitle ? String(s.subtitle) : undefined,
    sectionBadge: s.section_badge ? String(s.section_badge) : undefined,
    sourceType: String(s.source_type ?? 'badge'),
    sourceValue: (s.source_value ?? null) as string | null,
    maxItems: Number(s.max_items ?? 12),
    sortOrder: Number(s.sort_order ?? 0),
    showInNav: Boolean(s.show_in_nav),
    tagLabel: (s.tag_label as string | null) ?? null,
    tagColor: (s.tag_color as string | null) ?? null,
  }));

  const navSectionChips: NavSectionChip[] = (
    (raw.navSectionChips as Record<string, unknown>[]) || []
  ).map((c) => ({
    id: String(c.id),
    name: String(c.name ?? ''),
    slug: String(c.slug ?? ''),
    kind: 'section',
    sourceType: String(c.source_type ?? ''),
    sourceValue: (c.source_value as string | null) ?? null,
    tagLabel: (c.tag_label as string | null) ?? null,
    tagColor: (c.tag_color as string | null) ?? null,
    sortOrder: Number(c.sort_order ?? 0),
  }));

  return { tags, navCategories, featuredCategories, footerCategories, heroSlides, homeSections, navSectionChips };
}

/**
 * GET public storefront merchandising config.
 * Returns: StorefrontConfig
 */
export async function fetchStorefrontConfig(): Promise<StorefrontConfig> {
  const raw = await apiFetch<Record<string, unknown>>(publicEndpoints.storefrontConfig(), {
    skipAuth: true,
  });
  return mapStorefrontConfig(raw || {});
}

/** Admin: list tags. */
export async function fetchAdminTags(): Promise<StoreTag[]> {
  const data = await apiFetch<Record<string, unknown>[]>(adminEndpoints.tags());
  return (data || []).map((t) => ({
    id: String(t.id),
    name: String(t.name ?? ''),
    label: String(t.label ?? ''),
    color: String(t.color ?? '#F97316'),
    isActive: t.is_active !== false,
    sortOrder: Number(t.sort_order ?? 0),
  }));
}

export async function createTag(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetch(adminEndpoints.tags(), { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateTag(id: string, payload: Record<string, unknown>): Promise<unknown> {
  return apiFetch(adminEndpoints.tag(id), { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteTag(id: string): Promise<unknown> {
  return apiFetch(adminEndpoints.tag(id), { method: 'DELETE' });
}

/** Admin: hero slides */
export async function fetchAdminHeroSlides(): Promise<HeroSlideConfig[]> {
  const data = await apiFetch<Record<string, unknown>[]>(adminEndpoints.heroSlides());
  return (data || []).map((s) => ({
    id: String(s.id),
    badge: s.badge ? String(s.badge) : undefined,
    title: String(s.title ?? ''),
    subtitle: s.subtitle ? String(s.subtitle) : undefined,
    imageUrl: String(s.image_url ?? ''),
    buttonText: String(s.button_text ?? 'Shop Now'),
    accentColor: String(s.accent_color ?? '#F59E0B'),
    linkType: String(s.link_type ?? 'category'),
    linkValue: (s.link_value as string | null) ?? null,
    sortOrder: Number(s.sort_order ?? 0),
    isActive: s.is_active !== false,
  }));
}

export async function createHeroSlide(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetch(adminEndpoints.heroSlides(), { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateHeroSlide(
  id: string,
  payload: Record<string, unknown>,
): Promise<unknown> {
  return apiFetch(adminEndpoints.heroSlide(id), { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteHeroSlide(id: string): Promise<unknown> {
  return apiFetch(adminEndpoints.heroSlide(id), { method: 'DELETE' });
}

/** Admin: home sections */
export async function fetchAdminHomeSections(): Promise<HomeSectionConfig[]> {
  const data = await apiFetch<Record<string, unknown>[]>(adminEndpoints.homeSections());
  return (data || []).map((s) => ({
    id: String(s.id),
    key: String(s.key ?? ''),
    title: String(s.title ?? ''),
    subtitle: s.subtitle ? String(s.subtitle) : undefined,
    sectionBadge: s.section_badge ? String(s.section_badge) : undefined,
    sourceType: String(s.source_type ?? 'badge'),
    sourceValue: (s.source_value as string | null) ?? null,
    maxItems: Number(s.max_items ?? 12),
    sortOrder: Number(s.sort_order ?? 0),
    isActive: s.is_active !== false,
    showInNav: Boolean(s.show_in_nav),
    tagId: (s.tag_id as string | null) ?? null,
    tagLabel: (s.tag_label as string | null) ?? null,
    tagColor: (s.tag_color as string | null) ?? null,
  }));
}

export async function createHomeSection(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetch(adminEndpoints.homeSections(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateHomeSection(
  id: string,
  payload: Record<string, unknown>,
): Promise<unknown> {
  return apiFetch(adminEndpoints.homeSection(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteHomeSection(id: string): Promise<unknown> {
  return apiFetch(adminEndpoints.homeSection(id), { method: 'DELETE' });
}

function mapCampaign(c: Record<string, unknown>): CampaignConfig {
  const tags = ((c.tags as Record<string, unknown>[]) || []).map((t) => ({
    id: String(t.id),
    name: String(t.name ?? ''),
    label: String(t.label ?? ''),
    color: String(t.color ?? '#F97316'),
  }));
  return {
    id: String(c.id),
    key: String(c.key ?? ''),
    title: String(c.title ?? ''),
    subtitle: c.subtitle ? String(c.subtitle) : undefined,
    badgeText: c.badge_text ? String(c.badge_text) : undefined,
    campaignType: String(c.campaign_type ?? 'flash'),
    startsAt: (c.starts_at as string | null) ?? null,
    endsAt: (c.ends_at as string | null) ?? null,
    backgroundColor: String(c.background_color ?? '#FDFD96'),
    backgroundImageUrl: (c.background_image_url as string | null) ?? null,
    accentColor: String(c.accent_color ?? '#FFB347'),
    maxItems: Number(c.max_items ?? 8),
    sortOrder: Number(c.sort_order ?? 0),
    isActive: c.is_active !== false,
    tags,
    tagIds: Array.isArray(c.tag_ids)
      ? (c.tag_ids as string[]).map(String)
      : tags.map((t) => t.id),
  };
}

/** Admin: list campaigns. */
export async function fetchAdminCampaigns(): Promise<CampaignConfig[]> {
  const data = await apiFetch<Record<string, unknown>[]>(adminEndpoints.campaigns());
  return (data || []).map(mapCampaign);
}

export async function createCampaign(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetch(adminEndpoints.campaigns(), { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateCampaign(
  id: string,
  payload: Record<string, unknown>,
): Promise<unknown> {
  return apiFetch(adminEndpoints.campaign(id), { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteCampaign(id: string): Promise<unknown> {
  return apiFetch(adminEndpoints.campaign(id), { method: 'DELETE' });
}

/**
 * Public: list live campaigns (active + within start/end window).
 * Args: type — optional flash | seasonal | clearance
 */
export async function fetchActiveCampaigns(type?: string): Promise<CampaignConfig[]> {
  const data = await apiFetch<Record<string, unknown>[]>(publicEndpoints.activeCampaigns(type), {
    skipAuth: true,
  });
  return (data || []).map(mapCampaign);
}

/**
 * Public: first live homepage campaign + products.
 * Prefers any live campaign (flash or seasonal) by sort order — not a hardcoded key.
 */
export async function fetchHomepageCampaign(): Promise<CampaignWithProducts | null> {
  const active = await fetchActiveCampaigns();
  if (!active.length) return null;
  // Prefer flash type when several are live; otherwise first by API sort order
  const preferred =
    active.find((c) => c.campaignType === 'flash') || active[0];
  return fetchCampaignWithProducts(preferred.key);
}

/**
 * Public: campaign by key + tagged products (for Flash Deals rail).
 * Args: key — e.g. daily-flash or azaadi-sale
 */
export async function fetchCampaignWithProducts(key: string): Promise<CampaignWithProducts> {
  const raw = await apiFetch<Record<string, unknown>>(publicEndpoints.campaign(key), {
    skipAuth: true,
  });
  const products = ((raw.products as Record<string, unknown>[]) || []).map((p) => mapProduct(p));
  return {
    campaign: mapCampaign((raw.campaign as Record<string, unknown>) || {}),
    isLive: Boolean(raw.is_live ?? raw.isLive),
    products,
    serverTime: String(raw.server_time ?? new Date().toISOString()),
  };
}

/**
 * Public: products for a tag name/id.
 * Args: tagRef — tag name (sale) or uuid; limit
 */
export async function fetchProductsByTag(
  tagRef: string,
  limit = 50,
): Promise<{ tag: StoreTag; products: Product[]; count: number }> {
  const raw = await apiFetch<Record<string, unknown>>(publicEndpoints.productsByTag(tagRef, limit), {
    skipAuth: true,
  });
  const tagRaw = (raw.tag as Record<string, unknown>) || {};
  return {
    tag: {
      id: String(tagRaw.id ?? ''),
      name: String(tagRaw.name ?? ''),
      label: String(tagRaw.label ?? ''),
      color: String(tagRaw.color ?? '#F97316'),
    },
    count: Number(raw.count ?? 0),
    products: ((raw.products as Record<string, unknown>[]) || []).map((p) => mapProduct(p)),
  };
}

export type { Category };
