import type { Product, Category, Order, AppUser, OrderReturn } from '@/types';
import { parseDiscountPercentValue } from '@/utils/discount';

/** Map a backend product JSON object to the frontend Product type. */
export function mapProduct(p: Record<string, unknown>, categorySlugById?: Map<string, string>): Product {
  const categoryId = String(p.category_id ?? p.categoryId ?? '');
  const slugFromMap = categorySlugById?.get(categoryId);
  return {
    id: String(p.id),
    name: String(p.name ?? ''),
    slug: String(p.slug ?? ''),
    description: String(p.description ?? ''),
    price: Number(p.price ?? 0),
    basePrice: p.base_price != null ? Number(p.base_price) : undefined,
    originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
    categoryId,
    categorySlug: slugFromMap || String(p.category_slug ?? p.categorySlug ?? ''),
    categoryName: String(p.category_name ?? p.categoryName ?? 'Uncategorized'),
    // Accept both plain URL strings and enriched {secure_url} objects from admin API
    images: ((p.images ?? p.image_urls) as Array<string | Record<string, unknown>> || [])
      .map((img) => {
        if (typeof img === 'string') return img;
        return String((img as Record<string, unknown>).secure_url ?? (img as Record<string, unknown>).url ?? '');
      })
      .filter(Boolean),

    badge: p.badge as Product['badge'],
    discountBadge: parseDiscountPercentValue(
      (p.discount_badge ?? p.discountBadge) as string | number | null | undefined,
    ) ?? undefined,
    inStock: Boolean(p.in_stock),
    stockQuantity: Number(p.stock_quantity ?? 0),
    lowStockThreshold: Number(p.low_stock_threshold ?? 5),
    isPublished: p.is_published !== false,
    ageGroup: (p.age_group as Product['ageGroup']) || '1-3Y',
    rating: Number(p.rating ?? 5),
    reviewCount: Number(p.review_count ?? 0),
    features: (p.features as string[]) || [],
    tagIds: Array.isArray(p.tag_ids)
      ? (p.tag_ids as string[]).map(String)
      : Array.isArray(p.tags)
        ? (p.tags as Record<string, unknown>[]).map((t) => String(t.id))
        : [],
    tags: Array.isArray(p.tags)
      ? (p.tags as Record<string, unknown>[]).map((t) => ({
          id: String(t.id),
          name: String(t.name ?? ''),
          label: String(t.label ?? ''),
          color: String(t.color ?? '#F97316'),
        }))
      : [],
    variants: Array.isArray(p.variants)
      ? (p.variants as Record<string, unknown>[]).map((v) => ({
          id: String(v.id),
          name: String(v.name ?? ''),
          price: Number(v.price ?? 0),
          originalPrice: v.original_price != null ? Number(v.original_price) : undefined,
          inStock: Boolean(v.in_stock ?? true),
          stockQuantity: Number(v.stock_quantity ?? 0),
          image: v.image ? String(v.image) : undefined,
        }))
      : [],
  };
}

/** Map a backend category JSON object to the frontend Category type. */
export function mapCategory(c: Record<string, unknown>): Category {
  return {
    id: String(c.id),
    name: String(c.name ?? ''),
    slug: String(c.slug ?? ''),
    image: c.image ? String(c.image) : undefined,
    description: String(c.description ?? ''),
    itemCount: Number(c.item_count ?? c.itemCount ?? 0),
    color: String(c.color ?? '#FEF3C7'),
    iconName: String(c.icon_name ?? c.icon ?? 'Shapes'),
    featured: Boolean(c.show_in_featured ?? c.featured ?? true),
    isEnabled: c.is_enabled !== false,
    showInNav: Boolean(c.show_in_nav ?? false),
    showInFeatured: Boolean(c.show_in_featured ?? true),
    showInFooter: Boolean(c.show_in_footer ?? false),
    navOrder: Number(c.nav_order ?? 0),
    tagId: (c.tag_id as string | null | undefined) ?? null,
    tagLabel: (c.tag_label as string | null | undefined) ?? null,
    tagColor: (c.tag_color as string | null | undefined) ?? null,
    subcategories: (c.subcategories as string[]) || [],
  };
}

/** Map a backend order JSON object to the frontend Order type. */
export function mapOrder(o: Record<string, unknown>): Order {
  const items = (o.items as Record<string, unknown>[]) || [];
  const returns = (o.returns as Record<string, unknown>[]) || [];
  const originalTotal = Number(o.original_total_amount ?? o.total_amount ?? 0);
  return {
    id: String(o.id),
    // Prefer backend order_number when present (shown in admin / success UI)
    orderNumber: String(o.order_number ?? o.id ?? ''),
    customerName: String(o.customer_name ?? ''),
    customerEmail: String(o.customer_email ?? ''),
    customerPhone: String(o.customer_phone ?? ''),
    address: String(o.shipping_address ?? o.address ?? ''),
    city: String(o.city ?? ''),
    paymentMethod: (o.payment_method as Order['paymentMethod']) || 'COD',
    status: (o.status as Order['status']) || 'Pending',
    stockDeducted: Boolean(o.stock_deducted ?? o.stockDeducted ?? false),
    totalAmount: Number(o.total_amount ?? 0),
    originalTotalAmount: originalTotal,
    originalSubtotal: Number(o.original_subtotal ?? o.subtotal ?? 0),
    createdAt: String(o.created_at ?? ''),
    items: items.map((i) => ({
      id: i.id != null ? Number(i.id) : undefined,
      productId: String(i.product_id ?? ''),
      productName: String(i.product_name ?? ''),
      productImage: String(i.product_image ?? ''),
      price: Number(i.price ?? 0),
      quantity: Number(i.quantity ?? 0),
      variantName: i.variant_name ? String(i.variant_name) : undefined,
    })),
    returns: returns.map(mapOrderReturn),
  };
}

/** Map a backend return JSON object to OrderReturn. */
export function mapOrderReturn(r: Record<string, unknown>): OrderReturn {
  const items = (r.items as Record<string, unknown>[]) || [];
  return {
    id: String(r.id),
    returnNumber: String(r.return_number ?? ''),
    orderId: String(r.order_id ?? ''),
    reason: String(r.reason ?? ''),
    status: (r.status as OrderReturn['status']) || 'Pending',
    refundAmount: Number(r.refund_amount ?? 0),
    stockRestored: Boolean(r.stock_restored ?? false),
    notes: r.notes != null ? String(r.notes) : undefined,
    createdAt: String(r.created_at ?? ''),
    updatedAt: String(r.updated_at ?? ''),
    items: items.map((i) => ({
      id: Number(i.id),
      orderItemId: Number(i.order_item_id),
      productId: String(i.product_id ?? ''),
      productName: String(i.product_name ?? ''),
      variantName: i.variant_name ? String(i.variant_name) : undefined,
      unitPrice: Number(i.unit_price ?? 0),
      quantity: Number(i.quantity ?? 0),
      lineAmount: Number(i.line_amount ?? Number(i.unit_price ?? 0) * Number(i.quantity ?? 0)),
      reason: i.reason != null ? String(i.reason) : undefined,
    })),
  };
}

/** Map a backend user JSON object to the frontend AppUser type. */
export function mapUser(u: Record<string, unknown>): AppUser {
  return {
    id: String(u.id),
    name: String(u.name ?? ''),
    email: String(u.email ?? ''),
    phone: String(u.phone ?? ''),
    address: String(u.address ?? ''),
    city: String(u.city ?? ''),
    postalCode: u.postal_code ? String(u.postal_code) : '',
    status: u.is_active ? 'Active' : 'Suspended',
    joinedDate: String(u.created_at ?? '').split('T')[0] || '',
    totalOrders: Number(u.total_orders ?? 0),
    totalSpent: Number(u.total_spent ?? 0),
  };
}
