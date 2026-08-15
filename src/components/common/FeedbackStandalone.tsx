import React, { useEffect, useState } from 'react';
import { Star, Upload, Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';
import { uploadStoreImage } from '@/services/store-upload-service';
import { useShopStore } from '@/store/useShopStore';

export const FeedbackStandalone: React.FC<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const { showToast } = useShopStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<{
    order_number: string;
    customer_name: string;
    city?: string;
    products: { id: string; name: string }[];
    suggested_product?: string;
  } | null>(null);

  const [form, setForm] = useState({
    parent_name: '',
    city: '',
    rating: 5,
    comment: '',
    product_id: '',
    photo_url: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{
          order_number: string;
          customer_name: string;
          city?: string;
          products: { id: string; name: string }[];
          suggested_product?: string;
        }>(publicEndpoints.testimonialInvite(token), { skipAuth: true });
        if (cancelled) return;
        setInvite(data);
        setForm((f) => ({
          ...f,
          parent_name: data.customer_name || '',
          city: data.city || '',
          product_id: data.suggested_product || '',
        }));
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Invalid or expired link');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const close = () => {
    router.push('/');
  };

  const onPhoto = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadStoreImage(file, 'testimonials', file.name);
      setForm((f) => ({ ...f, photo_url: url }));
      showToast('Photo uploaded');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch(publicEndpoints.testimonials(), {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          feedback_token: token,
          parent_name: form.parent_name,
          city: form.city,
          rating: form.rating,
          comment: form.comment,
          product_id: form.product_id || null,
          photo_url: form.photo_url || null,
        }),
      });
      setDone(true);
      showToast('Thank you for sharing!');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Could not submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-black text-[#0798AE] mb-1">Share your happy moment</h2>
        <p className="text-sm text-slate-500 mb-6">
          One short note + one photo after delivery — it may appear on our homepage.
        </p>

        {loading && (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFD52F]" />
          </div>
        )}
        {error && (
          <div className="py-6 text-center">
            <p className="text-sm text-rose-600 font-medium">{error}</p>
            <button
              onClick={close}
              className="mt-4 px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-full cursor-pointer hover:bg-slate-200"
            >
              Back to Store
            </button>
          </div>
        )}
        {done && (
          <div className="py-10 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="font-bold text-lg text-[#0798AE]">Thank you, parent!</p>
            <p className="text-sm text-slate-500 mb-4">Your feedback helps us bring bigger smiles.</p>
            <button
              type="button"
              onClick={close}
              className="mt-2 px-6 py-3 bg-[#0798AE] text-white text-sm font-bold rounded-full cursor-pointer hover:bg-[#068093]"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {!loading && !error && !done && invite && (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Reviewing Order <strong className="text-slate-700">{invite.order_number}</strong>
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
              <input
                required
                placeholder="E.g., Sarah's Mom"
                value={form.parent_name}
                onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0798AE]/20 focus:border-[#0798AE]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                placeholder="E.g., Lahore"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0798AE]/20 focus:border-[#0798AE]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 w-fit">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${n <= form.rating ? 'fill-[#FFD52F] text-[#FFD52F]' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Story</label>
              <textarea
                required
                rows={4}
                minLength={10}
                placeholder="Tell other parents what you loved..."
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0798AE]/20 focus:border-[#0798AE]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Bought (Optional)</label>
              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0798AE]/20 focus:border-[#0798AE] bg-white"
              >
                <option value="">-- Select a product --</option>
                {invite.products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Photo (Optional)</label>
              <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[#D9F1F5] rounded-xl text-sm font-bold text-[#0798AE] cursor-pointer hover:bg-[#F2FBFC] transition-colors">
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                {form.photo_url ? 'Change Photo' : 'Upload a photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPhoto(e.target.files?.[0] || null)}
                />
              </label>
              {form.photo_url && (
                <div className="mt-3 relative rounded-xl overflow-hidden shadow-sm border border-slate-200 h-48">
                  <img src={form.photo_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#0798AE] text-white text-base font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 hover:bg-[#068093] transition-colors shadow-md disabled:opacity-70"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
