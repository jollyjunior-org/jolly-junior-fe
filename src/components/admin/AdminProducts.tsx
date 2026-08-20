import React, { useEffect, useRef, useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, 
  X, Layers, Tag, DollarSign, Image as ImageIcon, Filter, Check, Loader2
} from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { Product, ProductVariant, StoreTag } from '../../types';
import { ImageUploadWidget, type UploadedImage } from './ImageUploadWidget';
import { TagMultiSelect } from './TagMultiSelect';
import { ReloadButton } from './ReloadButton';
import { formatDiscountLabel } from '../../utils/discount';
import { commitSession, cleanupSession } from '@/services/upload-service';
import * as storefrontService from '@/services/storefront-service';

const MAX_IMAGES = 4;

/** Null = empty slot; UploadedImage = has both secure_url and public_id. */
type ImageSlot = UploadedImage | null;

/** Local draft row for a color/size option before save. */
type VariantDraft = {
  id?: string;
  name: string;
  price: number;
  originalPrice: number;
  stockQuantity: number;
  inStock: boolean;
};

interface AdminProductsProps {
  openAddModalInitially?: boolean;
  onCloseAddModal?: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  openAddModalInitially = false,
  onCloseAddModal
}) => {
  const { products, categories, addProduct, updateProduct, deleteProduct, fetchAdminProducts } = useShopStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'outstock'>('all');
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [availableTags, setAvailableTags] = useState<StoreTag[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(openAddModalInitially);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [samePriceForVariants, setSamePriceForVariants] = useState(true);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Stable session UUID per modal open — used for Cloudinary upload tracking
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  // Enriched image slots (public_id + secure_url); null = empty
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([null, null, null, null]);

  // Form Fields State (images removed — now managed separately as imageSlots)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: categories[0]?.id || '',
    categoryName: categories[0]?.name || 'Educational Toys',
    subCategory: '',
    price: 1000,
    basePrice: 0,
    originalPrice: 0,
    discountPercent: 0,
    tagIds: [] as string[],
    badge: '' as '' | 'Best Seller' | 'New' | 'Flash Sale' | 'Must Have' | 'Trending',
    ageGroup: '1-3Y' as '0-6M' | '6-12M' | '1-3Y' | '3-5Y' | '5Y+',
    description: '',
    featuresText: 'Non-toxic paint, Solid beechwood, Eco-friendly',
    inStock: true,
    stockQuantity: 15,
    isPublished: true
  });

  /**
   * Convert a product's images array (enriched objects or plain URL strings from API)
   * into 4 ImageSlot entries.
   */
  const toImageSlots = (
    images: Array<{ public_id?: string | null; secure_url?: string; url?: string } | string> | undefined,
  ): ImageSlot[] => {
    const slots: ImageSlot[] = [null, null, null, null];
    (images || []).slice(0, MAX_IMAGES).forEach((img, i) => {
      if (typeof img === 'string') {
        slots[i] = img ? { public_id: '', secure_url: img } : null;
      } else if (img && (img.secure_url || img.url)) {
        slots[i] = { public_id: img.public_id || '', secure_url: (img.secure_url || img.url)! };
      }
    });
    return slots;
  };

  const resetForm = () => {
    setEditingProduct(null);
    setSamePriceForVariants(true);
    setVariants([]);
    setImageSlots([null, null, null, null]);
    setFormData({
      name: '',
      slug: '',
      categoryId: categories[0]?.id || '',
      categoryName: categories[0]?.name || 'Educational Toys',
      subCategory: '',
      price: 1000,
      basePrice: 0,
      originalPrice: 0,
      discountPercent: 0,
      tagIds: [],
      badge: '',
      ageGroup: '1-3Y',
      description: '',
      featuresText: 'Non-toxic paint, Solid beechwood, Eco-friendly',
      inStock: true,
      stockQuantity: 15,
      isPublished: true
    });
  };

  const handleOpenAddModal = () => {
    // Fresh session UUID for each new-product modal
    sessionIdRef.current = crypto.randomUUID();
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    // Use the real product ID as the session/entity_id for uploads during edit
    sessionIdRef.current = product.id;
    setEditingProduct(product);
    const productVariants = product.variants || [];
    const prices = productVariants.map((v) => v.price);
    const allSamePrice =
      prices.length === 0 || prices.every((p) => p === (prices[0] ?? product.price));
    setSamePriceForVariants(allSamePrice);
    setVariants(
      productVariants.map((v) => ({
        id: v.id,
        name: v.name,
        price: v.price,
        originalPrice: v.originalPrice ?? v.price,
        stockQuantity: v.stockQuantity ?? 0,
        inStock: v.inStock !== false,
      })),
    );
    // Populate enriched image slots from API response
    setImageSlots(toImageSlots(product.images as unknown[]));
    setFormData({
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      subCategory: product.subCategory || '',
      price: product.price,
      basePrice: product.basePrice || 0,
      originalPrice: product.originalPrice || 0,
      discountPercent: parseDiscountPercent(
        product.discountBadge ?? calculateDiscountPercent(product.originalPrice || 0, product.price),
      ),
      tagIds: product.tagIds || [],
      badge: product.badge || '',
      ageGroup: product.ageGroup,
      description: product.description,
      featuresText: (product.features || []).join(', '),
      inStock: product.inStock,
      stockQuantity: product.stockQuantity ?? 15,
      isPublished: product.isPublished ?? true
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = async () => {
    // If the user cancels, delete any uncommitted uploads for this session
    const sid = sessionIdRef.current;
    if (sid && !editingProduct) {
      // Only clean up for new-product sessions (editing uses real product ID as session)
      cleanupSession(sid).catch(() => {/* best-effort */});
    }
    setIsModalOpen(false);
    resetForm();
    if (onCloseAddModal) onCloseAddModal();
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    const cat = categories.find(c => c.id === categoryId);
    setFormData(prev => ({
      ...prev,
      categoryId,
      categoryName: cat ? cat.name : 'General'
    }));
  };

  const calculateDiscountPercent = (originalPrice: number, price: number) => {
    if (!originalPrice || originalPrice <= 0 || price >= originalPrice) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  /**
   * Selling price from original + discount %.
   * Args: originalPrice, discountPercent (0–100)
   * Returns: rounded selling price; at 0% discount returns originalPrice
   */
  const calculateSellingPrice = (originalPrice: number, discountPercent: number) => {
    if (!originalPrice || originalPrice <= 0) return 0;
    const pct = Math.max(0, Math.min(100, Number(discountPercent) || 0));
    if (pct === 0) return Math.round(originalPrice);
    return Math.round(originalPrice * (1 - pct / 100));
  };

  /**
   * Resolve selling price whenever original or discount changes.
   * Args: originalPrice, discountPercent, fallbackPrice (used if no original)
   */
  const resolveSellingPrice = (
    originalPrice: number,
    discountPercent: number,
    fallbackPrice: number,
  ) => {
    if (originalPrice > 0) {
      return calculateSellingPrice(originalPrice, discountPercent);
    }
    return fallbackPrice;
  };

  const parseDiscountPercent = (value: string | number | null | undefined) => {
    if (value === undefined || value === null || value === '') return 0;
    const parsed = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9]/g, '').trim());
    return Number.isFinite(parsed) ? Math.max(0, Math.min(100, Math.round(parsed))) : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const featuresList = formData.featuresText
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);

      const generatedSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Build enriched images payload from ImageSlot state
      const filledSlots = imageSlots.filter((s): s is UploadedImage => s !== null && Boolean(s.secure_url));
      const imagesPayload = filledSlots.map((slot, i) => ({
        public_id: slot.public_id,
        secure_url: slot.secure_url,
        display_order: i,
      }));

      const hasDiscount = formData.discountPercent > 0 && formData.originalPrice > 0;
      const computedPrice = hasDiscount
        ? calculateSellingPrice(formData.originalPrice, formData.discountPercent)
        : formData.originalPrice > 0
          ? Math.round(Number(formData.originalPrice))
          : Number(formData.price);
      const computedOriginalPrice = hasDiscount ? Number(formData.originalPrice) : computedPrice;
      const discountPercentValue = hasDiscount ? formData.discountPercent : null;

      const variantPayload: ProductVariant[] = variants
        .filter((v) => v.name.trim())
        .map((v, idx) => {
          const price = samePriceForVariants ? computedPrice : Number(v.price) || computedPrice;
          const stock = Math.max(0, Number(v.stockQuantity) || 0);
          return {
            id: v.id || `tmp-${idx}`,
            name: v.name.trim(),
            price,
            originalPrice: samePriceForVariants ? computedOriginalPrice : Number(v.originalPrice) || price,
            inStock: stock > 0,
            stockQuantity: stock,
          };
        });

      const variantStockTotal = variantPayload.reduce((sum, v) => sum + v.stockQuantity, 0);
      const parsedStock = variantPayload.length
        ? variantStockTotal
        : Math.max(0, Number(formData.stockQuantity) || 0);

      const productPayload = {
        name: formData.name,
        slug: generatedSlug,
        categoryId: formData.categoryId,
        categoryName: formData.categoryName,
        subCategory: formData.subCategory || undefined,
        price: computedPrice,
        basePrice: formData.basePrice ? Number(formData.basePrice) : undefined,
        originalPrice: computedOriginalPrice,
        discountBadge: discountPercentValue,
        tagIds: formData.tagIds,
        badge: (formData.badge || undefined) as Product['badge'],
        ageGroup: formData.ageGroup,
        images: imagesPayload as unknown as string[],

        description: formData.description,
        features: featuresList.length > 0 ? featuresList : ['High quality baby safe material'],
        inStock: formData.inStock && parsedStock > 0,
        stockQuantity: parsedStock,
        isPublished: formData.isPublished,
        variants: variantPayload,
      };

      const sid = sessionIdRef.current;

      if (editingProduct) {
        await updateProduct(editingProduct.id, { ...productPayload, discountBadge: discountPercentValue });
        if (sid) commitSession(sid).catch(() => {});
      } else {
        await addProduct({
          ...productPayload,
          discountBadge: discountPercentValue ?? undefined,
          rating: 5.0,
          reviewCount: 1,
          description:
            formData.description ||
            'Premium sustainable baby product designed for safe exploration and motor development.',
          features: featuresList.length > 0 ? featuresList : ['Child safe non-toxic materials', 'Durable design'],
        });
        if (sid) commitSession(sid).catch(() => {});
      }

      // Close modal automatically on success
      setIsModalOpen(false);
      resetForm();
      if (onCloseAddModal) onCloseAddModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save product. Please check input and retry.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Add an empty color/size row. */
  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: '',
        price: formData.price || formData.originalPrice || 0,
        originalPrice: formData.originalPrice || formData.price || 0,
        stockQuantity: 10,
        inStock: true,
      },
    ]);
  };

  /** Update one field on a variant draft row. */
  const updateVariantRow = (index: number, patch: Partial<VariantDraft>) => {
    setVariants((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  /** Remove a variant draft row. */
  const removeVariantRow = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  /** Set the ImageSlot at a given index (0–3). Pass null to clear. */
  const setImageAt = (index: number, slot: ImageSlot) => {
    setImageSlots((prev) => {
      const next = [...prev];
      next[index] = slot;
      return next;
    });
  };

  /** Clear image slot at index. */
  const clearImageAt = (index: number) => {
    setImageAt(index, null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from client app catalog?`)) {
      deleteProduct(id);
    }
  };

  React.useEffect(() => {
    if (!formData.categoryId && categories.length > 0) {
      setFormData((prev) => ({
        ...prev,
        categoryId: categories[0].id,
        categoryName: categories[0].name,
      }));
    }
  }, [categories, formData.categoryId]);

  React.useEffect(() => {
    storefrontService.fetchAdminTags().then(setAvailableTags).catch(() => setAvailableTags([]));
  }, []);

  // Filtered List
  const filteredProducts = products.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(q);
      const catMatch = p.categoryName.toLowerCase().includes(q);
      if (!nameMatch && !catMatch) return false;
    }

    if (selectedCategoryFilter !== 'all' && p.categoryId !== selectedCategoryFilter) {
      return false;
    }

    if (stockFilter === 'instock' && !p.inStock) return false;
    if (stockFilter === 'outstock' && p.inStock) return false;

    if (publishFilter === 'published' && p.isPublished === false) return false;
    if (publishFilter === 'draft' && p.isPublished !== false) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0]">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Products Catalog Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add new products, update pricing, badges, age groups, and control client store inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ReloadButton onReload={fetchAdminProducts} label="Reload Products" />
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search product..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Status Filter */}
        <div>
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as any)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
          >
            <option value="all">All Stock Status</option>
            <option value="instock">In Stock Only</option>
            <option value="outstock">Out of Stock Only</option>
          </select>
        </div>

        {/* Published Status Filter */}
        <div>
          <select
            value={publishFilter}
            onChange={e => setPublishFilter(e.target.value as any)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
          >
            <option value="all">All Publish Status</option>
            <option value="published">Published Only</option>
            <option value="draft">Unpublished / Drafts</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Showing {filteredProducts.length} of {products.length} products</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Base / Sell (PKR)</th>
                <th className="p-3">Badges</th>
                <th className="p-3">Age Group</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Published</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.map(p => {
                const isPub = p.isPublished !== false;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    {/* Thumbnail & Title */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-11 h-11 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1 max-w-xs">{p.name}</div>
                          <div className="text-[10px] text-slate-400">ID: {p.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-bold text-[11px]">
                        {p.categoryName}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-3">
                      <div className="font-black text-slate-900">Rs. {p.price.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">
                        Base: Rs. {(p.basePrice ?? 0).toLocaleString()}
                      </div>
                      {p.originalPrice && (
                        <div className="text-[10px] text-slate-400 line-through">
                          Orig: Rs. {p.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </td>

                    {/* Badges + merchandising tags from Tags list */}
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {p.badge && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                            {p.badge}
                          </span>
                        )}
                        {formatDiscountLabel(p.discountBadge) && (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                            {formatDiscountLabel(p.discountBadge)}
                          </span>
                        )}
                        {(p.tags || []).map((t) => (
                          <span
                            key={t.id}
                            className="px-1.5 py-0.5 rounded font-bold text-[10px] text-white"
                            style={{ backgroundColor: t.color }}
                            title={t.name}
                          >
                            {t.label}
                          </span>
                        ))}
                        {!p.badge &&
                          !formatDiscountLabel(p.discountBadge) &&
                          !(p.tags || []).length && (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                      </div>
                    </td>

                    {/* Age Group */}
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded border border-sky-100 font-bold text-[10px]">
                        {p.ageGroup}
                      </span>
                    </td>

                    {/* Stock Toggle */}
                    <td className="p-3">
                      <button
                        onClick={() => updateProduct(p.id, { inStock: !p.inStock })}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer border flex items-center gap-1 ${
                          p.inStock
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {p.inStock ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
                      </button>
                    </td>

                    {/* Published Toggle */}
                    <td className="p-3">
                      <button
                        onClick={() => updateProduct(p.id, { isPublished: !isPub })}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer border flex items-center gap-1 ${
                          isPub
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                        title={isPub ? 'Click to Unpublish' : 'Click to Publish'}
                      >
                        {isPub ? <Check className="w-3 h-3 text-sky-600" /> : <X className="w-3 h-3 text-slate-500" />}
                        <span>{isPub ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal — scrollable body so long forms (images + variants) stay usable */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 shrink-0">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product to Catalog'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wooden Stacking Rainbow Tower"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                />
              </div>

              {/* Category, Subcategory & Age Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subcategory</label>
                  <select
                    value={formData.subCategory}
                    onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  >
                    <option value="">None / General</option>
                    {(categories.find(c => c.id === formData.categoryId)?.subcategories || []).map(sub => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age Group *</label>
                  <select
                    value={formData.ageGroup}
                    onChange={e => setFormData({ ...formData, ageGroup: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  >
                    <option value="0-6M">0-6 Months</option>
                    <option value="6-12M">6-12 Months</option>
                    <option value="1-3Y">1-3 Years</option>
                    <option value="3-5Y">3-5 Years</option>
                    <option value="5Y+">5+ Years</option>
                  </select>
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selling Price {formData.discountPercent > 0 ? '(Auto)' : '(Rs.)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="3450"
                    value={formData.price}
                    readOnly={formData.discountPercent > 0 && formData.originalPrice > 0}
                    onChange={e => {
                      const nextPrice = Number(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        price: nextPrice,
                        // Keep original in sync when there is no discount
                        originalPrice: prev.discountPercent > 0 ? prev.originalPrice : nextPrice,
                      }));
                    }}
                    className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500 ${
                      formData.discountPercent > 0 && formData.originalPrice > 0
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-slate-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Price (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="3200"
                    value={formData.basePrice}
                    onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Original Price (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="4200"
                    value={formData.originalPrice}
                    onChange={e => {
                      const nextOriginalPrice = Number(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        originalPrice: nextOriginalPrice,
                        // Always recalc selling when original changes (up, down, or 0% discount)
                        price: resolveSellingPrice(nextOriginalPrice, prev.discountPercent, prev.price),
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="20"
                    value={formData.discountPercent}
                    onChange={e => {
                      const raw = e.target.value;
                      // Allow empty while typing; treat as 0 for live calc
                      const nextPercent = raw === '' ? 0 : parseDiscountPercent(raw);
                      setFormData(prev => ({
                        ...prev,
                        discountPercent: nextPercent,
                        // Recalc on both increase and decrease; at 0% selling = original
                        price: resolveSellingPrice(prev.originalPrice, nextPercent, prev.price),
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  />
                  {formData.originalPrice > 0 && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      {formData.discountPercent > 0
                        ? `Selling auto: Rs. ${calculateSellingPrice(formData.originalPrice, formData.discountPercent).toLocaleString()} (${formData.discountPercent}% off Rs. ${formData.originalPrice.toLocaleString()})`
                        : '0% discount — selling price matches original price'}
                    </p>
                  )}
                </div>
              </div>

              {/* Promo Badge & Images (up to 4) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Special Badge</label>
                  <select
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  >
                    <option value="">None</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="New">New</option>
                    <option value="Flash Sale">Flash Sale</option>
                    <option value="Must Have">Must Have</option>
                    <option value="Trending">Trending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product images (up to {MAX_IMAGES})
                </label>
                <p className="text-[10px] text-slate-500 mb-2">
                  Image 1 is the main cover photo shown on cards and search.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {imageSlots.map((slot, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                          Image {index + 1}{index === 0 ? ' · Main' : ''}
                        </span>
                        {slot ? (
                          <button
                            type="button"
                            onClick={() => clearImageAt(index)}
                            className="text-[10px] font-bold text-rose-500 cursor-pointer"
                          >
                            Clear
                          </button>
                        ) : null}
                      </div>
                      <ImageUploadWidget
                        key={`img-${index}-${slot?.secure_url || 'empty'}`}
                        folder="products"
                        entityId={editingProduct ? editingProduct.id : sessionIdRef.current}
                        initialImage={slot || undefined}
                        onUploadSuccess={(result) => setImageAt(index, result)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Variants — colors / styles with own stock (+ optional own price) */}
              <div className="rounded-xl border border-slate-200 p-3 space-y-3 bg-slate-50/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Variants (colors / styles)
                    </label>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Optional. Each row has its own stock. Leave empty for a single product.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-[11px] font-bold text-slate-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add variant
                  </button>
                </div>

                {variants.length > 0 && (
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={samePriceForVariants}
                      onChange={(e) => setSamePriceForVariants(e.target.checked)}
                      className="accent-sky-500"
                    />
                    Same price for all variants (uses product selling price)
                  </label>
                )}

                {variants.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No variants — product uses main stock below.</p>
                ) : (
                  <div className="space-y-2">
                    {variants.map((row, index) => (
                      <div
                        key={row.id || `new-${index}`}
                        className="grid grid-cols-12 gap-2 items-end bg-white rounded-lg border border-slate-200 p-2"
                      >
                        <div className="col-span-12 sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Name</label>
                          <input
                            type="text"
                            placeholder="Pink / Blue / Size M"
                            value={row.name}
                            onChange={(e) => updateVariantRow(index, { name: e.target.value })}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-500"
                          />
                        </div>
                        {!samePriceForVariants && (
                          <>
                            <div className="col-span-6 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Price</label>
                              <input
                                type="number"
                                min={0}
                                value={row.price}
                                onChange={(e) =>
                                  updateVariantRow(index, { price: Number(e.target.value) || 0 })
                                }
                                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-500"
                              />
                            </div>
                            <div className="col-span-6 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Original</label>
                              <input
                                type="number"
                                min={0}
                                value={row.originalPrice}
                                onChange={(e) =>
                                  updateVariantRow(index, {
                                    originalPrice: Number(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-500"
                              />
                            </div>
                          </>
                        )}
                        <div className={samePriceForVariants ? 'col-span-8 sm:col-span-3' : 'col-span-8 sm:col-span-2'}>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Stock</label>
                          <input
                            type="number"
                            min={0}
                            value={row.stockQuantity}
                            onChange={(e) =>
                              updateVariantRow(index, {
                                stockQuantity: Math.max(0, parseInt(e.target.value) || 0),
                              })
                            }
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-500"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-1 flex justify-end pb-1">
                          <button
                            type="button"
                            onClick={() => removeVariantRow(index)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Remove variant"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tag Multi-Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Tags</label>
                <TagMultiSelect
                  tags={availableTags}
                  selectedIds={formData.tagIds}
                  onChange={(tagIds) => setFormData((prev) => ({ ...prev, tagIds }))}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe product materials, benefits and usage..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                />
              </div>

              {/* Features (comma separated) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Features (comma separated)</label>
                <input
                  type="text"
                  placeholder="100% Beechwood, Non-toxic, BPA-Free"
                  value={formData.featuresText}
                  onChange={e => setFormData({ ...formData, featuresText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                />
              </div>

              {/* Stock Quantity & Status Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {variants.length > 0 ? 'Total stock (from variants)' : 'Live Stock Quantity (Units) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required={variants.length === 0}
                    disabled={variants.length > 0}
                    value={
                      variants.length > 0
                        ? variants.reduce((s, v) => s + (Number(v.stockQuantity) || 0), 0)
                        : formData.stockQuantity
                    }
                    onChange={e => setFormData({ ...formData, stockQuantity: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-sky-500 disabled:opacity-60"
                  />
                  {variants.length > 0 && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Stock is managed per variant above.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg self-end">
                  <input
                    type="checkbox"
                    id="inStockCheck"
                    checked={formData.inStock}
                    onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="inStockCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                    In Stock
                  </label>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg self-end">
                  <input
                    type="checkbox"
                    id="isPublishedCheck"
                    checked={formData.isPublished}
                    onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isPublishedCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Published
                  </label>
                </div>
              </div>

              </div>

              {formError && (
                <div className="mx-5 my-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-600">
                  {formError}
                </div>
              )}

              {/* Submit CTA — stays visible while form scrolls */}
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 shrink-0 bg-white rounded-b-xl">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {editingProduct ? 'Done' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0798AE] hover:bg-[#068497] text-white text-xs font-bold rounded-lg cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{editingProduct ? 'Updating...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
