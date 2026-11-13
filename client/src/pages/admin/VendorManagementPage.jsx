import { useState, useEffect } from 'react';
import { Store, Search, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import businessService from '../../services/business.service.js';

export default function VendorManagementPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    businessService.getBusinesses()
      .then(res => setVendors(res.data?.businesses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = vendors.filter(v => {
    const text = `${v.name} ${v.location?.city} ${v.category?.name}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Store className="w-6 h-6 text-burgundy" /> Vendor Businesses Directory
        </h1>
        <p className="text-sm text-gray-500">Overview of all registered wedding suppliers and listings</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by business name or location..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy shadow-soft"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse shadow-soft" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Business</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(v => (
                  <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-charcoal">{v.name}</p>
                      <p className="text-xs text-gray-400">{v.tagline}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                        {v.category?.name || 'Vendor'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">{v.location?.city || 'Worldwide'}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                        v.verificationStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : v.verificationStatus === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {v.verificationStatus || 'Unverified'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <p className="text-gray-500 text-sm">No vendors found.</p>
        </div>
      )}
    </div>
  );
}
