'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Tag, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import * as promoService from '@/services/promo-service';
import type { PromoCode } from '@/services/promo-service';

/**
 * Admin UI to create / edit / delete promo codes verified by the storefront API.
 */
export const AdminPromos: React.FC = () => {
  const [items, setItems] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: 10,
    min_order_amount: 0,
    max_uses: '' as string | number,
    is_active: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      setItems(await promoService.fetchAdminPromoCodes());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  /** Create a new promo from the form. */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    setSaving(true);
    try {
      await promoService.createPromoCode({
        code: form.code.trim().toUpperCase(),
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount) || 0,
        max_uses: form.max_uses === '' ? null : Number(form.max_uses),
        is_active: form.is_active,
      });
      setForm({
        code: '',
        description: '',
        discount_type: 'percent',
        discount_value: 10,
        min_order_amount: 0,
        max_uses: '',
        is_active: true,
      });
      await load();
    } catch (err: unknown) {
      window.alert(err instanceof Error ? err.message : 'Failed to create promo');
    } finally {
      setSaving(false);
    }
  };

  /** Toggle active flag. */
  const toggleActive = async (promo: PromoCode) => {
    try {
      await promoService.updatePromoCode(promo.id, { is_active: !promo.is_active });
      await load();
    } catch (err: unknown) {
      window.alert(err instanceof Error ? err.message : 'Update failed');
    }
  };

  /** Delete promo. */
  const handleDelete = async (promo: PromoCode) => {
    if (!window.confirm(`Delete promo ${promo.code}?`)) return;
    try {
      await promoService.deletePromoCode(promo.id);
      await load();
    } catch (err: unknown) {
      window.alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Tag className="w-5 h-5 text-sky-500" />
          Promo Codes
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Customers enter these at checkout. The storefront always verifies codes with the API.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-1">Code *</label>
          <input
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="JOLLY10"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-1">Type</label>
          <select
            value={form.discount_type}
            onChange={(e) =>
              setForm({ ...form, discount_type: e.target.value as 'percent' | 'fixed' })
            }
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-500"
          >
            <option value="percent">Percent %</option>
            <option value="fixed">Fixed Rs.</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-1">
            Value ({form.discount_type === 'percent' ? '%' : 'Rs.'}) *
          </label>
          <input
            type="number"
            min={1}
            required
            value={form.discount_value}
            onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-1">Min order (Rs.)</label>
          <input
            type="number"
            min={0}
            value={form.min_order_amount}
            onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-1">Max uses (blank = ∞)</label>
          <input
            type="number"
            min={1}
            value={form.max_uses}
            onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-1">Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Welcome offer"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-500"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="accent-sky-600"
            />
            Active
          </label>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-60"
          >
            <Plus className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : 'Add promo'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-bold">Code</th>
              <th className="px-4 py-3 font-bold">Discount</th>
              <th className="px-4 py-3 font-bold">Min order</th>
              <th className="px-4 py-3 font-bold">Uses</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No promo codes yet.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-black text-slate-800">{p.code}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {p.discount_type === 'percent'
                      ? `${Number(p.discount_value)}%`
                      : `Rs. ${Number(p.discount_value).toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3">Rs. {Number(p.min_order_amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {p.used_count}
                    {p.max_uses != null ? ` / ${p.max_uses}` : ' / ∞'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(p)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                        p.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {p.is_active ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {p.is_active ? 'Active' : 'Off'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
