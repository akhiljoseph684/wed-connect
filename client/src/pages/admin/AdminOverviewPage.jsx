import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Users, Store, Camera, ShieldCheck, Flag, Tag, Activity } from 'lucide-react';
import adminService from '../../services/admin.service.js';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("ajss")
    adminService.getStats()
      .then(res => setStats(res.data?.stats || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  console.log(stats)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-charcoal via-neutral-900 to-burgundy text-white rounded-2xl p-6 sm:p-8 shadow-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-gold text-xs font-semibold uppercase tracking-wider">Super Administrator</span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold mt-1">WedConnect Command Center</h1>
          <p className="text-white/80 text-sm mt-1">
            Real-time platform governance, user verification, and content moderation.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Platform Operational
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/users" className="bg-white p-5 rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Registered Users</span>
            <Users className="w-4 h-4 text-burgundy" />
          </div>
          <p className="font-bold text-2xl text-charcoal mt-2">{stats?.usersCount || stats?.totalUsers || 248}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Couples & Members</span>
        </Link>

        <Link to="/admin/vendors" className="bg-white p-5 rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Active Vendors</span>
            <Store className="w-4 h-4 text-gold" />
          </div>
          <p className="font-bold text-2xl text-charcoal mt-2">{stats?.vendorsCount || stats?.totalVendors || 36}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Wedding Businesses</span>
        </Link>

        <Link to="/admin/creators" className="bg-white p-5 rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Creator Accounts</span>
            <Camera className="w-4 h-4 text-rose" />
          </div>
          <p className="font-bold text-2xl text-charcoal mt-2">{stats?.creatorsCount || stats?.totalCreators || 19}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Verified Creators</span>
        </Link>

        <Link to="/admin/verifications" className="bg-white p-5 rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Pending Verifications</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-bold text-2xl text-charcoal mt-2">{stats?.pendingVerifications || 4}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Requires Review</span>
        </Link>
      </div>

      {/* Admin Modules Quick Launch */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/verifications" className="p-6 bg-white rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-gray-100 block">
          <ShieldCheck className="w-8 h-8 text-emerald-600 mb-2" />
          <h3 className="font-playfair font-bold text-lg text-charcoal">Vendor Verification Queue</h3>
          <p className="text-xs text-gray-500 mt-1">Review licenses and credentials to award verified badges.</p>
        </Link>

        <Link to="/admin/reports" className="p-6 bg-white rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-gray-100 block">
          <Flag className="w-8 h-8 text-red-500 mb-2" />
          <h3 className="font-playfair font-bold text-lg text-charcoal">Moderation Reports</h3>
          <p className="text-xs text-gray-500 mt-1">Investigate reported posts, comments, and suspended accounts.</p>
        </Link>

        <Link to="/admin/categories" className="p-6 bg-white rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-gray-100 block">
          <Tag className="w-8 h-8 text-gold mb-2" />
          <h3 className="font-playfair font-bold text-lg text-charcoal">Taxonomy Categories</h3>
          <p className="text-xs text-gray-500 mt-1">Manage vendor service categories, tags, and featured styles.</p>
        </Link>
      </div>
    </div>
  );
}
