import React, { useState, useEffect } from 'react';
import { Save, Loader2, Cloud, AlertCircle, CheckCircle2, Share2, Plus, Trash2, PhoneCall } from 'lucide-react';
import { useShopStore } from '@/store/useShopStore';
import { fetchSettings, saveSettings } from '@/services/settings-service';

export const AdminSettings: React.FC = () => {
  const authToken = useShopStore((state) => state.authToken);
  const fetchStorefrontConfig = useShopStore((state) => state.fetchStorefrontConfig);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [hasCloudinarySecret, setHasCloudinarySecret] = useState(false);
  const [hasSmtpPassword, setHasSmtpPassword] = useState(false);
  const [hasWhatsappToken, setHasWhatsappToken] = useState(false);

  const [formData, setFormData] = useState({
    cloudinary_cloud_name: '',
    cloudinary_api_key: '',
    cloudinary_api_secret: '',
    whatsapp_access_token: '',
    whatsapp_phone_number_id: '',
    whatsapp_number: '923001234567',
    whatsapp_template_otp: '',
    whatsapp_template_order_placed: '',
    whatsapp_template_order_delivered: '',
    whatsapp_template_order_cancelled: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: '',
  });

  /** Load settings from admin API. */
  const loadSettings = async () => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      const data = await fetchSettings();

      setHasCloudinarySecret(!!data.has_cloudinary_api_secret);
      setHasSmtpPassword(!!data.has_smtp_password);
      setHasWhatsappToken(!!data.has_whatsapp_access_token);

      setFormData({
        cloudinary_cloud_name: data.cloudinary_cloud_name || '',
        cloudinary_api_key: data.cloudinary_api_key || '',
        cloudinary_api_secret: '',
        whatsapp_access_token: '',
        whatsapp_phone_number_id: data.whatsapp_phone_number_id || '',
        whatsapp_number: data.whatsapp_number || '923001234567',
        whatsapp_template_otp: data.whatsapp_template_otp || '',
        whatsapp_template_order_placed: data.whatsapp_template_order_placed || '',
        whatsapp_template_order_delivered: data.whatsapp_template_order_delivered || '',
        whatsapp_template_order_cancelled: data.whatsapp_template_order_cancelled || '',
        smtp_host: data.smtp_host || '',
        smtp_port: data.smtp_port || 587,
        smtp_username: data.smtp_username || '',
        smtp_password: '',
        smtp_from_email: data.smtp_from_email || '',
        smtp_from_name: data.smtp_from_name || '',
      });
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);



  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await saveSettings(formData);

      await fetchStorefrontConfig();
      setMessage({ type: 'success', text: 'System settings updated successfully!' });
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : 'Error saving settings';
      setMessage({ type: 'error', text });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">System & Social Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure WhatsApp support, social media links, third-party integrations, and store communication.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          )}
          <div className="text-sm font-medium">{message.text}</div>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm space-y-6"
      >
        {/* Storefront Support WhatsApp Number */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <PhoneCall className="w-5 h-5 text-[#0798AE]" />
            <h3 className="text-sm font-bold text-slate-800">Storefront Support Contact (WhatsApp)</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Set the official WhatsApp number for customer support. Updating this updates all WhatsApp contact options across the storefront (Header support link, floating button, footer, and mobile drawer).
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Support Number</label>
            <input
              type="text"
              placeholder="e.g. 923001234567"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-[#0798AE]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Format: Include country code without + sign (e.g. 923001234567).
            </p>
          </div>
        </div>


        {/* Cloudinary Integration */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Cloud className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-800">Cloudinary Integration</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Required for product and category image uploads. Get these credentials from your
            Cloudinary Dashboard.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cloud Name</label>
              <input
                type="text"
                placeholder="e.g. dxyz123"
                value={formData.cloudinary_cloud_name}
                onChange={(e) =>
                  setFormData({ ...formData, cloudinary_cloud_name: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">API Key</label>
              <input
                type="text"
                placeholder="e.g. 123456789012345"
                value={formData.cloudinary_api_key}
                onChange={(e) =>
                  setFormData({ ...formData, cloudinary_api_key: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                API Secret {hasCloudinarySecret && <span className="text-green-500 font-normal">(Configured)</span>}
              </label>
              <input
                type="password"
                placeholder={hasCloudinarySecret ? "Enter new secret to replace..." : "••••••••••••••••••••••••"}
                value={formData.cloudinary_api_secret}
                onChange={(e) =>
                  setFormData({ ...formData, cloudinary_api_secret: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Meta API Integration */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Cloud className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-bold text-slate-800">WhatsApp Meta Cloud API Integration</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Required for automated OTP sending and order status notifications via Meta WhatsApp API.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Access Token {hasWhatsappToken && <span className="text-green-500 font-normal">(Configured)</span>}
              </label>
              <input
                type="password"
                placeholder={hasWhatsappToken ? "Enter new token to replace..." : "e.g. EAAB..."}
                value={formData.whatsapp_access_token}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp_access_token: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number ID</label>
              <input
                type="text"
                placeholder="e.g. 105938..."
                value={formData.whatsapp_phone_number_id}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp_phone_number_id: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-green-500"
              />
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-3">WhatsApp Message Templates</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">OTP Login Template</label>
                  <input
                    type="text"
                    placeholder="e.g. otp_login_v1"
                    value={formData.whatsapp_template_otp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp_template_otp: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Order Placed Template</label>
                  <input
                    type="text"
                    placeholder="e.g. order_placed_v1"
                    value={formData.whatsapp_template_order_placed}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp_template_order_placed: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Order Delivered Template</label>
                  <input
                    type="text"
                    placeholder="e.g. order_delivered_v1"
                    value={formData.whatsapp_template_order_delivered}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp_template_order_delivered: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Order Cancelled Template</label>
                  <input
                    type="text"
                    placeholder="e.g. order_cancelled_v1"
                    value={formData.whatsapp_template_order_cancelled}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp_template_order_cancelled: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SMTP Email Integration */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Cloud className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-800">SMTP Email Integration</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Required for sending emails. Configure your SMTP provider (e.g. SendGrid, Amazon SES, or Gmail).
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  placeholder="e.g. smtp.gmail.com"
                  value={formData.smtp_host}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp_host: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Port</label>
                <input
                  type="number"
                  placeholder="e.g. 587"
                  value={formData.smtp_port}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp_port: parseInt(e.target.value) || 587 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Username</label>
                <input
                  type="text"
                  placeholder="Username / Email"
                  value={formData.smtp_username}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp_username: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SMTP Password {hasSmtpPassword && <span className="text-green-500 font-normal">(Configured)</span>}
                </label>
                <input
                  type="password"
                  placeholder={hasSmtpPassword ? "Enter new password to replace..." : "••••••••••••••••••••••••"}
                  value={formData.smtp_password}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp_password: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">From Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. no-reply@jollyjuniors.local"
                  value={formData.smtp_from_email}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp_from_email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">From Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jolly Juniors"
                  value={formData.smtp_from_name}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp_from_name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-70 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

