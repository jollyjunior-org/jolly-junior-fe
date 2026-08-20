import React, { useEffect, useMemo, useState } from 'react';
import {
  ShoppingBag, Search, Filter, Eye,
  X, Trash2, RotateCcw,
} from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { Order, OrderReturn } from '../../types';
import * as orderService from '../../services/order-service';
import { ReloadButton } from './ReloadButton';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, createOrderReturn, showToast, fetchAdminOrders } = useShopStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [returnOrder, setReturnOrder] = useState<Order | null>(null);
  const [existingReturns, setExistingReturns] = useState<OrderReturn[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  // order_item_id → qty to return
  const [returnQtys, setReturnQtys] = useState<Record<number, number>>({});
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const statusOptions: Order['status'][] = [
    'Pending',
    'Processing',
    'Confirmed',
    'Packing',
    'Packed',
    'Ready For Dispatch',
    'Shipped',
    'Delivered',
    'Completed',
    'Cancelled',
    'Returned',
    'Refunded',
  ];

  const statusColors: Record<Order['status'], { bg: string; text: string; border: string }> = {
    Pending: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    Processing: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
    Confirmed: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    Packing: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    Packed: { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200' },
    'Ready For Dispatch': { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
    Shipped: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    Completed: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    Cancelled: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
    Returned: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
    Refunded: { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' },
  };

  // Keep detail modal in sync after status / return refreshes
  useEffect(() => {
    if (!selectedOrderDetails) return;
    const fresh = orders.find((o) => o.id === selectedOrderDetails.id);
    if (fresh) setSelectedOrderDetails(fresh);
  }, [orders, selectedOrderDetails?.id]);

  const filteredOrders = orders.filter((o) => {
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

  /** Already-returned qty per order line from approved/completed returns. */
  const alreadyReturnedByItem = useMemo(() => {
    const map: Record<number, number> = {};
    for (const ret of existingReturns) {
      if (ret.status !== 'Approved' && ret.status !== 'Completed') continue;
      for (const item of ret.items) {
        map[item.orderItemId] = (map[item.orderItemId] || 0) + item.quantity;
      }
    }
    return map;
  }, [existingReturns]);

  const handleDeleteOrder = async (order: Order) => {
    const label = order.orderNumber || order.id;
    if (
      !window.confirm(
        `Delete order ${label}?\n\nThis cannot be undone. Stock will be restored if it was still deducted.`,
      )
    ) {
      return;
    }

    await deleteOrder(order.id);
    if (selectedOrderDetails?.id === order.id) {
      setSelectedOrderDetails(null);
    }
    if (returnOrder?.id === order.id) {
      setReturnOrder(null);
    }
  };

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

  /**
   * Open return modal for an order — loads existing returns for remaining qty.
   * Args: order — source order (kept unchanged; returns are separate records)
   */
  const openReturnModal = async (order: Order) => {
    if (!order.stockDeducted) {
      showToast('Mark the order Delivered or Completed first so stock is deducted, then process returns.');
      return;
    }

    setReturnOrder(order);
    setReturnReason('');
    setReturnNotes('');
    setReturnQtys({});

    try {
      const returns = await orderService.fetchOrderReturns(order.id);
      setExistingReturns(returns);

      const returnedMap: Record<number, number> = {};
      for (const ret of returns) {
        if (ret.status !== 'Approved' && ret.status !== 'Completed') continue;
        for (const item of ret.items) {
          returnedMap[item.orderItemId] = (returnedMap[item.orderItemId] || 0) + item.quantity;
        }
      }

      const initial: Record<number, number> = {};
      for (const item of order.items) {
        if (item.id == null) continue;
        const remaining = item.quantity - (returnedMap[item.id] || 0);
        initial[item.id] = remaining > 0 ? 0 : 0;
      }
      setReturnQtys(initial);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load returns';
      showToast(`Error: ${message}`);
      setExistingReturns([]);
    }
  };

  /** Submit partial/full return — creates Return record and restocks returned qty. */
  const handleSubmitReturn = async () => {
    if (!returnOrder) return;
    if (!returnReason.trim()) {
      showToast('Please enter a return reason.');
      return;
    }

    const items = Object.entries(returnQtys)
      .map(([orderItemId, quantity]) => ({
        orderItemId: Number(orderItemId),
        quantity: Number(quantity),
      }))
      .filter((row) => row.quantity > 0);

    if (items.length === 0) {
      showToast('Select at least one product quantity to return.');
      return;
    }

    setSubmittingReturn(true);
    const ok = await createOrderReturn(returnOrder.id, {
      reason: returnReason.trim(),
      notes: returnNotes.trim() || undefined,
      items,
    });
    setSubmittingReturn(false);

    if (ok) {
      setReturnOrder(null);
      setExistingReturns([]);
    }
  };

  const canProcessReturn = (order: Order) =>
    Boolean(order.stockDeducted) &&
    !['Cancelled'].includes(order.status);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Client Store Orders & Fulfillment</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Stock deducts on Delivered/Completed. Use Process Return for full or partial returns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ReloadButton onReload={fetchAdminOrders} label="Reload Orders" />
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <ShoppingBag className="w-4 h-4 text-sky-600" />
            <span>Total Orders: {orders.length}</span>
          </div>
        </div>
      </div>

      {/* Filters & Status Tabs */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order, customer, phone, city..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-2 py-2 text-xs border border-slate-200 rounded-lg font-semibold cursor-pointer"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st} ({orders.filter((o) => o.status === st).length})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => handleBulkStatusUpdate('Packing')}
          className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg cursor-pointer"
        >
          Bulk → Packing
        </button>
        <button
          onClick={() => handleBulkStatusUpdate('Ready For Dispatch')}
          className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-lg cursor-pointer"
        >
          Bulk → Ready For Dispatch
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {statusOptions.map((st) => {
          const style = statusColors[st];
          const active = selectedStatusFilter === st;
          return (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(active ? 'all' : st)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${
                active ? `${style.bg} ${style.text} ${style.border}` : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              {st} ({orders.filter((o) => o.status === st).length})
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Showing {filteredOrders.length} orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3 font-bold">Order</th>
                <th className="p-3 font-bold">Customer</th>
                <th className="p-3 font-bold">Address</th>
                <th className="p-3 font-bold">Payment</th>
                <th className="p-3 font-bold">Total</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                    No orders matching your criteria found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const style = statusColors[order.status] || statusColors.Pending;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80">
                      <td className="p-3">
                        <div className="font-black text-slate-900">{order.orderNumber || order.id}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                        </div>
                        {order.stockDeducted && (
                          <div className="text-[9px] font-bold text-emerald-600 mt-0.5">Stock deducted</div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-800">{order.customerName}</div>
                        <div className="text-[10px] text-slate-500">{order.customerPhone}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-slate-700">{order.city}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                          {order.address}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-[10px]">
                          {order.paymentMethod}
                        </span>
                      </td>

                      <td className="p-3 font-black text-slate-900">
                        <div>Rs. {order.totalAmount.toLocaleString()}</div>
                        {order.originalTotalAmount != null &&
                          order.originalTotalAmount > order.totalAmount && (
                            <div className="text-[10px] font-semibold text-slate-400 line-through">
                              was Rs. {order.originalTotalAmount.toLocaleString()}
                            </div>
                          )}
                      </td>

                      <td className="p-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className={`px-2 py-1 rounded text-[11px] font-bold border cursor-pointer ${style.bg} ${style.text} ${style.border}`}
                        >
                          {statusOptions.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded text-xs cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          {canProcessReturn(order) && (
                            <button
                              onClick={() => openReturnModal(order)}
                              className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded text-xs cursor-pointer flex items-center gap-1"
                              title="Process full or partial return"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Return</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded text-xs cursor-pointer flex items-center gap-1"
                            title="Delete order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                  Order Details
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Order {selectedOrderDetails.orderNumber || selectedOrderDetails.id}
                </h3>
              </div>

              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                <span className="font-semibold text-slate-800 text-right">
                  {selectedOrderDetails.address}, {selectedOrderDetails.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Payment Method:</span>
                <span className="font-bold text-sky-700">{selectedOrderDetails.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Inventory:</span>
                <span className={`font-bold ${selectedOrderDetails.stockDeducted ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {selectedOrderDetails.stockDeducted ? 'Stock deducted' : 'Not deducted yet'}
                </span>
              </div>
              {selectedOrderDetails.notes && (
                <div className="pt-1 text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-100">
                  <strong>Notes:</strong> {selectedOrderDetails.notes}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Order Line Items ({selectedOrderDetails.items.length})
              </h4>

              <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
                {selectedOrderDetails.items.map((item, idx) => {
                  const returnedQty = (selectedOrderDetails.returns || [])
                    .filter((r) => r.status === 'Approved' || r.status === 'Completed')
                    .flatMap((r) => r.items)
                    .filter((ri) => ri.orderItemId === item.id)
                    .reduce((sum, ri) => sum + ri.quantity, 0);
                  const kept = Math.max(0, item.quantity - returnedQty);
                  return (
                    <div key={item.id ?? idx} className="py-2 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-2.5">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-10 h-10 rounded object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200" />
                        )}
                        <div>
                          <div className="font-bold text-slate-800 line-clamp-1">{item.productName}</div>
                          {item.variantName && (
                            <div className="text-[10px] text-slate-400">Variant: {item.variantName}</div>
                          )}
                          {returnedQty > 0 && (
                            <div className="text-[10px] text-orange-600 font-semibold">
                              Ordered {item.quantity} · Returned {returnedQty} · Kept {kept}
                            </div>
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
                  );
                })}
              </div>
            </div>

            {/* Order financial history: original → returns → current */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Order History
              </h4>
              <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
                <div className="flex justify-between gap-3 px-3 py-2.5 bg-slate-50 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-slate-800">Order placed</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {selectedOrderDetails.items.reduce((s, i) => s + i.quantity, 0)} items
                      {selectedOrderDetails.createdAt
                        ? ` · ${new Date(selectedOrderDetails.createdAt).toLocaleString()}`
                        : ''}
                    </div>
                  </div>
                  <div className="font-black text-slate-900 shrink-0">
                    Rs. {(selectedOrderDetails.originalTotalAmount ?? selectedOrderDetails.totalAmount).toLocaleString()}
                  </div>
                </div>

                {(selectedOrderDetails.returns || [])
                  .slice()
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((ret) => {
                    const qty = ret.items.reduce((s, i) => s + i.quantity, 0);
                    return (
                      <div
                        key={ret.id}
                        className="flex justify-between gap-3 px-3 py-2.5 border-b border-slate-100 bg-orange-50/40"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-orange-800">
                            Return {ret.returnNumber}
                          </div>
                          <div className="text-[10px] text-slate-600 mt-0.5 truncate">
                            {qty} item{qty === 1 ? '' : 's'} returned · {ret.reason}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {ret.status}
                            {ret.createdAt ? ` · ${new Date(ret.createdAt).toLocaleString()}` : ''}
                          </div>
                          {ret.items.length > 0 && (
                            <ul className="mt-1 space-y-0.5 text-[10px] text-slate-600">
                              {ret.items.map((ri) => (
                                <li key={ri.id}>
                                  {ri.productName}: {ri.quantity} × Rs. {ri.unitPrice.toLocaleString()}
                                  {' = '}Rs. {ri.lineAmount.toLocaleString()}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="font-black text-orange-700 shrink-0">
                          − Rs. {ret.refundAmount.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}

                <div className="flex justify-between gap-3 px-3 py-3 bg-slate-900 text-white">
                  <div>
                    <div className="font-bold">Current order total</div>
                    <div className="text-[10px] text-slate-300 mt-0.5">
                      After all approved returns
                    </div>
                  </div>
                  <div className="text-sky-400 text-base font-black shrink-0">
                    Rs. {selectedOrderDetails.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 flex-wrap">
              {canProcessReturn(selectedOrderDetails) && (
                <button
                  onClick={() => openReturnModal(selectedOrderDetails)}
                  className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Process Return
                </button>
              )}
              <button
                onClick={() => handleDeleteOrder(selectedOrderDetails)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Order
              </button>
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

      {/* Partial / Full Return Modal */}
      {returnOrder && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  Process Return
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {returnOrder.orderNumber || returnOrder.id}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Original lines stay in history. Current order total is reduced by the return amount.
                </p>
              </div>
              <button
                onClick={() => setReturnOrder(null)}
                className="p-1 bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {returnOrder.items.map((item, idx) => {
                if (item.id == null) {
                  return (
                    <div key={idx} className="text-xs text-rose-600">
                      Missing line id for {item.productName} — refresh orders and try again.
                    </div>
                  );
                }
                const already = alreadyReturnedByItem[item.id] || 0;
                const remaining = Math.max(0, item.quantity - already);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate">{item.productName}</div>
                      <div className="text-[10px] text-slate-500">
                        Ordered {item.quantity}
                        {already > 0 ? ` · already returned ${already}` : ''}
                        {' · '}
                        remaining {remaining}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="text-[10px] font-bold text-slate-500">Qty</label>
                      <input
                        type="number"
                        min={0}
                        max={remaining}
                        value={returnQtys[item.id] ?? 0}
                        disabled={remaining === 0}
                        onChange={(e) => {
                          const next = Math.min(remaining, Math.max(0, Number(e.target.value) || 0));
                          setReturnQtys((prev) => ({ ...prev, [item.id as number]: next }));
                        }}
                        className="w-16 px-2 py-1 border border-slate-200 rounded font-bold text-center"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-600">Return reason *</label>
              <input
                type="text"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="e.g. Damaged item, wrong size, customer changed mind"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
              <label className="block text-[11px] font-bold text-slate-600">Notes (optional)</label>
              <textarea
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg resize-none"
                placeholder="Internal notes"
              />
              {/* Live preview of refund vs remaining order total */}
              {(() => {
                const refundPreview = returnOrder.items.reduce((sum, item) => {
                  if (item.id == null) return sum;
                  const qty = returnQtys[item.id] || 0;
                  return sum + qty * item.price;
                }, 0);
                const currentTotal = returnOrder.totalAmount;
                const afterTotal = Math.max(0, currentTotal - refundPreview);
                if (refundPreview <= 0) return null;
                return (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-[11px] space-y-1">
                    <div className="flex justify-between font-bold text-orange-800">
                      <span>This return amount</span>
                      <span>Rs. {refundPreview.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Order total after return</span>
                      <span className="font-bold text-slate-900">Rs. {afterTotal.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {existingReturns.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Previous returns
                </h4>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {existingReturns.map((ret) => (
                    <div
                      key={ret.id}
                      className="text-[10px] px-2.5 py-1.5 rounded border border-slate-200 bg-white flex justify-between gap-2"
                    >
                      <span className="font-bold text-slate-700">{ret.returnNumber}</span>
                      <span className="text-slate-500 truncate">{ret.reason}</span>
                      <span className="font-bold text-orange-700 shrink-0">
                        −Rs. {ret.refundAmount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setReturnOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReturn}
                disabled={submittingReturn}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {submittingReturn ? 'Processing…' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
