import React, { useState } from 'react';
import { 
  ShoppingBag, Search, Filter, Eye, Phone, MapPin, 
  CreditCard, CheckCircle2, Clock, Truck, Package, XCircle, X, Boxes, FileText
} from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { Order } from '../../types';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, showToast } = useShopStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  const statusOptions: Order['status'][] = ['Pending', 'Confirmed', 'Packing', 'Packed', 'Ready For Dispatch', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Returned', 'Refunded'];

  const statusColors: Record<Order['status'], { bg: string; text: string; border: string }> = {
    Pending: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    Confirmed: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    Packing: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    Packed: { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200' },
    'Ready For Dispatch': { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
    Shipped: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    Completed: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    Cancelled: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
    Returned: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
    Refunded: { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' }
  };

  const filteredOrders = orders.filter(o => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = o.id.toLowerCase().includes(q);
      const nameMatch = o.customerName.toLowerCase().includes(q);
      const phoneMatch = o.customerPhone.includes(q);
      const cityMatch = o.city.toLowerCase().includes(q);
      if (!idMatch && !nameMatch && !phoneMatch && !cityMatch) return false;
    }

    if (selectedStatusFilter !== 'all' && o.status !== selectedStatusFilter) {
      return false;
    }

    return true;
  });

  const handleBulkStatusUpdate = async (targetStatus: Order['status']) => {
    const applicableOrders = orders.filter((order) => {
      if (targetStatus === 'Packing') {
        return ['Pending', 'Confirmed'].includes(order.status);
      }
      if (targetStatus === 'Ready For Dispatch') {
        return ['Packing', 'Packed'].includes(order.status);
      }
      return false;
    });

    if (applicableOrders.length === 0) {
      showToast('No orders match the selected fulfillment step.');
      return;
    }

    for (const order of applicableOrders) {
      await updateOrderStatus(order.id, targetStatus);
    }

    showToast(`Updated ${applicableOrders.length} orders to ${targetStatus}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Client Store Orders & Fulfillment</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor client checkouts, dispatch parcels, track payment methods and change order status.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <ShoppingBag className="w-4 h-4 text-sky-600" />
          <span>Total Orders: {orders.length}</span>
        </div>
      </div>

      {/* Filters & Status Tabs */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleBulkStatusUpdate('Packing')}
          className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Pack Orders</span>
        </button>
        <button
          onClick={() => handleBulkStatusUpdate('Ready For Dispatch')}
          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Dispatch Queue</span>
        </button>
        <button
          onClick={() => showToast('Label printing is ready for the selected dispatch batch.')}
          className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Print Labels</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Order ID (e.g. JJ-1001), customer name or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
            />
          </div>

          {/* Status Select */}
          <div className="sm:w-56">
            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
            >
              <option value="all">All Statuses ({orders.length})</option>
              {statusOptions.map(st => (
                <option key={st} value={st}>
                  {st} ({orders.filter(o => o.status === st).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills Quick Filter */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
          <button
            onClick={() => setSelectedStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
              selectedStatusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {statusOptions.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer border ${
                selectedStatusFilter === st
                  ? `${statusColors[st].bg} ${statusColors[st].text} ${statusColors[st].border}`
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st} ({orders.filter(o => o.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Showing {filteredOrders.length} orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer & Contact</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    No orders matching your criteria found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const style = statusColors[order.status];

                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      {/* Order ID & Date */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{order.id}</div>
                        <div className="text-[10px] text-slate-400">{order.createdAt}</div>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{order.customerPhone}</div>
                      </td>

                      {/* Address & City */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{order.city}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                          {order.address}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-[10px]">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="p-3 font-black text-slate-900">
                        Rs. {order.totalAmount.toLocaleString()}
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-3">
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className={`px-2 py-1 rounded text-[11px] font-bold border cursor-pointer ${style.bg} ${style.text} ${style.border}`}
                        >
                          {statusOptions.map(st => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* View Details */}
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded text-xs cursor-pointer flex items-center justify-end gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Items</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal (No Animations) */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                  Order Details
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Order {selectedOrderDetails.id}
                </h3>
              </div>

              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Info Card */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Customer:</span>
                <span className="font-bold text-slate-900">{selectedOrderDetails.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Contact Phone:</span>
                <span className="font-bold font-mono text-slate-800">{selectedOrderDetails.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Shipping Address:</span>
                <span className="font-semibold text-slate-800 text-right">{selectedOrderDetails.address}, {selectedOrderDetails.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Payment Method:</span>
                <span className="font-bold text-sky-700">{selectedOrderDetails.paymentMethod}</span>
              </div>
              {selectedOrderDetails.notes && (
                <div className="pt-1 text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-100">
                  <strong>Notes:</strong> {selectedOrderDetails.notes}
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Order Line Items ({selectedOrderDetails.items.length})
              </h4>

              <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-10 h-10 rounded object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-800 line-clamp-1">{item.productName}</div>
                        {item.variantName && (
                          <div className="text-[10px] text-slate-400">Variant: {item.variantName}</div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        {item.quantity} x Rs. {item.price.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-sky-600 font-extrabold">
                        Rs. {(item.quantity * item.price).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Footer */}
            <div className="p-3 bg-slate-900 text-white rounded-lg flex items-center justify-between text-sm font-bold">
              <span>Total Payable</span>
              <span className="text-sky-400 text-base font-black">
                Rs. {selectedOrderDetails.totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
