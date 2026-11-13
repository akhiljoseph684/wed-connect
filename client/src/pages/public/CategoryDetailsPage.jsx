import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoryService } from '../../services/category.service.js';
import { businessService } from '../../services/business.service.js';
import { postService } from '../../services/post.service.js';
import VendorCard from '../../components/cards/VendorCard.jsx';
import PostCard from '../../components/cards/PostCard.jsx';
import SaveToCollectionModal from '../../components/modals/SaveToCollectionModal.jsx';
import { Sparkles, Store, Image } from 'lucide-react';

export const CategoryDetailsPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('vendors');
  const [savedModalPost, setSavedModalPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const catRes = await categoryService.getCategoryBySlug(slug);
        const cat = catRes.data;
        setCategory(cat);

        const [vendorRes, postRes] = await Promise.all([
          businessService.getBusinesses({ categorySlug: slug, limit: 12 }),
          postService.getForYouFeed({ categoryId: cat._id, limit: 12 }),
        ]);

        setVendors(vendorRes.data?.businesses || []);
        setPosts(postRes.data?.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (!category && !isLoading) {
    return (
      <div className="py-20 text-center">
        <h2 className="font-serif text-2xl">Category not found</h2>
        <Link to="/categories" className="text-sm text-burgundy underline mt-2 block">
          Return to All Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Category Hero */}
      <div className="relative h-72 sm:h-96 bg-charcoal text-white flex items-center justify-center overflow-hidden px-4">
        <img
          src={category?.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80'}
          alt={category?.name}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />

        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-300">
            Category Spotlight
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light">{category?.name}</h1>
          <p className="text-xs sm:text-sm text-ivory-200/90 leading-relaxed font-light">
            {category?.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-6 border-b border-burgundy/10 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('vendors')}
            className={`flex items-center gap-2 text-sm font-semibold pb-2 border-b-2 transition-all ${
              activeTab === 'vendors' ? 'border-burgundy text-burgundy' : 'border-transparent text-mutedGray hover:text-charcoal'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Vendors & Studios ({vendors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspiration')}
            className={`flex items-center gap-2 text-sm font-semibold pb-2 border-b-2 transition-all ${
              activeTab === 'inspiration' ? 'border-burgundy text-burgundy' : 'border-transparent text-mutedGray hover:text-charcoal'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Inspiration Gallery ({posts.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'vendors' ? (
          <div>
            {vendors.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-burgundy/5 p-8">
                <Store className="w-8 h-8 text-rose mx-auto mb-2" />
                <h3 className="font-serif text-lg text-charcoal">No vendors listed in this category yet</h3>
                <p className="text-xs text-mutedGray mt-1">Check back soon as new wedding artists join daily.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vendors.map((v) => (
                  <VendorCard key={v._id} business={v} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-burgundy/5 p-8">
                <Sparkles className="w-8 h-8 text-rose mx-auto mb-2" />
                <h3 className="font-serif text-lg text-charcoal">No inspiration posts in this category yet</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {posts.map((p) => (
                  <PostCard
                    key={p._id}
                    post={p}
                    onSaveClick={(post) => setSavedModalPost(post)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {savedModalPost && (
        <SaveToCollectionModal
          isOpen={!!savedModalPost}
          onClose={() => setSavedModalPost(null)}
          post={savedModalPost}
        />
      )}
    </div>
  );
};

export default CategoryDetailsPage;
