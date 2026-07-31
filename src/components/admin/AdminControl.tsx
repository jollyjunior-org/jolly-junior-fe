import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Loader2, Image as ImageIcon, Tag as TagIcon, LayoutGrid, SlidersHorizontal, Flame } from 'lucide-react';
import { useShopStore } from '@/store/useShopStore';
import { ImageUploadWidget } from '@/components/admin/ImageUploadWidget';
import { AdminCampaigns } from '@/components/admin/AdminCampaigns';
import * as storefrontService from '@/services/storefront-service';
import type { StoreTag, HeroSlideConfig, HomeSectionConfig } from '@/types';

type ControlTab = 'nav' | 'tags' | 'hero' | 'sections' | 'campaigns';

/**
 * Admin Control tab — manage storefront nav, tags, hero slides, home rails.
 * Uses Cloudinary via ImageUploadWidget for hero images.
 */
export const AdminControl: React.FC = () => {
  const { categories, updateCategory, showToast, fetchAdminCategories, fetchStorefrontConfig } =
    useShopStore();

  const [tab, setTab] = useState<ControlTab>('nav');
  const [tags, setTags] = useState<StoreTag[]>([]);
  const [slides, setSlides] = useState<HeroSlideConfig[]>([]);
  const [sections, setSections] = useState<HomeSectionConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const [tagForm, setTagForm] = useState({ name: '', label: '', color: '#F97316' });
  const [slideForm, setSlideForm] = useState({
    badge: '',
    title: '',
    subtitle: '',
    image_url: '',
    button_text: 'Shop Now',
    accent_color: '#F59E0B',
    link_type: 'category',
    link_value: '',
    sort_order: 0,
    is_active: true,
  });
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);

  const [sectionForm, setSectionForm] = useState({
    key: '',
    title: '',
    subtitle: '',
    section_badge: '',
    source_type: 'badge',
    source_value: 'New',
    max_items: 12,
    sort_order: 0,
    is_active: true,
    show_in_nav: false,
    tag_id: '',
  });
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  /** Load CMS lists for the Control tab. */
  const loadAll = async () => {
    setLoading(true);
    try {
      await fetchAdminCategories();
      const [t, s, sec] = await Promise.all([
        storefrontService.fetchAdminTags(),
        storefrontService.fetchAdminHeroSlides(),
        storefrontService.fetchAdminHomeSections(),
      ]);
      setTags(t);
      setSlides(s);
      setSections(sec);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load control data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const refreshPublic = async () => {
    await fetchStorefrontConfig();
  };

  // —— Tags ——
  /** Create a tag; internal name auto-slugs from label when left blank (fewer typos). */
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const label = tagForm.label.trim();
      const name =
        tagForm.name.trim().toLowerCase().replace(/\s+/g, '-') ||
        label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await storefrontService.createTag({
        name,
        label,
        color: tagForm.color,
        is_active: true,
        sort_order: tags.length + 1,
      });
      setTagForm({ name: '', label: '', color: '#F97316' });
      showToast('Tag created');
      await loadAll();
      await refreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create tag');
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    try {
      await storefrontService.deleteTag(id);
      showToast('Tag deleted');
      await loadAll();
      await refreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete tag');
    }
  };

  // —— Nav (categories) ——
  const handleNavToggle = async (
    categoryId: string,
    patch: { showInNav?: boolean; showInFeatured?: boolean; tagId?: string | null; navOrder?: number },
  ) => {
    try {
      await updateCategory(categoryId, patch);
      await refreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  /** Toggle a home-section filter chip under the search bar. */
  const handleSectionNavToggle = async (
    sectionId: string,
    patch: { show_in_nav?: boolean; sort_order?: number; tag_id?: string | null; title?: string },
  ) => {
    try {
      await storefrontService.updateHomeSection(sectionId, patch);
      await loadAll();
      await refreshPublic();
      showToast('Nav chip updated');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update nav chip');
    }
  };

  // —— Hero ——
  const resetSlideForm = () => {
    setEditingSlideId(null);
    setSlideForm({
      badge: '',
      title: '',
      subtitle: '',
      image_url: '',
      button_text: 'Shop Now',
      accent_color: '#F59E0B',
      link_type: 'category',
      link_value: '',
      sort_order: slides.length + 1,
      is_active: true,
    });
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.image_url) {
      showToast('Please upload a slide image (Cloudinary)');
      return;
    }
    try {
      const payload = { ...slideForm, link_value: slideForm.link_value || null };
      if (editingSlideId) {
        await storefrontService.updateHeroSlide(editingSlideId, payload);
        showToast('Slide updated');
      } else {
        await storefrontService.createHeroSlide(payload);
        showToast('Slide created');
      }
      resetSlideForm();
      await loadAll();
      await refreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save slide');
    }
  };

  const handleEditSlide = (slide: HeroSlideConfig) => {
    setEditingSlideId(slide.id);
    setSlideForm({
      badge: slide.badge || '',
      title: slide.title,
      subtitle: slide.subtitle || '',
      image_url: slide.imageUrl,
      button_text: slide.buttonText,
      accent_color: slide.accentColor,
      link_type: slide.linkType,
      link_value: slide.linkValue || '',
      sort_order: slide.sortOrder || 0,
      is_active: slide.isActive !== false,
    });
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm('Delete this slide?')) return;
    try {
      await storefrontService.deleteHeroSlide(id);
      showToast('Slide deleted');
      await loadAll();
      await refreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete slide');
    }
  };

  // —— Home sections ——
  const resetSectionForm = () => {
    setEditingSectionId(null);
    setSectionForm({
      key: '',
      title: '',
      subtitle: '',
      section_badge: '',
      source_type: 'badge',
      source_value: 'New',
      max_items: 12,
      sort_order: sections.length + 1,
      is_active: true,
      show_in_nav: false,
      tag_id: '',
    });
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...sectionForm,
        key: sectionForm.key.trim().toLowerCase().replace(/\s+/g, '-'),
        tag_id: sectionForm.tag_id || null,
        source_value: sectionForm.source_value || null,
      };
      if (editingSectionId) {
        await storefrontService.updateHomeSection(editingSectionId, payload);
        showToast('Section updated');
      } else {
        await storefrontService.createHomeSection(payload);
        showToast('Section created');
      }
      resetSectionForm();
      await loadAll();
      await refreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save section');
    }
  };

  const handleEditSection = (sec: HomeSectionConfig) => {
    setEditingSectionId(sec.id);
    setSectionForm({
      key: sec.key,
      title: sec.title,
      subtitle: sec.subtitle || '',
      section_badge: sec.sectionBadge || '',
      source_type: sec.sourceType,
      source_value: sec.sourceValue || '',
      max_items: sec.maxItems,
      sort_order: sec.sortOrder,
      is_active: sec.isActive !== false,
      show_in_nav: Boolean(sec.showInNav),
      tag_id: sec.tagId || '',
    });
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Delete this home section?')) return;
    try {
      await storefrontService.deleteHomeSection(id);
      showToast('Section deleted');
      await loadAll();
      await refreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete section');
    }
  };

  const tabs: { id: ControlTab; label: string; icon: React.ReactNode }[] = [
    { id: 'nav', label: 'Navigation', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'tags', label: 'Tags', icon: <TagIcon className="w-3.5 h-3.5" /> },
    { id: 'campaigns', label: 'Flash / Sales', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'hero', label: 'Hero Slider', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { id: 'sections', label: 'Home Sections', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-900">Store Control</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage nav chips, product tags, flash/seasonal campaigns (timer + background), hero slideshow, and homepage rails — without editing frontend code.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors ${
              tab === t.id
                ? 'bg-sky-500 text-white border-sky-500'
                : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      )}

      {/* NAV */}
      {tab === 'nav' && (
        <div className="space-y-4">
          {/* Filter chips (New / Best Sellers / Sale) — these were seeded as home sections */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Filter chips under search (New / Sale / Best Sellers)</h3>
              <p className="text-[11px] text-slate-500">
                These are <strong>not hardcoded</strong> — they come from Home Sections. Uncheck{' '}
                <strong>Show in Nav</strong> to hide them under the search bar. They can still appear as homepage rails.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <tr>
                    <th className="p-3 w-24">Priority</th>
                    <th className="p-3">Label</th>
                    <th className="p-3">Tag</th>
                    <th className="p-3">Show in Nav</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...sections]
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((sec) => (
                      <tr key={sec.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <input
                            type="number"
                            min={1}
                            className="w-14 px-2 py-1.5 border border-slate-200 rounded-lg font-black"
                            value={sec.sortOrder}
                            onChange={(e) =>
                              handleSectionNavToggle(sec.id, {
                                sort_order: Math.max(1, Number(e.target.value) || 1),
                              })
                            }
                          />
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {sec.title}
                          <div className="text-[10px] text-slate-400 font-medium">{sec.key}</div>
                        </td>
                        <td className="p-3">
                          <select
                            className="px-2 py-1 border border-slate-200 rounded-lg bg-white"
                            value={sec.tagId || ''}
                            onChange={(e) =>
                              handleSectionNavToggle(sec.id, {
                                tag_id: e.target.value || null,
                              })
                            }
                          >
                            <option value="">No tag</option>
                            {tags.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={Boolean(sec.showInNav)}
                            onChange={(e) =>
                              handleSectionNavToggle(sec.id, { show_in_nav: e.target.checked })
                            }
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900">Real categories under search bar</h3>
            <p className="text-[11px] text-slate-500">
              Set <strong>Priority</strong> as 1, 2, 3… (lower number = shows first). Toggle Show in Nav /
              Featured. When Show in Nav is on, pick an optional tag chip.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="p-3 w-28">Priority</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Show in Nav</th>
                  <th className="p-3">Featured Grid</th>
                  <th className="p-3">Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...categories]
                  .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0) || a.name.localeCompare(b.name))
                  .map((cat, index, sorted) => (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          className="w-14 px-2 py-1.5 border border-slate-200 rounded-lg font-black text-slate-900"
                          value={cat.navOrder ?? index + 1}
                          title="1 = first under search bar"
                          onChange={(e) => {
                            const next = Math.max(1, Number(e.target.value) || 1);
                            handleNavToggle(cat.id, { navOrder: next });
                          }}
                        />
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            title="Move up (higher priority)"
                            className="px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-bold disabled:opacity-30 hover:bg-slate-100"
                            onClick={() => {
                              const prev = sorted[index - 1];
                              if (!prev) return;
                              const currentOrder = cat.navOrder ?? index + 1;
                              const prevOrder = prev.navOrder ?? index;
                              handleNavToggle(cat.id, { navOrder: prevOrder });
                              handleNavToggle(prev.id, { navOrder: currentOrder });
                            }}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={index === sorted.length - 1}
                            title="Move down (lower priority)"
                            className="px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-bold disabled:opacity-30 hover:bg-slate-100"
                            onClick={() => {
                              const nextCat = sorted[index + 1];
                              if (!nextCat) return;
                              const currentOrder = cat.navOrder ?? index + 1;
                              const nextOrder = nextCat.navOrder ?? index + 2;
                              handleNavToggle(cat.id, { navOrder: nextOrder });
                              handleNavToggle(nextCat.id, { navOrder: currentOrder });
                            }}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {cat.name}
                      <div className="text-[10px] text-slate-400 font-medium">{cat.slug}</div>
                    </td>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={Boolean(cat.showInNav)}
                        onChange={(e) => handleNavToggle(cat.id, { showInNav: e.target.checked })}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={cat.showInFeatured !== false}
                        onChange={(e) =>
                          handleNavToggle(cat.id, { showInFeatured: e.target.checked })
                        }
                      />
                    </td>
                    <td className="p-3">
                      {cat.showInNav ? (
                        <select
                          className="px-2 py-1 border border-slate-200 rounded-lg bg-white"
                          value={cat.tagId || ''}
                          onChange={(e) =>
                            handleNavToggle(cat.id, { tagId: e.target.value || null })
                          }
                        >
                          <option value="">No tag</option>
                          {tags
                            .filter((t) => t.isActive !== false)
                            .map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {/* TAGS */}
      {tab === 'tags' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <form onSubmit={handleCreateTag} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <h3 className="text-sm font-black text-slate-900">Add Tag</h3>
            <p className="text-[11px] text-slate-500">
              Create tags once here. Products and campaigns only pick from this list — no free typing, so names always match.
            </p>
            <input
              required
              placeholder="Display label (e.g. HOT / Sale)"
              value={tagForm.label}
              onChange={(e) => {
                const label = e.target.value;
                // Auto-fill internal name from label so it stays consistent
                const autoName = label
                  .toLowerCase()
                  .trim()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]/g, '');
                setTagForm((prev) => ({ ...prev, label, name: autoName }));
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
            <input
              placeholder="Internal name (auto from label, e.g. hot)"
              value={tagForm.name}
              onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
            />
            <input
              type="color"
              value={tagForm.color}
              onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
              className="w-full h-10 rounded-xl"
            />
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Create Tag
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
            <h3 className="text-sm font-black text-slate-900">Tag List</h3>
            {tags.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.label}
                  </span>
                  <span className="text-[11px] text-slate-500">{t.name}</span>
                </div>
                <button type="button" onClick={() => handleDeleteTag(t.id)} className="text-rose-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HERO */}
      {tab === 'hero' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <form onSubmit={handleSaveSlide} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <h3 className="text-sm font-black text-slate-900">
              {editingSlideId ? 'Edit Slide' : 'Add Hero Slide'}
            </h3>
            <p className="text-[11px] text-slate-500">Images upload through Cloudinary (Settings credentials).</p>
            <ImageUploadWidget
              initialImage={slideForm.image_url || undefined}
              onUploadSuccess={(url) => setSlideForm({ ...slideForm, image_url: url })}
            />
            <input
              required
              placeholder="Title"
              value={slideForm.title}
              onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
            <input
              placeholder="Badge"
              value={slideForm.badge}
              onChange={(e) => setSlideForm({ ...slideForm, badge: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
            <textarea
              placeholder="Subtitle"
              value={slideForm.subtitle}
              onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs min-h-[70px]"
            />
            <input
              placeholder="Button text"
              value={slideForm.button_text}
              onChange={(e) => setSlideForm({ ...slideForm, button_text: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={slideForm.link_type}
                onChange={(e) => setSlideForm({ ...slideForm, link_type: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
              >
                <option value="category">Category slug</option>
                <option value="shop">Shop all</option>
                <option value="url">External URL</option>
                <option value="none">No link</option>
              </select>
              <input
                placeholder="Link value (slug or URL)"
                value={slideForm.link_value}
                onChange={(e) => setSlideForm({ ...slideForm, link_value: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> {editingSlideId ? 'Update' : 'Create'}
              </button>
              {editingSlideId && (
                <button type="button" onClick={resetSlideForm} className="px-4 py-2 border rounded-xl text-xs font-bold">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="space-y-2">
            {slides.map((slide) => (
              <div key={slide.id} className="bg-white rounded-2xl border border-slate-200 p-3 flex gap-3">
                <img src={slide.imageUrl} alt="" className="w-24 h-16 object-cover rounded-xl" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">{slide.title}</div>
                  <div className="text-[10px] text-slate-500">{slide.linkType}: {slide.linkValue || '—'}</div>
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={() => handleEditSlide(slide)} className="text-[10px] font-bold text-sky-600">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteSlide(slide.id)} className="text-[10px] font-bold text-rose-600">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTIONS */}
      {tab === 'sections' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <form onSubmit={handleSaveSection} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <h3 className="text-sm font-black text-slate-900">
              {editingSectionId ? 'Edit Home Section' : 'Add Home Section'}
            </h3>
            <input
              required
              placeholder="Key (e.g. new-arrivals)"
              value={sectionForm.key}
              disabled={Boolean(editingSectionId)}
              onChange={(e) => setSectionForm({ ...sectionForm, key: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
            <input
              required
              placeholder="Title"
              value={sectionForm.title}
              onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
            <input
              placeholder="Subtitle"
              value={sectionForm.subtitle}
              onChange={(e) => setSectionForm({ ...sectionForm, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
            <input
              placeholder="Section badge text"
              value={sectionForm.section_badge}
              onChange={(e) => setSectionForm({ ...sectionForm, section_badge: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={sectionForm.source_type}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, source_type: e.target.value, source_value: '' })
                }
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
              >
                <option value="badge">By product badge</option>
                <option value="tag">By Tags list</option>
                <option value="category">By category</option>
                <option value="rule">Rule (sale/newest/rating)</option>
                <option value="discount">Any discount badge</option>
              </select>
              {sectionForm.source_type === 'category' ? (
                <select
                  value={sectionForm.source_value}
                  onChange={(e) => setSectionForm({ ...sectionForm, source_value: e.target.value })}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : sectionForm.source_type === 'tag' ? (
                <select
                  required
                  value={sectionForm.source_value}
                  onChange={(e) => setSectionForm({ ...sectionForm, source_value: e.target.value })}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">Select tag from list</option>
                  {tags.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.label} ({t.name})
                    </option>
                  ))}
                </select>
              ) : sectionForm.source_type === 'rule' ? (
                <select
                  value={sectionForm.source_value}
                  onChange={(e) => setSectionForm({ ...sectionForm, source_value: e.target.value })}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">Select rule</option>
                  <option value="sale">sale</option>
                  <option value="newest">newest</option>
                  <option value="rating">rating</option>
                </select>
              ) : sectionForm.source_type === 'badge' ? (
                <select
                  value={sectionForm.source_value}
                  onChange={(e) => setSectionForm({ ...sectionForm, source_value: e.target.value })}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">Select badge</option>
                  <option value="New">New</option>
                  <option value="Best Seller">Best Seller</option>
                  <option value="Flash Sale">Flash Sale</option>
                  <option value="Must Have">Must Have</option>
                  <option value="Trending">Trending</option>
                </select>
              ) : (
                <input
                  placeholder="optional"
                  value={sectionForm.source_value}
                  onChange={(e) => setSectionForm({ ...sectionForm, source_value: e.target.value })}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              )}
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={sectionForm.show_in_nav}
                onChange={(e) => setSectionForm({ ...sectionForm, show_in_nav: e.target.checked })}
              />
              Also show as nav chip under search
            </label>
            {sectionForm.show_in_nav && (
              <select
                value={sectionForm.tag_id}
                onChange={(e) => setSectionForm({ ...sectionForm, tag_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              >
                <option value="">No tag</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            )}
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> {editingSectionId ? 'Update' : 'Create'}
              </button>
              {editingSectionId && (
                <button type="button" onClick={resetSectionForm} className="px-4 py-2 border rounded-xl text-xs font-bold">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="space-y-2">
            {sections.map((sec) => (
              <div key={sec.id} className="bg-white rounded-2xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-black text-slate-900">{sec.title}</div>
                    <div className="text-[10px] text-slate-500">
                      {sec.key} · {sec.sourceType}:{sec.sourceValue || '—'}
                      {sec.showInNav ? ' · nav chip' : ''}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEditSection(sec)} className="text-[10px] font-bold text-sky-600">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteSection(sec.id)} className="text-[10px] font-bold text-rose-600">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'campaigns' && <AdminCampaigns />}
    </div>
  );
};
