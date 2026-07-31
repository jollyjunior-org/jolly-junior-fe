import React, { useEffect, useState } from 'react';
import { X, MapPin, Package, Upload, Loader2, LogOut } from 'lucide-react';
import { useShopStore } from '@/store/useShopStore';
import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';
import { uploadStoreImage } from '@/services/store-upload-service';

type Profile = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  avatar_url?: string | null;
};

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  city: string;
  created_at?: string;
  items: Array<{ product_name: string; quantity: number; price: number }>;
};

/**
 * Logged-in account drawer: avatar, save address, order history (by user_id + email).
 */
export const AccountPanel: React.FC = () => {
  const {
    accountPanelOpen,
    setAccountPanelOpen,
    isCustomerAuthenticated,
    logoutCustomer,
    showToast,
  } = useShopStore();

  const [tab, setTab] = useState<'profile' | 'orders'>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addr, setAddr] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    city: 'Lahore',
    postal_code: '',
  });

  useEffect(() => {
    if (!accountPanelOpen || !isCustomerAuthenticated) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [p, o] = await Promise.all([
          apiFetch<Profile>(publicEndpoints.meProfile(), { authMode: 'customer' }),
          apiFetch<{ items: OrderRow[] }>(publicEndpoints.meOrders(), { authMode: 'customer' }),
        ]);
        if (cancelled) return;
        setProfile(p);
        setOrders(o.items || []);
        setAddr({
          full_name: p.name || '',
          phone: p.phone || '',
          address_line1: p.address || '',
          city: p.city || 'Lahore',
          postal_code: p.postal_code || '',
        });
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Could not load account');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountPanelOpen, isCustomerAuthenticated]);

  if (!accountPanelOpen) return null;

  const avatarSrc =
    profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'P')}&background=5A5A40&color=fff`;

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(publicEndpoints.meAddresses(), {
        method: 'POST',
        authMode: 'customer',
        body: JSON.stringify({ ...addr, is_default: true, label: 'Home' }),
      });
      const p = await apiFetch<Profile>(publicEndpoints.meProfile(), { authMode: 'customer' });
      setProfile(p);
      showToast('Address saved');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onAvatar = async (file: File | null) => {
    if (!file) return;
    try {
      const url = await uploadStoreImage(file, 'avatars', file.name);
      const p = await apiFetch<Profile>(publicEndpoints.meProfile(), {
        method: 'PUT',
        authMode: 'customer',
        body: JSON.stringify({ avatar_url: url }),
      });
      setProfile(p);
      showToast('Avatar updated');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Avatar upload failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[75]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setAccountPanelOpen(false)} />
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F5F2ED]">
          <h2 className="text-sm font-black text-[#5A5A40]">My Account</h2>
          <button
            type="button"
            onClick={() => setAccountPanelOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 p-3 border-b border-[#F5F2ED]">
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer ${
              tab === 'profile' ? 'bg-[#F5F2ED] text-[#5A5A40]' : 'text-slate-500'
            }`}
          >
            Profile & Address
          </button>
          <button
            type="button"
            onClick={() => setTab('orders')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer ${
              tab === 'orders' ? 'bg-[#F5F2ED] text-[#5A5A40]' : 'text-slate-500'
            }`}
          >
            Order History
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#FFB347]" />
            </div>
          )}

          {!loading && tab === 'profile' && profile && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={avatarSrc}
                    alt={profile.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#FFB347]"
                  />
                  <label className="absolute -bottom-1 -right-1 p-1.5 bg-[#5A5A40] text-white rounded-full cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onAvatar(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-black text-[#5A5A40]">{profile.name}</p>
                  <p className="text-[11px] text-slate-500">{profile.email}</p>
                </div>
              </div>

              <form onSubmit={saveAddress} className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Saved shipping address
                </p>
                <input
                  required
                  placeholder="Full name"
                  value={addr.full_name}
                  onChange={(e) => setAddr({ ...addr, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
                <input
                  placeholder="Phone"
                  value={addr.phone}
                  onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
                <input
                  required
                  placeholder="Street address"
                  value={addr.address_line1}
                  onChange={(e) => setAddr({ ...addr, address_line1: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={addr.city}
                    onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  >
                    {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Multan'].map(
                      (c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ),
                    )}
                  </select>
                  <input
                    placeholder="Postal code"
                    value={addr.postal_code}
                    onChange={(e) => setAddr({ ...addr, postal_code: e.target.value })}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 bg-[#5A5A40] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save address
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  logoutCustomer();
                  setAccountPanelOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-600 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          )}

          {!loading && tab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">No orders yet for this email.</p>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="rounded-2xl border border-[#F5F2ED] p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#5A5A40] flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" /> {o.order_number}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {o.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {o.created_at ? new Date(o.created_at).toLocaleString() : ''} · {o.city}
                    </p>
                    <ul className="text-[11px] text-slate-600 space-y-0.5">
                      {o.items.map((i, idx) => (
                        <li key={idx}>
                          {i.quantity}× {i.product_name}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs font-bold text-[#5A5A40]">
                      Rs. {Number(o.total_amount).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
