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

interface OrderReturnRow {
  id: string;
  return_number: string;
  status: string;
  reason: string;
  refund_amount: number;
  created_at?: string;
}

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  city?: string;
  created_at?: string;
  items: Array<{
    id?: number;
    product_id?: string;
    product_name: string;
    variant_name?: string;
    quantity: number;
    price: number;
  }>;
  returns?: OrderReturnRow[];
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

  const [returnOrder, setReturnOrder] = useState<OrderRow | null>(null);
  const [returnReason, setReturnReason] = useState('Defective / Damaged');
  const [returnNotes, setReturnNotes] = useState('');
  const [selectedReturnQtys, setSelectedReturnQtys] = useState<Record<number, number>>({});
  const [submittingReturn, setSubmittingReturn] = useState(false);

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
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#D9F1F5]">
          <h2 className="text-sm font-black text-[#0798AE]">My Account</h2>
          <button
            type="button"
            onClick={() => setAccountPanelOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 p-3 border-b border-[#D9F1F5]">
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer ${
              tab === 'profile' ? 'bg-[#D9F1F5] text-[#0798AE]' : 'text-slate-500'
            }`}
          >
            Profile & Address
          </button>
          <button
            type="button"
            onClick={() => setTab('orders')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer ${
              tab === 'orders' ? 'bg-[#D9F1F5] text-[#0798AE]' : 'text-slate-500'
            }`}
          >
            Order History
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#FFD52F]" />
            </div>
          )}

          {!loading && tab === 'profile' && profile && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={avatarSrc}
                    alt={profile.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#FFD52F]"
                  />
                  <label className="absolute -bottom-1 -right-1 p-1.5 bg-[#0798AE] text-white rounded-full cursor-pointer">
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
                  <p className="text-sm font-black text-[#0798AE]">{profile.name}</p>
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
                  className="w-full py-2.5 bg-[#0798AE] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
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
                  <div key={o.id} className="rounded-2xl border border-[#D9F1F5] p-3 space-y-2 bg-white shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#0798AE] flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" /> {o.order_number}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {o.status}
                        </span>
                        {o.returns && o.returns.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Return {o.returns[0].status}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {o.created_at ? new Date(o.created_at).toLocaleString() : ''} · {o.city}
                    </p>
                    <ul className="text-[11px] text-slate-600 space-y-0.5 divide-y divide-slate-50">
                      {o.items.map((i, idx) => (
                        <li key={idx} className="py-0.5 flex justify-between">
                          <span>
                            {i.quantity}× {i.product_name} {i.variant_name ? `(${i.variant_name})` : ''}
                          </span>
                          <span className="font-semibold text-slate-700">
                            Rs. {(i.price * i.quantity).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <p className="text-xs font-bold text-[#0798AE]">
                        Total: Rs. {Number(o.total_amount).toLocaleString()}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setReturnOrder(o);
                          const initialQtys: Record<number, number> = {};
                          (o.items || []).forEach((item) => {
                            if (item.id) initialQtys[item.id] = item.quantity;
                          });
                          setSelectedReturnQtys(initialQtys);
                          setReturnReason('Defective / Damaged');
                          setReturnNotes('');
                        }}
                        className="text-[10px] font-bold text-[#0798AE] bg-[#D9F1F5] hover:bg-[#bce6ed] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Request Return
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Customer Return Request Modal */}
        {returnOrder && (
          <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-sm text-slate-800">
                  Return Request: {returnOrder.order_number}
                </h4>
                <button
                  type="button"
                  onClick={() => setReturnOrder(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">Select Items to Return:</p>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {returnOrder.items.map((item) => (
                    <div key={item.id || item.product_name} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl">
                      <div className="flex-1 pr-2 truncate">
                        <p className="font-semibold text-slate-800 truncate">{item.product_name}</p>
                        <p className="text-[10px] text-slate-500">Max Qty: {item.quantity}</p>
                      </div>
                      {item.id && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedReturnQtys((prev) => ({
                                ...prev,
                                [item.id!]: Math.max(0, (prev[item.id!] || 0) - 1),
                              }))
                            }
                            className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold">{selectedReturnQtys[item.id] || 0}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedReturnQtys((prev) => ({
                                ...prev,
                                [item.id!]: Math.min(item.quantity, (prev[item.id!] || 0) + 1),
                              }))
                            }
                            className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                >
                  <option value="Defective / Damaged">Defective / Damaged</option>
                  <option value="Wrong Item Received">Wrong Item Received</option>
                  <option value="Item Not as Described">Item Not as Described</option>
                  <option value="Changed Mind">Changed Mind</option>
                  <option value="Size/Fit Issue">Size/Fit Issue</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Additional Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Explain why you are returning..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnOrder(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingReturn}
                  onClick={async () => {
                    const itemsToReturn = Object.entries(selectedReturnQtys)
                      .filter(([, qty]) => qty > 0)
                      .map(([itemIdStr, qty]) => ({
                        order_item_id: Number(itemIdStr),
                        quantity: qty,
                      }));

                    if (!itemsToReturn.length) {
                      showToast('Please select at least 1 item quantity to return.');
                      return;
                    }

                    setSubmittingReturn(true);
                    try {
                      const { requestCustomerReturn } = await import('@/services/customer-service');
                      const res = await requestCustomerReturn(returnOrder.id, {
                        reason: returnReason,
                        notes: returnNotes,
                        items: itemsToReturn,
                      });
                      showToast(`Return submitted! Return #${res.return_number}`);
                      setReturnOrder(null);
                      // Refresh orders
                      const o = await apiFetch<{ items: OrderRow[] }>(publicEndpoints.meOrders(), { authMode: 'customer' });
                      setOrders(o.items || []);
                    } catch (err: unknown) {
                      showToast(err instanceof Error ? err.message : 'Could not submit return');
                    } finally {
                      setSubmittingReturn(false);
                    }
                  }}
                  className="flex-1 py-2.5 bg-[#0798AE] hover:bg-[#06879b] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  {submittingReturn && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Return
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
