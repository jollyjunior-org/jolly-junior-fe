import React, { useEffect, useState } from 'react';
import { X, Star, Upload, Loader2, CheckCircle } from 'lucide-react';
import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';
import { uploadStoreImage } from '@/services/store-upload-service';
import { useShopStore } from '@/store/useShopStore';

/**
 * Post-delivery feedback window — opened from email link (?view=feedback&token=...).
 * Lets parent leave a rating, comment, and one photo (Cloudinary testimonials folder).
 */
export const FeedbackModal: React.FC = () => {
  const { showToast } = useShopStore();
  const [token, setToken] = useState('');
  const [open, setOpen] = useState(false);

  // Read query only on client after mount (avoids SSR/client HTML mismatch)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token') || '';
    setToken(t);
    setOpen(params.get('view') === 'feedback' && Boolean(t));
  }, []);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<{
    order_number: string;
    customer_name: string;
    city?: string;
    suggested_product?: string;
  } | null>(null);

  const [form, setForm] = useState({
    parent_name: '',
    city: '',
    rating: 5,
    comment: '',
    product_bought: '',
    photo_url: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{
          order_number: string;
          customer_name: string;
          city?: string;
          suggested_product?: string;
        }>(publicEndpoints.testimonialInvite(token), { skipAuth: true });
        if (cancelled) return;
        setInvite(data);
        setForm((f) => ({
          ...f,
          parent_name: data.customer_name || '',
          city: data.city || '',
          product_bought: data.suggested_product || '',
        }));
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Invalid link');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, token]);

  if (!open) return null;

  const close = () => {
    window.history.replaceState(null, '', window.location.pathname);
    window.location.reload();
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
          product_bought: form.product_bought || null,
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
    <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-black text-[#0798AE] mb-1">Share your happy moment</h2>
        <p className="text-xs text-slate-500 mb-4">
          One short note + one photo after delivery — it may appear on our homepage.
        </p>

        {loading && (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#FFD52F]" />
          </div>
        )}
        {error && <p className="text-sm text-rose-600 font-medium py-6">{error}</p>}
        {done && (
          <div className="py-10 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-[#0798AE]">Thank you, parent!</p>
            <button
              type="button"
              onClick={close}
              className="mt-2 px-4 py-2 bg-[#0798AE] text-white text-xs font-bold rounded-full cursor-pointer"
            >
              Back to shop
            </button>
          </div>
        )}

        {!loading && !error && !done && invite && (
          <form onSubmit={submit} className="space-y-3">
            <p className="text-[11px] text-slate-500">
              Order <strong>{invite.order_number}</strong>
            </p>
            <input
              required
              placeholder="Your name"
              value={form.parent_name}
              onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  className="cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${n <= form.rating ? 'fill-[#FFD52F] text-[#FFD52F]' : 'text-slate-300'}`}
                  />
                </button>
              ))}
            </div>
            <textarea
              required
              rows={4}
              minLength={10}
              placeholder="Tell other parents what you loved..."
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
            <input
              placeholder="Product you bought (optional)"
              value={form.product_bought}
              onChange={(e) => setForm({ ...form, product_bought: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {form.photo_url ? 'Photo ready — change?' : 'Upload one photo (optional)'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPhoto(e.target.files?.[0] || null)}
              />
            </label>
            {form.photo_url && (
              <img src={form.photo_url} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#0798AE] text-white text-sm font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
