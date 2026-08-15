import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';
import { useShopStore } from '@/store/useShopStore';

interface TrackedOrder {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  customer_name: string;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  items: {
    id: string;
    product_name: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    image_url: string | null;
  }[];
}

interface OrderTrackingProps {
  orderNumber: string;
}

export function OrderTracking({ orderNumber }: OrderTrackingProps) {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentView } = useShopStore();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch<TrackedOrder>(publicEndpoints.trackOrder(orderNumber));
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    if (orderNumber) fetchOrder();
  }, [orderNumber]);

  const goHome = () => {
    window.history.pushState(null, '', '/');
    setCurrentView('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0798AE]"></div>
        <p className="mt-4 text-[#607D80] font-medium">Tracking your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center border border-[#E2E8F0]">
          <AlertCircle className="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#263238] mb-2">Order Not Found</h2>
          <p className="text-[#607D80] mb-6">We couldn't find an order with number "{orderNumber}". It may have been typed incorrectly or no longer exists.</p>
          <button 
            onClick={goHome}
            className="w-full bg-[#0798AE] text-white py-3 rounded-xl font-bold hover:bg-[#068094] transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Determine active step based on status
  const statuses = ["Pending", "Confirmed", "Packing", "Shipped", "Delivered"];
  const isCancelled = order.status === "Cancelled";
  
  let currentStepIndex = statuses.indexOf(order.status);
  if (currentStepIndex === -1) currentStepIndex = statuses.indexOf("Pending"); // fallback

  const formatMoney = (val: number) => `Rs. ${Number(val).toLocaleString()}`;
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 pt-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header Back Button */}
        <button 
          onClick={goHome}
          className="flex items-center text-[#607D80] hover:text-[#0798AE] font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Store
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          {/* Order Header */}
          <div className="bg-[#FFFDF7] p-6 sm:p-8 border-b border-[#F1F5F9] text-center">
            <h1 className="text-2xl font-black text-[#263238] tracking-tight mb-2">Track Your Order</h1>
            <div className="inline-flex items-center justify-center px-4 py-2 bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
              <span className="text-[#607D80] font-medium mr-2">Order</span>
              <span className="text-[#263238] font-bold">#{order.order_number}</span>
            </div>
            <p className="mt-3 text-sm text-[#607D80]">Placed on {formatDate(order.created_at)}</p>
          </div>

          {/* Tracking Pipeline */}
          <div className="p-6 sm:p-8 border-b border-[#F1F5F9]">
            <h3 className="text-[13px] font-black text-[#94A3B8] tracking-wider uppercase mb-8 text-center">Order Status</h3>
            
            {isCancelled ? (
              <div className="flex flex-col items-center justify-center py-6">
                <AlertCircle className="w-16 h-16 text-[#EF4444] mb-3" />
                <h4 className="text-lg font-bold text-[#263238]">Order Cancelled</h4>
                <p className="text-[#607D80] text-sm mt-1">This order has been cancelled.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute top-[22px] left-[10%] right-[10%] h-1 bg-[#F1F5F9] -z-10 rounded-full hidden sm:block">
                  <div 
                    className="h-full bg-[#0798AE] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(Math.min(currentStepIndex, statuses.length - 1) / (statuses.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-6 sm:gap-0">
                  {statuses.map((status, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isActive = idx === currentStepIndex;
                    
                    let Icon = Clock;
                    if (status === 'Confirmed') Icon = CheckCircle;
                    if (status === 'Packing') Icon = Package;
                    if (status === 'Shipped') Icon = Truck;
                    if (status === 'Delivered') Icon = MapPin;

                    return (
                      <div key={status} className="flex sm:flex-col items-center sm:w-1/5 relative">
                        {/* Mobile connection line */}
                        {idx !== statuses.length - 1 && (
                          <div className={`absolute left-[22px] top-[45px] bottom-[-24px] w-0.5 sm:hidden -z-10 ${isCompleted ? 'bg-[#0798AE]' : 'bg-[#F1F5F9]'}`} />
                        )}
                        
                        <div className={`
                          w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-4 transition-colors duration-300
                          ${isCompleted ? 'bg-[#0798AE] border-white text-white shadow-md' : 'bg-white border-[#F1F5F9] text-[#94A3B8]'}
                          ${isActive ? 'ring-4 ring-[#0798AE]/20' : ''}
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="ml-4 sm:ml-0 sm:mt-3 sm:text-center">
                          <div className={`font-bold text-sm ${isCompleted ? 'text-[#263238]' : 'text-[#94A3B8]'}`}>{status}</div>
                          {isActive && <div className="text-[11px] font-medium text-[#0798AE] mt-0.5 sm:mx-auto">Current</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="grid sm:grid-cols-2 gap-px bg-[#F1F5F9]">
            
            {/* Customer & Delivery */}
            <div className="bg-white p-6 sm:p-8">
              <h3 className="text-[13px] font-black text-[#94A3B8] tracking-wider uppercase mb-5">Delivery Details</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center shrink-0 mr-3">
                    <span className="font-bold text-[#0798AE] text-sm">{order.customer_name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#263238]">{order.customer_name}</div>
                    <div className="text-[13px] text-[#607D80] font-medium mt-0.5">Customer</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center shrink-0 mr-3">
                    <MapPin className="w-4 h-4 text-[#0798AE]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#263238]">Shipping Address</div>
                    <div className="text-[13px] text-[#607D80] leading-relaxed mt-1">
                      {order.shipping_address}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 sm:p-8">
              <h3 className="text-[13px] font-black text-[#94A3B8] tracking-wider uppercase mb-5">What You Ordered</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F1F5F9] shrink-0 border border-[#E2E8F0]">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-[#94A3B8]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="font-bold text-[#263238] text-sm truncate">{item.product_name}</div>
                      {item.variant_name && <div className="text-[12px] text-[#607D80] mt-0.5 truncate">{item.variant_name}</div>}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[12px] font-medium text-[#94A3B8]">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-[#0798AE]">{formatMoney(item.total_price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white p-6 sm:p-8 border-t border-[#F1F5F9]">
            <h3 className="text-[13px] font-black text-[#94A3B8] tracking-wider uppercase mb-5">Payment Summary</h3>
            <div className="max-w-sm ml-auto space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#607D80] font-medium">Subtotal</span>
                <span className="text-[#263238] font-bold">{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#607D80] font-medium">Delivery Fee</span>
                <span className="text-[#263238] font-bold">{formatMoney(order.shipping_fee)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#BE185D] font-medium">Discount</span>
                  <span className="text-[#BE185D] font-bold">-{formatMoney(order.discount_amount)}</span>
                </div>
              )}
              <div className="pt-3 mt-1 border-t border-[#E2E8F0] flex justify-between items-center">
                <span className="text-[#263238] font-black">TOTAL</span>
                <span className="text-xl font-black text-[#0798AE]">{formatMoney(order.total_amount)}</span>
              </div>
              
              <div className="pt-4 flex items-center justify-between bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] mt-4">
                <div className="text-[12px] font-bold text-[#607D80] uppercase">Payment Method</div>
                <div className="text-sm font-bold text-[#263238]">{order.payment_method}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-[#94A3B8] text-sm">
          Need help? <a href="#" className="font-bold text-[#0798AE] hover:underline">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
