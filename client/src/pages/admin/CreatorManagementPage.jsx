import { useState, useEffect } from 'react';
import { Camera, Search } from 'lucide-react';
import creatorService from '../../services/creator.service.js';

export default function CreatorManagementPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    creatorService.getCreators()
      .then(res => setCreators(res.data?.creators || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = creators.filter(c => {
    const text = `${c.brandName || ''} ${c.user?.firstName || ''} ${c.specialty || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Camera className="w-6 h-6 text-burgundy" /> Creator Directory
        </h1>
        <p className="text-sm text-gray-500">Overview of registered wedding styling and content creators</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by creator brand or specialty..."
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
                  <th className="p-4">Creator / Brand</th>
                  <th className="p-4">Specialty</th>
                  <th className="p-4">Socials</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-charcoal">{c.displayName || `${c.user?.firstName} ${c.user?.lastName}`}</p>
                      <p className="text-xs text-gray-400">@{c.username}</p>
                    </td>
                    <td className="p-4 text-xs text-gray-600">{c.specialty || 'Styling & Aesthetics'}</td>
                    <td className="p-4 text-xs text-burgundy">
                      {c.socials?.instagram ? `@${c.socials.instagram}` : 'Direct on platform'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <p className="text-gray-500 text-sm">No creators found.</p>
        </div>
      )}
    </div>
  );
}
