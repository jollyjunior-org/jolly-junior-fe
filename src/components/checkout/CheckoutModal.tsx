import { 
  X, Check, ShieldCheck, Truck, 
  MapPin, User, Mail, Phone, ShoppingBag
} from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/services/order-service';

export const CheckoutModal: React.FC = () => {
  const router = useRouter();
  const { 
    cart, 
    getCartTotal, 
    getFreeShippingProgress,
    getDeliveryFee,
    getPromoDiscountAmount,
    appliedPromo,
    clearCart, 
    setCurrentView,
    setLastOrderNumber,
    lastOrderNumber,
    currentView,
    isCustomerAuthenticated,
    customerToken,
    buyNowItem,
    setBuyNowItem,
    shippingConfig,
    showToast,
  } = useShopStore();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Lahore',
    paymentMethod: 'COD' as const,
    notes: '',
    userId: null as string | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  // Prefill from saved profile when logged in
  useEffect(() => {
    if (currentView !== 'checkout' || !isCustomerAuthenticated) return;
    (async () => {
      try {
        const p = await apiFetch<{
          id: string;
          name: string;
          email: string;
          phone?: string;
          address?: string;
          city?: string;
        }>(publicEndpoints.meProfile(), { authMode: 'customer' });
        setFormData((f) => ({
          ...f,
          fullName: p.name || f.fullName,
          email: p.email || f.email,
          phone: p.phone || f.phone,
          address: p.address || f.address,
          city: p.city || f.city,
          userId: p.id,
          paymentMethod: 'COD',
        }));
      } catch {
        /* ignore */
      }
    })();
  }, [currentView, isCustomerAuthenticated, customerToken]);

  if (currentView !== 'checkout' && currentView !== 'order-success') return null;

  const checkoutItems = buyNowItem ? [buyNowItem] : cart;
  const isBuyNow = !!buyNowItem;

  const subtotal = isBuyNow 
    ? (buyNowItem.variant?.price ?? buyNowItem.product.price) * buyNowItem.quantity
    : getCartTotal();

  const deliveryFee = isBuyNow
    ? (subtotal >= shippingConfig.freeDeliveryThreshold ? 0 : shippingConfig.deliveryFee)
    : getDeliveryFee();

  const progress = isBuyNow
    ? {
        threshold: shippingConfig.freeDeliveryThreshold,
        remaining: Math.max(0, shippingConfig.freeDeliveryThreshold - subtotal),
        isFree: subtotal >= shippingConfig.freeDeliveryThreshold,
        percent: Math.min(100, (subtotal / shippingConfig.freeDeliveryThreshold) * 100),
      }
    : getFreeShippingProgress();

  const discountAmount = isBuyNow ? 0 : getPromoDiscountAmount();
  const finalTotal = Math.max(0, subtotal - discountAmount) + deliveryFee;

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || isSubmitting) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const payload = {
        customer_name: formData.fullName,
        customer_email: formData.email || 'customer@example.com',
        customer_phone: formData.phone,
        shipping_address: formData.address,
        city: formData.city,
        payment_method: formData.paymentMethod || 'COD',
        subtotal: subtotal,
        shipping_fee: deliveryFee,
        discount_amount: discountAmount,
        total_amount: finalTotal,
        user_id: formData.userId || undefined,
        items: checkoutItems.map((c) => ({
          product_id: c.product.id,
          variant_id: c.variant?.id || undefined,
          product_name: c.product.name,
          variant_name: c.variant?.name || undefined,
          price: c.variant ? c.variant.price : c.product.price,
          quantity: c.quantity,
        })),
      };

      const createdOrder = await createOrder(payload);
      const orderNum = createdOrder.orderNumber || createdOrder.id;

      setLastOrderNumber(orderNum);

      if (isBuyNow) {
        setBuyNowItem(null);
      } else {
        clearCart();
      }

      triggerConfetti();
      showToast(`Order placed successfully! Order #${orderNum}`);
      setCurrentView('home');
      router.push('/');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl shadow-2xl border border-[#F1F5F9] max-w-2xl w-full p-6 sm:p-8 overflow-hidden max-h-[92vh] overflow-y-auto"
      >
        <button
          onClick={() => {
            if (isBuyNow) setBuyNowItem(null);
            
            if (window.location.pathname === '/' || window.location.pathname === '') {
              // If on main site, return to whatever view (home/shop) they were looking at
              setCurrentView(window.location.search.includes('view=shop') || window.location.search.includes('category=') ? 'shop' : 'home');
            } else {
              // If on a dedicated product page, just close the modal
              setCurrentView('shop');
            }
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {currentView === 'checkout' ? (
          <div className="space-y-6">
            <div className="border-b border-[#F1F5F9] pb-4">
              <span className="text-xs font-bold text-[#0798AE] bg-[#D9F1F5] px-3 py-1 rounded-full">
                🔒 Secure 256-Bit Encrypted Checkout
              </span>
              <h2 className="text-xl font-black text-[#263238] mt-2">
                Delivery Details & Payment
              </h2>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {/* Contact & Shipping Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-[#607D80] uppercase tracking-wider">
                  1. Shipping Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#263238] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Khan"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E2E8F0] rounded-xl text-xs font-semibold outline-none focus:border-[#0798AE]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#263238] mb-1">Phone Number (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E2E8F0] rounded-xl text-xs font-semibold outline-none focus:border-[#0798AE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263238] mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="House / Apartment #, Street Name, Area"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E2E8F0] rounded-xl text-xs font-semibold outline-none focus:border-[#0798AE]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#263238] mb-1">City</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-2.5 bg-[#FFFDF7] border border-[#E2E8F0] rounded-xl text-xs font-semibold outline-none"
                    >
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Multan">Multan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#263238] mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="parent@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E2E8F0] rounded-xl text-xs font-semibold outline-none focus:border-[#0798AE]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method — COD only */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-extrabold text-[#607D80] uppercase tracking-wider">
                  2. Payment Method
                </h3>
                <div className="p-3 rounded-2xl border border-[#0798AE] bg-[#D9F1F5] shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#263238]">Cash on Delivery</span>
                    <Check className="w-4 h-4 text-[#0798AE]" />
                  </div>
                  <p className="text-[10px] text-[#607D80] mt-1">Pay when delivered to your doorstep</p>
                </div>
              </div>

              {/* Summary Box */}
              <div className="p-4 bg-[#FFFDF7] rounded-2xl border border-[#F1F5F9] space-y-1.5 text-xs text-[#607D80]">
                <div className="flex justify-between font-medium">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-[#263238]">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between font-bold text-[#059669]">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span>-Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Shipping Fee</span>
                  <span className={progress.isFree ? 'text-[#059669] font-bold' : ''}>
                    {progress.isFree ? 'FREE' : `Rs. ${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                {!progress.isFree && progress.remaining > 0 && (
                  <p className="text-[10px] text-[#0798AE]">
                    Free delivery over Rs. {progress.threshold.toLocaleString()}
                  </p>
                )}
                <div className="flex justify-between text-base font-black text-[#263238] pt-2 border-t border-[#E2E8F0]">
                  <span>Total Amount Payable</span>
                  <span className="text-[#0798AE]">Rs. {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#F472B6] to-[#FB923C] text-white font-extrabold text-sm shadow-md hover:opacity-95 cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Confirm & Place Order (Rs. {finalTotal.toLocaleString()})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="py-8 text-center space-y-5">
            <div className="w-20 h-20 bg-[#D1FAE5] text-[#059669] rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div>
              <span className="text-xs font-black text-[#059669] bg-[#D1FAE5] px-3 py-1 rounded-full">
                ORDER CONFIRMED 🎉
              </span>
              <h2 className="text-2xl font-black text-[#263238] mt-2">
                Thank You for Shopping with JollyJuniors!
              </h2>
              <p className="text-xs text-[#607D80] font-medium mt-1">
                Your order <strong className="text-[#263238]">{lastOrderNumber}</strong> has been received and is being prepared with love.
              </p>
            </div>

            <div className="p-4 bg-[#FFFDF7] rounded-2xl border border-[#F1F5F9] max-w-md mx-auto text-left space-y-2 text-xs text-slate-600">
              <p>🚚 <strong>Estimated Delivery:</strong> 1-2 Business Days</p>
              <p>📱 <strong>SMS Confirmation:</strong> Sent to {formData.phone || '0300 1234567'}</p>
              <p>📦 <strong>Package Care:</strong> Hand-sanitized & padded childproof packaging</p>
            </div>

            <button
              onClick={() => setCurrentView('home')}
              className="px-8 py-3 bg-[#263238] hover:bg-slate-800 text-white text-xs font-black rounded-full shadow-md cursor-pointer transition-all"
            >
              Continue Browsing Jolly Store
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
