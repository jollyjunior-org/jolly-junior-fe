import React, { useEffect, useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, 
  X, Layers, Tag, DollarSign, Image as ImageIcon, Filter, Check
} from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { Product } from '../../types';
import { ImageUploadWidget } from './ImageUploadWidget';

interface AdminProductsProps {
  openAddModalInitially?: boolean;
  onCloseAddModal?: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  openAddModalInitially = false,
  onCloseAddModal
}) => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useShopStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'outstock'>('all');
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(openAddModalInitially);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: categories[0]?.id || '',
    categoryName: categories[0]?.name || 'Educational Toys',
    price: 1000,
    basePrice: 0,
    originalPrice: 0,
    discountPercent: 0,
    discountBadge: '',
    badge: '' as '' | 'Best Seller' | 'New' | 'Flash Sale' | 'Must Have' | 'Trending',
    ageGroup: '1-3Y' as '0-6M' | '6-12M' | '1-3Y' | '3-5Y' | '5Y+',
    imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
    description: '',
    featuresText: 'Non-toxic paint, Solid beechwood, Eco-friendly',
    inStock: true,
    stockQuantity: 15,
    isPublished: true
  });

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      categoryId: categories[0]?.id || '',
      categoryName: categories[0]?.name || 'Educational Toys',
      price: 1000,
      basePrice: 0,
      originalPrice: 0,
      discountPercent: 0,
      discountBadge: '',
      badge: '',
      ageGroup: '1-3Y',
      imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
      description: '',
      featuresText: 'Non-toxic paint, Solid beechwood, Eco-friendly',
      inStock: true,
      stockQuantity: 15,
      isPublished: true
    });
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      price: product.price,
      basePrice: product.basePrice || 0,
      originalPrice: product.originalPrice || 0,
      discountPercent: parseDiscountPercent(product.discountBadge || calculateDiscountPercent(product.originalPrice || 0, product.price)),
      discountBadge: product.discountBadge || '',
      badge: product.badge || '',
      ageGroup: product.ageGroup,
      imageUrl: product.images[0] || '',
      description: product.description,
      featuresText: (product.features || []).join(', '),
      inStock: product.inStock,
      stockQuantity: product.stockQuantity ?? 15,
      isPublished: product.isPublished ?? true
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
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

  const calculateSellingPrice = (originalPrice: number, discountPercent: number) => {
    if (!originalPrice || originalPrice <= 0 || !discountPercent) return 0;
    return Math.round(originalPrice * (1 - discountPercent / 100));
  };

  const parseDiscountPercent = (value: string | number | undefined) => {
    if (value === undefined || value === null || value === '') return 0;
    const parsed = typeof value === 'number' ? value : Number(String(value).replace(/%/g, '').trim());
    return Number.isFinite(parsed) ? Math.max(0, Math.min(100, Math.round(parsed))) : 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const featuresList = formData.featuresText
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);

    const generatedSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const parsedStock = Math.max(0, Number(formData.stockQuantity) || 0);
    const computedPrice = formData.discountPercent > 0 && formData.originalPrice > 0
      ? calculateSellingPrice(formData.originalPrice, formData.discountPercent)
      : Number(formData.price);
    const discountBadgeValue = formData.discountPercent > 0 ? `${formData.discountPercent}% OFF` : '';

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        slug: generatedSlug,
        categoryId: formData.categoryId,
        categoryName: formData.categoryName,
        price: computedPrice,
        basePrice: formData.basePrice ? Number(formData.basePrice) : undefined,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        discountBadge: discountBadgeValue || undefined,
        badge: formData.badge || undefined,
        ageGroup: formData.ageGroup,
        images: [formData.imageUrl],
        description: formData.description,
        features: featuresList.length > 0 ? featuresList : ['High quality baby safe material'],
        inStock: formData.inStock && parsedStock > 0,
        stockQuantity: parsedStock,
        isPublished: formData.isPublished
      });
    } else {
      addProduct({
        name: formData.name,
        slug: generatedSlug,
        categoryId: formData.categoryId,
        categoryName: formData.categoryName,
        price: computedPrice,
        basePrice: formData.basePrice ? Number(formData.basePrice) : undefined,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        discountBadge: discountBadgeValue || undefined,
        badge: formData.badge || undefined,
        ageGroup: formData.ageGroup,
        images: [formData.imageUrl],
        description: formData.description || 'Premium sustainable baby product designed for safe exploration and motor development.',
        features: featuresList.length > 0 ? featuresList : ['Child safe non-toxic materials', 'Durable design'],
        inStock: formData.inStock && parsedStock > 0,
        stockQuantity: parsedStock,
        isPublished: formData.isPublished,
        rating: 5.0,
        reviewCount: 1
      });
    }

    handleCloseModal();
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

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs border-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
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

                    {/* Badges */}
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {p.badge && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                            {p.badge}
                          </span>
                        )}
                        {p.discountBadge && (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                            {p.discountBadge}
                          </span>
                        )}
                        {!p.badge && !p.discountBadge && <span className="text-slate-400 text-[10px]">-</span>}
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

      {/* Add / Edit Modal (No Animations) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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

            <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Category & Age Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (Auto)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="3450"
                    value={formData.price}
                    readOnly={formData.discountPercent > 0 && formData.originalPrice > 0}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
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
                        price: prev.discountPercent > 0 && nextOriginalPrice > 0
                          ? calculateSellingPrice(nextOriginalPrice, prev.discountPercent)
                          : prev.price
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
                    placeholder="20"
                    value={formData.discountPercent}
                    onChange={e => {
                      const nextPercent = parseDiscountPercent(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        discountPercent: nextPercent,
                        discountBadge: nextPercent > 0 ? `${nextPercent}% OFF` : '',
                        price: prev.originalPrice > 0 && nextPercent > 0
                          ? calculateSellingPrice(prev.originalPrice, nextPercent)
                          : prev.price
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Promo Badge & Image URL */}
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

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Product Image *</label>
                  <ImageUploadWidget
                    initialImage={formData.imageUrl}
                    onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
                  />
                </div>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Live Stock Quantity (Units) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockQuantity}
                    onChange={e => setFormData({ ...formData, stockQuantity: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-sky-500"
                  />
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

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-2xs"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
