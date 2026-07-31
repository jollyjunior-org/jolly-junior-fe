import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Loader2, Flame } from 'lucide-react';
import * as storefrontService from '@/services/storefront-service';
import { ImageUploadWidget } from '@/components/admin/ImageUploadWidget';
import { TagMultiSelect } from '@/components/admin/TagMultiSelect';
import type { CampaignConfig, StoreTag } from '@/types';
import { useShopStore } from '@/store/useShopStore';

/** Convert ISO datetime to datetime-local input value. */
function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert datetime-local value to ISO string (or null). */
function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const emptyForm = {
  key: 'daily-flash',
  title: 'Daily Flash Deals',
  subtitle: '',
  badge_text: 'UP TO 30% OFF',
  campaign_type: 'flash',
  starts_at: '',
  ends_at: '',
  background_color: '#FDFD96',
  background_image_url: '',
  accent_color: '#FFB347',
  max_items: 8,
  sort_order: 0,
  is_active: true,
  tag_ids: [] as string[],
};

/**
 * Admin Control → Campaigns.
 * Manage flash / seasonal sales: copy, timer, background, product tags.
 */
export const AdminCampaigns: React.FC = () => {
  const { showToast } = useShopStore();
  const [campaigns, setCampaigns] = useState<CampaignConfig[]>([]);
  const [tags, setTags] = useState<StoreTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [c, t] = await Promise.all([
        storefrontService.fetchAdminCampaigns(),
        storefrontService.fetchAdminTags(),
      ]);
      setCampaigns(c);
      setTags(t);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (c: CampaignConfig) => {
    setEditingId(c.id);
    setForm({
      key: c.key,
      title: c.title,
      subtitle: c.subtitle || '',
      badge_text: c.badgeText || '',
      campaign_type: c.campaignType || 'flash',
      starts_at: toLocalInput(c.startsAt),
      ends_at: toLocalInput(c.endsAt),
      background_color: c.backgroundColor || '#FDFD96',
      background_image_url: c.backgroundImageUrl || '',
      accent_color: c.accentColor || '#FFB347',
      max_items: c.maxItems || 8,
      sort_order: c.sortOrder || 0,
      is_active: c.isActive !== false,
      tag_ids: c.tagIds || c.tags.map((t) => t.id),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.key.trim() || !form.title.trim()) {
      showToast('Key and title are required');
      return;
    }
    const payload = {
      key: form.key.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle || null,
      badge_text: form.badge_text || null,
      campaign_type: form.campaign_type,
      starts_at: fromLocalInput(form.starts_at),
      ends_at: fromLocalInput(form.ends_at),
      background_color: form.background_color,
      background_image_url: form.background_image_url || null,
      accent_color: form.accent_color,
      max_items: Number(form.max_items) || 8,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
      tag_ids: form.tag_ids,
    };
    try {
      if (editingId) {
        await storefrontService.updateCampaign(editingId, payload);
        showToast('Campaign updated');
      } else {
        await storefrontService.createCampaign(payload);
        showToast('Campaign created');
      }
      resetForm();
      await load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save campaign');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await storefrontService.deleteCampaign(id);
      showToast('Campaign deleted');
      if (editingId === id) resetForm();
      await load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Sales & Flash Campaigns
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Control homepage sales (Flash, Azaadi, 11.11, etc.): title, timer end, background, and
            product tags. Any <strong>Active</strong> campaign within its start/end dates appears on
            the storefront — tag products with the same tags or the rail may look empty.
          </p>
        </div>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <form
          onSubmit={handleSave}
          className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
        >
          <div className="text-xs font-bold text-slate-700">
            {editingId ? 'Edit Campaign' : 'New Campaign'}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500">Key *</label>
              <input
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                placeholder="azaadi-sale / daily-flash / 11-11-2026"
                className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500">Type</label>
              <select
                value={form.campaign_type}
                onChange={(e) => setForm({ ...form, campaign_type: e.target.value })}
                className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
              >
                <option value="flash">Flash</option>
                <option value="seasonal">Seasonal (11.11 / 12.12)</option>
                <option value="clearance">Clearance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500">Subtitle</label>
            <input
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500">Badge text (e.g. UP TO 30% OFF)</label>
            <input
              value={form.badge_text}
              onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
              className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500">Starts at</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500">Ends at (countdown)</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500">Background color</label>
              <input
                type="color"
                value={form.background_color}
                onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                className="w-full mt-0.5 h-9 border border-slate-200 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500">Accent color</label>
              <input
                type="color"
                value={form.accent_color}
                onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                className="w-full mt-0.5 h-9 border border-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1 block">
              Background image (optional)
            </label>
            <ImageUploadWidget
              folder="campaigns"
              initialImage={form.background_image_url || undefined}
              onUploadSuccess={(url) => setForm({ ...form, background_image_url: url })}
            />
            {form.background_image_url && (
              <button
                type="button"
                onClick={() => setForm({ ...form, background_image_url: '' })}
                className="mt-1 text-[10px] font-bold text-rose-600 cursor-pointer"
              >
                Clear background image
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500">Max products</label>
              <input
                type="number"
                min={1}
                max={48}
                value={form.max_items}
                onChange={(e) => setForm({ ...form, max_items: Number(e.target.value) })}
                className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Active / live
              </label>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1 block">
              Product tags in this sale
            </label>
            <TagMultiSelect
              tags={tags}
              selectedIds={form.tag_ids}
              onChange={(tag_ids) => setForm((prev) => ({ ...prev, tag_ids }))}
              hint="Pick the same Tags-list entries you put on products. No typing — so names always match."
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Existing campaigns
          </div>
          {campaigns.length === 0 && (
            <p className="text-[11px] text-slate-400 py-6 text-center">No campaigns yet</p>
          )}
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="border border-slate-100 rounded-lg p-3 flex items-start justify-between gap-2 hover:bg-slate-50"
            >
              <button type="button" onClick={() => handleEdit(c)} className="text-left flex-1 cursor-pointer">
                <div className="text-xs font-black text-slate-900">{c.title}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {c.key} · {c.campaignType}
                  {c.badgeText ? ` · ${c.badgeText}` : ''}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {c.endsAt ? `Ends ${new Date(c.endsAt).toLocaleString()}` : 'No end time'}
                  {' · '}
                  {c.isActive ? 'Active' : 'Off'}
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {c.tags.map((t) => (
                    <span
                      key={t.id}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
