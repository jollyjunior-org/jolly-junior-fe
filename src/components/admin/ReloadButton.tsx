'use client';

import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';

interface ReloadButtonProps {
  onReload: () => Promise<void> | void;
  label?: string;
  className?: string;
}

export const ReloadButton: React.FC<ReloadButtonProps> = ({
  onReload,
  label = 'Reload',
  className = '',
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onReload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      title={`Refresh ${label} list`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-2xs transition-all disabled:opacity-60 active:scale-95 ${className}`}
    >
      <RotateCw className={`w-3.5 h-3.5 text-[#0798AE] ${loading ? 'animate-spin' : ''}`} />
      <span>{loading ? 'Refreshing...' : label}</span>
    </button>
  );
};

export default ReloadButton;
