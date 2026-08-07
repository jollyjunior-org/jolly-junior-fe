import React, { useState } from 'react';
import { X, Mail, KeyRound, Loader2 } from 'lucide-react';
import { useShopStore } from '@/store/useShopStore';
import { requestLoginOtp } from '@/services/customer-service';

/**
 * Passwordless login: email → OTP code → JWT.
 */
export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, loginCustomerWithOtp, showToast } = useShopStore();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  if (!authModalOpen) return null;

  /** Send OTP to the entered email. */
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDevCode(null);
    try {
      const res = await requestLoginOtp(email.trim());
      if (res.dev_code) setDevCode(res.dev_code);
      showToast(res.message || 'Code sent');
      setStep('code');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Could not send code');
    } finally {
      setLoading(false);
    }
  };

  /** Verify OTP and sign in. */
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await loginCustomerWithOtp(email.trim(), code.trim());
    setLoading(false);
    if (!result.success) {
      showToast(result.message || 'Invalid code');
    } else {
      setStep('email');
      setCode('');
      setDevCode(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative">
        <button
          type="button"
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-black text-[#0798AE] mb-1">Sign in</h2>
        <p className="text-xs text-slate-500 mb-4">
          No password — we email you a 6-digit code.
        </p>

        {step === 'email' ? (
          <form onSubmit={handleRequest} className="space-y-3">
            <label className="block text-xs font-bold text-slate-600">
              Email
              <div className="relative mt-1">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0798AE] text-white text-sm font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send code
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-3">
            <p className="text-[11px] text-slate-500">
              Code sent to <strong>{email}</strong>
            </p>
            {devCode && (
              <p className="text-[11px] bg-amber-50 text-amber-800 px-2 py-1.5 rounded-lg">
                Dev mode (SMTP not set): use code <strong>{devCode}</strong>
              </p>
            )}
            <label className="block text-xs font-bold text-slate-600">
              6-digit code
              <div className="relative mt-1">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm tracking-widest font-mono"
                />
              </div>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0798AE] text-white text-sm font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify &amp; sign in
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-xs text-slate-500 hover:underline cursor-pointer"
            >
              Change email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
