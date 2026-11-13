import { useState, useEffect } from 'react';
import { Users, Search, Ban, CheckCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/admin.service.js';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers();
      setUsers(res.data?.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      await adminService.updateUserStatus(user._id, { status: newStatus });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
      toast.success(`User marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const filtered = users.filter(u => {
    const text = `${u.firstName} ${u.lastName} ${u.email} ${u.role}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <Users className="w-6 h-6 text-burgundy" /> User Directory & Accounts
          </h1>
          <p className="text-sm text-gray-500">Manage all registered accounts, capabilities, and bans</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy shadow-soft"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse shadow-soft" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-charcoal">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold/15 text-charcoal font-semibold capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">{formatRelativeTime(u.createdAt)}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                        u.status === 'suspended' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          u.status === 'suspended'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <p className="text-gray-500 text-sm">No users matching search.</p>
        </div>
      )}
    </div>
  );
}
