import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PostCard } from '../../components/cards/PostCard.jsx';
import { PostCardSkeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import SaveToCollectionModal from '../../components/modals/SaveToCollectionModal.jsx';
import { postService } from '../../services/post.service.js';
import { categoryService } from '../../services/category.service.js';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

export const ExplorePage = ({ feedType = 'for-you' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [savedModalPost, setSavedModalPost] = useState(null);

  useEffect(() => {
    categoryService.getCategories().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        let res;
        const params = {
          categoryId: selectedCategory || undefined,
          search: searchParams.get('q') || undefined,
          tag: searchParams.get('tag') || undefined,
        };

        if (feedType === 'trending') {
          res = await postService.getTrendingFeed(params);
        } else {
          res = await postService.getForYouFeed(params);
        }

        setPosts(res.data?.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [feedType, selectedCategory, searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-burgundy/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700">Inspiration Gallery</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal mt-1">
            {feedType === 'trending' ? 'Trending Wedding Concepts' : 'Discover Wedding Inspiration'}
          </h1>
          <p className="text-xs sm:text-sm text-mutedGray mt-1">
            Save wedding tablescapes, couture dresses, fine art florals, and venue atmospheres to your private boards.
          </p>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              !selectedCategory ? 'bg-burgundy text-white' : 'bg-white border border-charcoal/10 text-charcoal hover:bg-rose-50'
            }`}
          >
            All Themes
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => setSelectedCategory(c._id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === c._id ? 'bg-burgundy text-white' : 'bg-white border border-charcoal/10 text-charcoal hover:bg-rose-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Posts */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No inspirations found"
          description="Try selecting a different wedding category or search query."
          actionLabel="View All Inspirations"
          onAction={() => setSelectedCategory('')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onSaveClick={(p) => setSavedModalPost(p)}
            />
          ))}
        </div>
      )}

      {/* Save to Collection Modal */}
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

export default ExplorePage;
