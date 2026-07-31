import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ShoppingBag, Eye, ArrowRight, MessageSquare } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { isComingSoonProduct } from '../../utils/product';

export const QuickViewModal: React.FC = () => {
  const { 
    quickViewProduct, 
    setQuickViewProduct, 
    setSelectedProductDetail,
    addToCart 
  } = useShopStore();

  const product = quickViewProduct;
  if (!product) return null;

  const stockQty = product.stockQuantity ?? (product.inStock ? 10 : 0);
  const comingSoon = isComingSoonProduct(product);
  const isAvailable = !comingSoon && product.inStock && stockQty > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-[#F1F5F9] max-w-2xl w-full p-6 sm:p-8 overflow-hidden"
        >
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#FFFDF8] border border-[#F1F5F9]">
              <img
                src={product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-[#EC4899] bg-[#FCE7F3] px-2.5 py-0.5 rounded-full uppercase">
                {product.categoryName} • Age {product.ageGroup}
              </span>

              <h2 className="text-base font-black text-[#1E293B] leading-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-1 text-[#F59E0B]">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold text-[#1E293B]">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviewCount})</span>
              </div>

              <div className="text-xl font-black text-[#1E293B]">
                Rs. {product.price.toLocaleString()}
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {product.description}
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    if (isAvailable) {
                      addToCart(product);
                      setQuickViewProduct(null);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`w-full py-2.5 rounded-full font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition-all ${
                    isAvailable
                      ? 'bg-gradient-to-r from-[#F472B6] to-[#FB923C] text-white cursor-pointer hover:opacity-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{comingSoon ? 'Coming Soon' : isAvailable ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedProductDetail(product);
                    setQuickViewProduct(null);
                  }}
                  className="w-full py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Full Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
