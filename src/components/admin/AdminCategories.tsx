import React, { useRef, useState } from 'react';
import { 
  Plus, Edit2, Trash2, X, Layers, Tag, Grid, List, Loader2, Check
} from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { Category } from '../../types';
import { ImageUploadWidget } from './ImageUploadWidget';
import { ReloadButton } from './ReloadButton';
import { commitSession } from '@/services/upload-service';

interface AdminCategoriesProps {
  openAddModalInitially?: boolean;
  onCloseAddModal?: () => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  openAddModalInitially = false,
  onCloseAddModal
}) => {
  const { categories, products, addCategory, updateCategory, deleteCategory, addSubcategory, deleteSubcategory, fetchAdminCategories } = useShopStore();

  const [isModalOpen, setIsModalOpen] = useState(openAddModalInitially);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newSubName, setNewSubName] = useState('');
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const sessionIdRef = useRef<string>(crypto.randomUUID());

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    color: '#FEF3C7',
    iconName: 'Shapes',
    featured: true,
    isEnabled: true,
    showInNav: false,
    showInFooter: false,
    navOrder: 1,
  });

  const resetForm = () => {
    setEditingCategory(null);
    setNewSubName('');
    setFormError(null);
    setIsSubmitting(false);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      color: '#FEF3C7',
      iconName: 'Shapes',
      featured: true,
      isEnabled: true,
      showInNav: false,
      showInFooter: false,
      navOrder: categories.length + 1,
    });
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setNewSubName('');
    setFormError(null);
    setIsSubmitting(false);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      color: cat.color,
      iconName: cat.iconName,
      featured: cat.featured ?? true,
      isEnabled: cat.isEnabled ?? true,
      showInNav: Boolean(cat.showInNav),
      showInFooter: Boolean(cat.showInFooter),
      navOrder: cat.navOrder ?? 1,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    if (onCloseAddModal) onCloseAddModal();
  };

  const handleAddSubcategory = async () => {
    if (!editingCategory || !newSubName.trim() || isSubmittingSub) return;
    const subToAdd = newSubName.trim();
    const catId = editingCategory.id;

    // Optimistic UI update
    setEditingCategory((prev) =>
      prev
        ? {
            ...prev,
            subcategories: Array.from(new Set([...(prev.subcategories || []), subToAdd])),
          }
        : null
    );
    setNewSubName('');
    setIsSubmittingSub(true);

    const updated = await addSubcategory(catId, subToAdd);
    if (updated) {
      setEditingCategory(updated);
    }
    setIsSubmittingSub(false);
  };

  const handleDeleteSubcategory = async (subName: string) => {
    if (!editingCategory || isSubmittingSub) return;
    const catId = editingCategory.id;

    // Optimistic UI update — instantly remove tag badge from modal
    setEditingCategory((prev) =>
      prev
        ? {
            ...prev,
            subcategories: (prev.subcategories || []).filter((s) => s.toLowerCase() !== subName.toLowerCase()),
          }
        : null
    );
    setIsSubmittingSub(true);

    const updated = await deleteSubcategory(catId, subName);
    if (updated) {
      setEditingCategory(updated);
    }
    setIsSubmittingSub(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const generatedSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formData.name,
          slug: generatedSlug,
          description: formData.description,
          image: formData.image,
          color: formData.color,
          iconName: formData.iconName,
          featured: formData.featured,
          isEnabled: formData.isEnabled,
          showInNav: formData.showInNav,
          showInFooter: formData.showInFooter,
          navOrder: formData.navOrder,
        });
      } else {
        await addCategory({
          name: formData.name,
          slug: generatedSlug,
          description: formData.description || 'Curated collection of baby & toddler essentials.',
          image: formData.image,
          color: formData.color,
          iconName: formData.iconName,
          featured: formData.featured,
          isEnabled: formData.isEnabled,
          showInNav: formData.showInNav,
          showInFooter: formData.showInFooter,
          navOrder: formData.navOrder,
          subcategories: [],
          itemCount: 0
        });
      }

      const sid = editingCategory?.id || sessionIdRef.current;
      if (sid) {
        commitSession(sid).catch(() => {});
      }

      handleCloseModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save category. Please retry.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0]">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Categories Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize client app product collections, subcategories, banner images and navigation tags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ReloadButton onReload={fetchAdminCategories} label="Reload Categories" />
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer border-none shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...categories]
          .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0) || a.name.localeCompare(b.name))
          .map((cat) => {
          const catProductsCount = products.filter(p => p.categoryId === cat.id || p.categorySlug === cat.slug).length;

          return (
            <div key={cat.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden flex flex-col justify-between">
              {/* Category Image & Color Bar */}
              <div className="relative h-28 bg-slate-100 overflow-hidden">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1" 
                  style={{ backgroundColor: cat.color }} 
                />
                <span className="absolute top-2 left-2 px-2 py-1 bg-sky-600 text-white rounded text-[10px] font-black">
                  #{cat.navOrder ?? '—'}
                </span>
                <span className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white rounded text-[10px] font-bold">
                  {catProductsCount} Products
                </span>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">/{cat.slug}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
                </div>

                {/* Subcategories tags */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Subcategories ({(cat.subcategories || []).length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(cat.subcategories || []).map(sub => (
                      <span key={sub} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions & Enable/Disable Toggle */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => updateCategory(cat.id, { isEnabled: cat.isEnabled === false ? true : false })}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded border cursor-pointer flex items-center gap-1 transition-colors ${
                      cat.isEnabled !== false
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        : 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                    }`}
                    title={cat.isEnabled !== false ? 'Click to Disable Category' : 'Click to Enable Category'}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cat.isEnabled !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>{cat.isEnabled !== false ? 'Enabled' : 'Disabled'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal (No Animations) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nursery Decor & Lighting"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                />
              </div>

              {/* URL Slug & Background Tint Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Slug (URL Path)</label>
                  <input
                    type="text"
                    placeholder="e.g. nursery-decor"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pastel Card Color</label>
                  <input
                    type="text"
                    placeholder="#FEF3C7"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Category Image {editingCategory ? '*' : '(Upload after create)'}</label>
                {editingCategory ? (
                  <ImageUploadWidget
                    folder="categories"
                    entityId={editingCategory?.id}
                    initialImage={formData.image}
                    onUploadSuccess={(result) => setFormData({ ...formData, image: result?.secure_url ?? '' })}
                  />
                ) : (
                  <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-4">
                    Images may be added after the category is created. Save the category first, then edit to upload a category image.
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description for category banners and navigation header..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                />
              </div>

              {/* Subcategories Manager */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Subcategories Management
                </label>
                {editingCategory ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add subcategory name (e.g. Wooden Puzzles)..."
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubcategory();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddSubcategory}
                        disabled={!newSubName.trim() || isSubmittingSub}
                        className="px-3 py-1.5 bg-[#0798AE] text-white font-bold text-xs rounded-lg hover:bg-[#06869a] disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Subcategories Pill Badge List */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(editingCategory.subcategories || []).length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No subcategories added yet.</span>
                      ) : (
                        (editingCategory.subcategories || []).map((sub) => (
                          <span
                            key={sub}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-xs font-bold"
                          >
                            <span>{sub}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubcategory(sub)}
                              className="hover:bg-sky-200 rounded-full p-0.5 text-sky-800 cursor-pointer"
                              title={`Remove ${sub}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Subcategories can be added right after creating this category.
                  </p>
                )}
              </div>

              {/* Status Switch */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority (1, 2, 3…)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.navOrder}
                    onChange={e => setFormData({ ...formData, navOrder: Math.max(1, Number(e.target.value) || 1) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-sky-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">1 shows first under search / featured</p>
                </div>
                <div className="space-y-2 pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isEnabled}
                      onChange={e => setFormData({ ...formData, isEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
                    />
                    Enabled
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showInNav}
                      onChange={e => setFormData({ ...formData, showInNav: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
                    />
                    Show under search bar
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showInFooter}
                      onChange={e => setFormData({ ...formData, showInFooter: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
                    />
                    Show in footer Top Categories
                  </label>
                </div>
              </div>

              {formError && (
                <div className="my-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-600">
                  {formError}
                </div>
              )}

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{editingCategory ? 'Updating...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingCategory ? 'Save Category' : 'Create Category'}</span>
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
