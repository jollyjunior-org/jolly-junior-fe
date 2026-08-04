import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, ArrowRight, MessageSquare, Tag, Check, Sparkles } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { goToShop } from '@/utils/navigate-shop';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const { 
    cart, 
    cartOpen, 
    setCartOpen, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    getFreeShippingProgress,
    getDeliveryFee,
    getPromoDiscountAmount,
    appliedPromo,
    applyPromoCode,
    clearPromoCode,
    setCurrentView,
    showToast
  } = useShopStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  if (!cartOpen) return null;

  const progress = getFreeShippingProgress();
  const subtotal = getCartTotal();
  const discountAmount = getPromoDiscountAmount();
  const deliveryFee = getDeliveryFee();
  const finalTotal = Math.max(0, subtotal - discountAmount) + deliveryFee;

  /** Verify promo with backend API. */
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const result = await applyPromoCode(promoInput.trim());
      showToast(result.message);
      if (result.success) setPromoInput('');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const itemsList = cart.map((item, idx) => 
      `${idx + 1}. *${item.product.name}* ${item.variant ? `(${item.variant.name})` : ''} x${item.quantity} - Rs. ${((item.variant ? item.variant.price : item.product.price) * item.quantity).toLocaleString()}`
    ).join('\n');

    const message = encodeURIComponent(
      `Hi JollyJuniors! 👋 I want to place an order:\n\n${itemsList}\n\n*Subtotal:* Rs. ${subtotal.toLocaleString()}\n${discountAmount > 0 ? `*Discount (${appliedPromo?.code}):* -Rs. ${discountAmount.toLocaleString()}\n` : ''}*Delivery Fee:* ${progress.isFree ? 'FREE' : `Rs. ${deliveryFee}`}\n*Total Payable:* Rs. ${finalTotal.toLocaleString()}\n\nPlease confirm availability and delivery timeframe!`
    );

    window.open(`https://wa.me/923001234567?text=${message}`, '_blank');
  };

  const handleProceedCheckout = () => {
    setCartOpen(false);
    setCurrentView('checkout');
  };

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
          <div className="p-4 sm:p-5 border-b border-[#F1F5F9] flex items-center justify-between bg-[#FFFDF8]">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-[#FCE7F3] text-[#EC4899]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#1E293B] text-base">Your Shopping Cart</h3>
                <span className="text-xs text-[#64748B] font-medium">{cart.length} items</span>
              </div>
            </div>

            <button
              onClick={() => setCartOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#FEF3C7] p-3.5 border-b border-[#FDE68A]">
            <div className="text-xs font-bold text-[#D97706] flex items-center justify-between mb-1.5">
              <span>
                {progress.isFree ? '🎉 Congratulations! You unlocked Free Express Shipping!' : `Add Rs. ${progress.remaining.toLocaleString()} more for FREE Delivery`}
              </span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="w-full h-2 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FB923C] to-[#10B981] transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length > 0 ? (
              cart.map((item, idx) => {
                const itemPrice = item.variant ? item.variant.price : item.product.price;
                return (
                  <div
                    key={`${item.product.id}-${item.variant?.id || 'std'}-${idx}`}
                    className="p-3 bg-[#FFFDF8] rounded-2xl border border-[#F1F5F9] flex gap-3 items-center"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-[#E2E8F0] shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#1E293B] truncate">
                        {item.product.name}
                      </h4>
                      {item.variant && (
                        <p className="text-[10px] text-[#EC4899] font-medium">
                          Variant: {item.variant.name}
                        </p>
                      )}
                      <p className="text-xs font-black text-[#1E293B] mt-0.5">
                        Rs. {itemPrice.toLocaleString()}
                      </p>

                      {/* Quantity buttons */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-[#E2E8F0] rounded-full bg-white px-2 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.variant?.id, -1)}
                            className="text-xs font-extrabold text-slate-500 hover:text-slate-900 px-1.5 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-black px-2">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.variant?.id, 1)}
                            className="text-xs font-extrabold text-slate-500 hover:text-slate-900 px-1.5 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id, item.variant?.id)}
                          className="text-[11px] text-[#EF4444] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Your shopping cart is currently empty.</p>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    goToShop(router, {
                      categoryId: null,
                      categoryIds: [],
                      saleKey: null,
                      searchQuery: '',
                    });
                  }}
                  className="px-5 py-2 bg-[#EC4899] text-white text-xs font-bold rounded-full cursor-pointer shadow-xs"
                >
                  Start Shopping Toys & Essentials
                </button>
              </div>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#F1F5F9] bg-[#FFFDF8] space-y-3">
              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold uppercase outline-none focus:border-[#EC4899]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={promoLoading}
                  className="px-4 py-2 bg-[#1E293B] text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer disabled:opacity-60"
                >
                  {promoLoading ? '…' : 'Apply'}
                </button>
              </form>
              {appliedPromo && (
                <div className="flex items-center justify-between text-[11px] font-bold text-[#059669] bg-emerald-50 px-3 py-1.5 rounded-lg">
                  <span>{appliedPromo.code} applied</span>
                  <button
                    type="button"
                    onClick={() => clearPromoCode()}
                    className="text-slate-500 hover:text-rose-500 cursor-pointer underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Subtotal Calculation */}
              <div className="space-y-1 text-xs text-[#64748B] pt-1">
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#1E293B]">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#059669] font-bold">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span>-Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Delivery Fee</span>
                  <span className={progress.isFree ? 'text-[#059669] font-bold' : ''}>
                    {progress.isFree ? 'FREE' : `Rs. ${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                {!progress.isFree && progress.remaining > 0 && (
                  <p className="text-[10px] text-[#8C8C70]">
                    Add Rs. {progress.remaining.toLocaleString()} more for free delivery
                  </p>
                )}
                <div className="flex justify-between text-base font-black text-[#1E293B] pt-2 border-t border-[#E2E8F0]">
                  <span>Total</span>
                  <span>Rs. {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleProceedCheckout}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#F472B6] to-[#FB923C] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-2.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-[#BBF7D0]"
                >
                  <MessageSquare className="w-4 h-4 fill-[#22C55E]" />
                  <span>Order via WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
