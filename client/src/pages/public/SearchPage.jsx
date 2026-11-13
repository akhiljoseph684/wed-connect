import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import searchService from '../../services/search.service.js';
import PostCard from '../../components/cards/PostCard.jsx';
import VendorCard from '../../components/cards/VendorCard.jsx';
import CreatorCard from '../../components/cards/CreatorCard.jsx';
import { PostCardSkeleton } from '../../components/common/Skeleton.jsx';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'posts', label: 'Posts' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'creators', label: 'Creators' },
  { id: 'users', label: 'People' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({ posts: [], vendors: [], creators: [], users: [] });
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await searchService.search({ q, type: activeTab === 'all' ? undefined : activeTab });
      setResults(res.data || { posts: [], vendors: [], creators: [], users: [] });
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { doSearch(query); }, [query, activeTab, doSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) setSearchParams({ q: inputValue.trim() });
  };

  const totalResults = (results.posts?.length || 0) + (results.vendors?.length || 0) + (results.creators?.length || 0) + (results.users?.length || 0);

  return (
    <div className="min-h-screen bg-ivory">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 py-4">
        <div className="max-w-5xl mx-auto px-4">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Search posts, vendors, creators..."
              className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy bg-white text-charcoal"
            />
            {inputValue && (
              <button type="button" onClick={() => { setInputValue(''); setSearchParams({}); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal">
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {query && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id ? 'bg-burgundy text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-burgundy'
                  }`}>{tab.label}</button>
              ))}
            </div>

            {/* Results summary */}
            {!loading && query && (
              <p className="text-sm text-gray-500 mb-4">
                {totalResults > 0 ? `Found ${totalResults} results for "${query}"` : `No results found for "${query}"`}
              </p>
            )}

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <PostCardSkeleton key={i} />)}</div>
            ) : (
              <div className="space-y-8">
                {/* Posts */}
                {(activeTab === 'all' || activeTab === 'posts') && results.posts?.length > 0 && (
                  <section>
                    {activeTab === 'all' && <h2 className="font-playfair text-xl font-bold text-charcoal mb-4">Posts</h2>}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {results.posts.map(post => <PostCard key={post._id} post={post} />)}
                    </div>
                  </section>
                )}

                {/* Vendors */}
                {(activeTab === 'all' || activeTab === 'vendors') && results.vendors?.length > 0 && (
                  <section>
                    {activeTab === 'all' && <h2 className="font-playfair text-xl font-bold text-charcoal mb-4">Vendors</h2>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.vendors.map(vendor => <VendorCard key={vendor._id} business={vendor} />)}
                    </div>
                  </section>
                )}

                {/* Creators */}
                {(activeTab === 'all' || activeTab === 'creators') && results.creators?.length > 0 && (
                  <section>
                    {activeTab === 'all' && <h2 className="font-playfair text-xl font-bold text-charcoal mb-4">Creators</h2>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.creators.map(creator => <CreatorCard key={creator._id} creator={creator} />)}
                    </div>
                  </section>
                )}

                {/* Users */}
                {(activeTab === 'all' || activeTab === 'users') && results.users?.length > 0 && (
                  <section>
                    {activeTab === 'all' && <h2 className="font-playfair text-xl font-bold text-charcoal mb-4">People</h2>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.users.map(user => (
                        <div key={user._id} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-soft hover:shadow-elevated transition-all">
                          <img src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=7D1E3B&color=fff`} alt={user.firstName} className="w-12 h-12 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-charcoal">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {totalResults === 0 && (
                  <div className="text-center py-16">
                    <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <h3 className="font-playfair text-xl font-bold text-charcoal mb-2">No results found</h3>
                    <p className="text-gray-500">Try different keywords or browse our categories</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!query && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="font-playfair text-2xl font-bold text-charcoal mb-2">Search WedConnect</h2>
            <p className="text-gray-500">Search for wedding inspiration, vendors, creators, and more</p>
          </div>
        )}
      </div>
    </div>
  );
}
