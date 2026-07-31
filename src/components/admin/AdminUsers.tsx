import React, { useState } from 'react';
import { 
  Users, Search, UserPlus, CheckCircle2, XCircle, 
  Trash2, Mail, Phone, MapPin, Calendar, ShoppingBag, X
} from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { AppUser } from '../../types';

export const AdminUsers: React.FC = () => {
  const { users, orders, addUser, updateUserStatus, deleteUser } = useShopStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Suspended'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserHistory, setSelectedUserHistory] = useState<AppUser | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Karachi',
    status: 'Active' as 'Active' | 'Suspended'
  });

  const handleOpenModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: 'Karachi',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      status: formData.status,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      totalOrders: 0,
      totalSpent: 0
    });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      deleteUser(id);
    }
  };

  const filteredUsers = users.filter(u => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = u.name.toLowerCase().includes(q);
      const emailMatch = u.email.toLowerCase().includes(q);
      const phoneMatch = u.phone.includes(q);
      const cityMatch = u.city.toLowerCase().includes(q);
      const addressMatch = (u.address || '').toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !phoneMatch && !cityMatch && !addressMatch) return false;
    }

    if (statusFilter !== 'all' && u.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Registered Users & Customer Base</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View registered parents, check order totals, toggle account access and add new client users.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer border-none shadow-2xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search user by name, email, phone, city or address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
          />
        </div>

        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
          >
            <option value="all">All User Statuses</option>
            <option value="Active">Active Users Only</option>
            <option value="Suspended">Suspended Users Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Showing {filteredUsers.length} users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">User & Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Address</th>
                <th className="p-3">City</th>
                <th className="p-3">Joined Date</th>
                <th className="p-3">Total Orders</th>
                <th className="p-3">Account Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.map(u => {
                const isActive = u.status === 'Active';
                const userOrders = orders.filter(
                  o => o.customerEmail.toLowerCase() === u.email.toLowerCase() || o.customerPhone === u.phone
                );

                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    {/* Name & Email */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>

                    {/* Phone */}
                    <td className="p-3 font-mono text-slate-800">{u.phone || '—'}</td>

                    {/* Address */}
                    <td className="p-3 max-w-[220px]">
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2" title={u.address || undefined}>
                          {u.address?.trim() ? u.address : '—'}
                        </span>
                      </div>
                    </td>

                    {/* City */}
                    <td className="p-3">{u.city || '—'}</td>

                    {/* Joined Date */}
                    <td className="p-3 text-slate-500">{u.joinedDate}</td>

                    {/* Total Orders */}
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedUserHistory(u)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-[11px] cursor-pointer"
                      >
                        {userOrders.length || u.totalOrders} Orders
                      </button>
                    </td>

                    {/* Status Toggle */}
                    <td className="p-3">
                      <button
                        onClick={() => updateUserStatus(u.id, isActive ? 'Suspended' : 'Active')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer border flex items-center gap-1 ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{u.status}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New User Account</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sana Ahmed"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="sana@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="0300 1234567"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="House / Street / Area"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <select
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  >
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Faisalabad">Faisalabad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-sky-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-2xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User History Modal */}
      {selectedUserHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedUserHistory.name}</h3>
                <p className="text-xs text-slate-500">{selectedUserHistory.email} • {selectedUserHistory.phone}</p>
                {selectedUserHistory.address && (
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedUserHistory.address}
                    {selectedUserHistory.city ? `, ${selectedUserHistory.city}` : ''}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedUserHistory(null)}
                className="p-1 bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                User Order History
              </h4>

              {orders.filter(o => o.customerPhone === selectedUserHistory.phone || o.customerEmail === selectedUserHistory.email).length === 0 ? (
                <div className="p-4 bg-slate-50 rounded text-xs text-slate-500 text-center font-medium">
                  No orders recorded for this user account yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {orders
                    .filter(o => o.customerPhone === selectedUserHistory.phone || o.customerEmail === selectedUserHistory.email)
                    .map(ord => (
                      <div key={ord.id} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{ord.id}</div>
                          <div className="text-[10px] text-slate-500">{ord.createdAt}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">Rs. {ord.totalAmount.toLocaleString()}</div>
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => setSelectedUserHistory(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
