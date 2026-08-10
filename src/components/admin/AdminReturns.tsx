import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Package,
  RefreshCw,
  AlertCircle,
  Loader2,
  DollarSign,
} from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import * as orderService from '../../services/order-service';
import type { OrderReturn } from '../../types';

export const AdminReturns: React.FC = () => {
  const { showToast } = useShopStore();
  const [returns, setReturns] = useState<OrderReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const data = await orderService.fetchAllAdminReturns();
      setReturns(data);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load order returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleUpdateStatus = async (returnId: string, status: string) => {
    setUpdatingId(returnId);
    try {
      await orderService.updateAdminReturnStatus(returnId, status);
      showToast(`Return status updated to ${status}`);
      await loadReturns();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update return status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReturns = returns.filter((r) => {
    const matchesStatus =
      statusFilter === 'All' || r.status.toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      r.returnNumber.toLowerCase().includes(query) ||
      r.orderId.toLowerCase().includes(query) ||
      r.reason.toLowerCase().includes(query) ||
      r.items.some((i) => i.productName.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });

  const pendingCount = returns.filter((r) => r.status === 'Pending').length;
  const approvedCount = returns.filter(
    (r) => r.status === 'Approved' || r.status === 'Completed',
  ).length;
  const totalRefunded = returns
    .filter((r) => r.status === 'Approved' || r.status === 'Completed')
    .reduce((sum, r) => sum + (r.refundAmount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <RotateCcw className="w-7 h-7 text-[#0798AE]" />
            Order Returns Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review customer return requests, approve refunds, and automatically restock inventory.
          </p>
        </div>
        <button
          onClick={loadReturns}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-[#D9F1F5] text-[#0798AE] rounded-xl">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Returns</p>
            <p className="text-2xl font-black text-slate-800">{returns.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Action</p>
            <p className="text-2xl font-black text-amber-800">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Approved / Restocked</p>
            <p className="text-2xl font-black text-emerald-800">{approvedCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Refunded</p>
            <p className="text-2xl font-black text-indigo-800">Rs. {totalRefunded.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Controls: Search & Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['All', 'Pending', 'Approved', 'Rejected', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#0798AE] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
              {status === 'Pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search return #, order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0798AE]"
          />
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#0798AE]" />
            <p className="text-xs text-slate-500 font-semibold">Loading returns...</p>
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">No return requests found</p>
            <p className="text-xs">Customer return requests will appear here when submitted.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Return #</th>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Items Returned</th>
                  <th className="p-4">Reason & Notes</th>
                  <th className="p-4">Refund Amt</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReturns.map((ret) => {
                  const isUpdating = updatingId === ret.id;
                  return (
                    <tr key={ret.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-[#0798AE]">
                        {ret.returnNumber}
                        <p className="text-[10px] text-slate-400 font-normal">
                          {ret.createdAt ? new Date(ret.createdAt).toLocaleDateString() : ''}
                        </p>
                      </td>
                      <td className="p-4 text-slate-600 font-mono text-[11px]">
                        {ret.orderId.substring(0, 8)}...
                      </td>
                      <td className="p-4">
                        <ul className="space-y-1">
                          {ret.items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 text-slate-700 font-medium">
                              <Package className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>
                                {item.quantity}× {item.productName}{' '}
                                {item.variantName ? `(${item.variantName})` : ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="font-bold text-slate-700">{ret.reason}</p>
                        {ret.notes && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5 truncate">
                            "{ret.notes}"
                          </p>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        Rs. {ret.refundAmount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            ret.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : ret.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ret.status === 'Completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ret.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {ret.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                          {ret.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                          {ret.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#0798AE] ml-auto" />
                        ) : ret.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(ret.id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title="Approve return & automatically restock inventory"
                            >
                              Approve & Restock
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(ret.id, 'Rejected')}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : ret.status === 'Approved' ? (
                          <button
                            onClick={() => handleUpdateStatus(ret.id, 'Completed')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#263238] font-semibold">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
