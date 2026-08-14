import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';

export const WishlistDrawer: React.FC = () => {
  const { 
    products,
    wishlist, 
    wishlistOpen, 
    setWishlistOpen, 
    toggleWishlist, 
    addToCart 
  } = useShopStore();

  if (!wishlistOpen) return null;

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#F1F5F9] flex items-center justify-between bg-[#FFFDF7]">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-[#D9F1F5] text-[#0798AE]">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#263238] text-base">Your Wishlist Saved Items</h3>
                <span className="text-xs text-[#607D80] font-medium">{wishlistedProducts.length} saved</span>
              </div>
            </div>

            <button
              onClick={() => setWishlistOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {wishlistedProducts.length > 0 ? (
              wishlistedProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 bg-[#FFFDF7] rounded-2xl border border-[#F1F5F9] flex gap-3 items-center justify-between"
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-[#E2E8F0] shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#263238] truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs font-black text-[#0798AE] mt-0.5">
                        Rs. {product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => addToCart(product)}
                      className="p-2 rounded-full bg-[#0798AE] text-white hover:bg-[#BE185D] cursor-pointer shadow-xs"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2 rounded-full hover:bg-[#FEE2E2] text-slate-400 hover:text-[#EF4444] cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center space-y-3">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Your wishlist is currently empty.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
