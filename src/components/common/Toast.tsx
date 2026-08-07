import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';

export const Toast: React.FC = () => {
  const { toastMessage } = useShopStore();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50 bg-[#1E293B] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 max-w-sm"
        >
          <div className="p-1.5 rounded-full bg-[#3D6B4F] text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold leading-tight">{toastMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
