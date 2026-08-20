import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Loader2, Image as ImageIcon, Tag as TagIcon, LayoutGrid, SlidersHorizontal, Flame, Truck, Instagram } from 'lucide-react';
import { useShopStore } from '@/store/useShopStore';
import { AdminCampaigns } from '@/components/admin/AdminCampaigns';
import { AdminPromos } from '@/components/admin/AdminPromos';
import { ImageUploadWidget } from '@/components/admin/ImageUploadWidget';
import { ReloadButton } from '@/components/admin/ReloadButton';
import { fetchStoreSettings, saveStoreSettings } from '@/services/settings-service';
import * as storefrontService from '@/services/storefront-service';
import type { StoreTag, HeroSlideConfig, HomeSectionConfig } from '@/types';

type ControlTab = 'nav' | 'tags' | 'hero' | 'sections' | 'campaigns' | 'promos' | 'store';

/**
 * Admin Control tab — manage storefront nav, tags, hero slides, home rails, promo codes, and store settings.
 * Hero slides pick a category only — image/name/description come from Categories.
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
  const [desktopUploading, setDesktopUploading] = useState(false);
  const [mobileUploading, setMobileUploading] = useState(false);
  const [slideSessionId, setSlideSessionId] = useState<string>(() => crypto.randomUUID());
  const [slideForm, setSlideForm] = useState({
    link_value: '',
    button_text: 'Shop Now',
    sort_order: 0,
    is_active: true,
    image_url: '',
    mobile_image_url: '',
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
  const [settingsForm, setSettingsForm] = useState({
    delivery_fee: 250,
    free_delivery_threshold: 3000,
    instagram_url: '',
    facebook_url: '',
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

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
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const data = await fetchStoreSettings();
      setSettingsForm({
        delivery_fee: Number(data.delivery_fee ?? 250),
        free_delivery_threshold: Number(data.free_delivery_threshold ?? 3000),
        instagram_url: String(data.footer_instagram_url ?? ''),
        facebook_url: String(data.footer_facebook_url ?? ''),
      });
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load store settings');
    } finally {
      setSettingsLoading(false);
    }
  };

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

  // —— Hero (category pick only — no duplicate image/copy) ——
  const resetSlideForm = () => {
    setEditingSlideId(null);
    setSlideSessionId(crypto.randomUUID());
    setSlideForm({
      link_value: '',
      button_text: 'Shop Now',
      sort_order: slides.length + 1,
      is_active: true,
      image_url: '',
      mobile_image_url: '',
    });
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.link_value) {
      showToast('Select a category for this slide');
      return;
    }
    try {
      const payload: Record<string, unknown> = {
        link_type: 'category',
        link_value: slideForm.link_value,
        button_text: slideForm.button_text || 'Shop Now',
        sort_order: slideForm.sort_order,
        is_active: slideForm.is_active,
      };
      if (!editingSlideId) {
        payload.id = slideSessionId;
      }
      // Send hero-specific image overrides if provided
      if (slideForm.image_url) payload.image_url = slideForm.image_url;
      if (slideForm.mobile_image_url) payload.mobile_image_url = slideForm.mobile_image_url;
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
    setSlideSessionId(slide.id);
    setSlideForm({
      link_value: slide.linkValue || '',
      button_text: slide.buttonText || 'Shop Now',
      sort_order: slide.sortOrder || 0,
      is_active: slide.isActive !== false,
      image_url: slide.imageUrl || '',
      mobile_image_url: slide.mobileImageUrl || '',
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

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await saveStoreSettings({
        delivery_fee: Number(settingsForm.delivery_fee),
        free_delivery_threshold: Number(settingsForm.free_delivery_threshold),
        footer_instagram_url: settingsForm.instagram_url || null,
        footer_facebook_url: settingsForm.facebook_url || null,
      });
      showToast('Store settings saved successfully!');
      await loadSettings();
      await refreshPublic();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save store settings');
    } finally {
      setSettingsSaving(false);
    }
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
    { id: 'promos', label: 'Promos', icon: <TagIcon className="w-3.5 h-3.5" /> },
    { id: 'store', label: 'Store Settings', icon: <Truck className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900">Store Control</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage nav chips, product tags, flash/seasonal campaigns, hero slideshow, and homepage rails.
          </p>
        </div>
        <ReloadButton onReload={loadAll} label="Reload Control Data" />
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
              Tag a product <strong>COMING SOON</strong> to show it on the store without Add to Cart.
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

      {/* HERO — pick categories; optionally upload hero-specific images */}
      {tab === 'hero' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <form onSubmit={handleSaveSlide} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <h3 className="text-sm font-black text-slate-900">
              {editingSlideId ? 'Edit Hero Slide' : 'Add Hero Slide'}
            </h3>
            <p className="text-[11px] text-slate-500">
              Pick a category for the link. Upload a separate hero image (desktop + mobile) — or leave blank to use the category image.
            </p>
            <label className="block text-[11px] font-bold text-slate-600">Category *</label>
            <select
              required
              value={slideForm.link_value}
              onChange={(e) => setSlideForm({ ...slideForm, link_value: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            >
              <option value="">Select category…</option>
              {categories
                .filter((c) => c.isEnabled !== false)
                .map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
            </select>

            {/* Desktop hero image upload */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Desktop Hero Image</label>
              <p className="text-[10px] text-slate-400 mb-1.5">Recommended: 2560×1000px landscape. Overrides category image.</p>
              <ImageUploadWidget
                folder="hero"
                disabled={!slideForm.link_value}
                disabledHint="Select a category first to enable desktop image upload"
                onUploadingStateChange={setDesktopUploading}
                entityId={editingSlideId || slideSessionId}
                initialImage={slideForm.image_url || null}
                onUploadSuccess={(result) =>
                  setSlideForm((prev) => ({
                    ...prev,
                    image_url: result?.secure_url || '',
                  }))
                }
              />
            </div>

            {/* Mobile hero image upload */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile Hero Image <span className="font-normal text-slate-400">(optional)</span></label>
              <p className="text-[10px] text-slate-400 mb-1.5">Recommended: 800×800px or 3:4 ratio. Shown on small screens.</p>
              <ImageUploadWidget
                folder="hero"
                disabled={!slideForm.link_value}
                disabledHint="Select a category first to enable mobile image upload"
                onUploadingStateChange={setMobileUploading}
                entityId={editingSlideId || slideSessionId}
                initialImage={slideForm.mobile_image_url || null}
                onUploadSuccess={(result) =>
                  setSlideForm((prev) => ({
                    ...prev,
                    mobile_image_url: result?.secure_url || '',
                  }))
                }
              />
            </div>

            <input
              placeholder="Button text"
              value={slideForm.button_text}
              onChange={(e) => setSlideForm({ ...slideForm, button_text: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Sort order"
                value={slideForm.sort_order}
                onChange={(e) =>
                  setSlideForm({ ...slideForm, sort_order: Number(e.target.value) || 0 })
                }
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 px-2">
                <input
                  type="checkbox"
                  checked={slideForm.is_active}
                  onChange={(e) => setSlideForm({ ...slideForm, is_active: e.target.checked })}
                />
                Active on store
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!slideForm.link_value || desktopUploading || mobileUploading}
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {desktopUploading || mobileUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> {editingSlideId ? 'Update' : 'Create'}
                  </>
                )}
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
                <div className="flex gap-2 shrink-0">
                  {slide.imageUrl ? (
                    <img src={slide.imageUrl} alt="Desktop" className="w-24 h-16 object-cover rounded-xl" />
                  ) : (
                    <div className="w-24 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-[10px] text-slate-500">
                      No image
                    </div>
                  )}
                  {slide.mobileImageUrl && (
                    <img src={slide.mobileImageUrl} alt="Mobile" className="w-12 h-16 object-cover rounded-xl border-2 border-sky-200" title="Mobile image" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">{slide.title}</div>
                  <div className="text-[10px] text-slate-500">
                    Category: {slide.linkValue || '—'}
                    {slide.isActive === false ? ' · Hidden' : ''}
                    {slide.mobileImageUrl ? ' · Mobile ✓' : ''}
                  </div>
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
            {!slides.length && (
              <p className="text-xs text-slate-500 p-4 border border-dashed rounded-2xl">
                No hero slides yet. Add one by selecting a category.
              </p>
            )}
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

      {tab === 'promos' && <AdminPromos />}

      {tab === 'store' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-black text-slate-900">Store shipping settings</h3>
                <p className="text-[11px] text-slate-500">
                  Control the delivery fee and free shipping threshold used by checkout and cart pricing.
                </p>
              </div>
            </div>

            {settingsLoading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading store settings…
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery fee (Rs.)</label>
                  <input
                    type="number"
                    min={0}
                    value={settingsForm.delivery_fee}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, delivery_fee: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Free delivery over (Rs.)</label>
                  <input
                    type="number"
                    min={0}
                    value={settingsForm.free_delivery_threshold}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        free_delivery_threshold: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Instagram className="w-5 h-5 text-pink-500" />
              <div>
                <h3 className="text-sm font-black text-slate-900">Footer social links</h3>
                <p className="text-[11px] text-slate-500">
                  Update the Instagram and Facebook links shown in the website footer.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instagram URL</label>
                <input
                  type="url"
                  placeholder="https://www.instagram.com/YourHandle/"
                  value={settingsForm.instagram_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Facebook URL</label>
                <input
                  type="url"
                  placeholder="https://www.facebook.com/YourPage"
                  value={settingsForm.facebook_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={settingsLoading || settingsSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-xs font-bold transition-colors disabled:opacity-60"
            >
              {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save store settings
            </button>
          </div>
        </div>
      )}

      {tab === 'campaigns' && <AdminCampaigns />}
    </div>
  );
};
