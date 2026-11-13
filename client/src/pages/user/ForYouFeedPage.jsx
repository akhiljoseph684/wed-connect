import { useState, useEffect } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import postService from '../../services/post.service.js';
import PostCard from '../../components/cards/PostCard.jsx';
import { PostCardSkeleton } from '../../components/common/Skeleton.jsx';
import CreatePostModal from '../../components/modals/CreatePostModal.jsx';

export default function ForYouFeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const res = await postService.getForYouFeed({ page: 1, limit: 12 });
        setPosts(res.data?.posts || []);
        setHasMore((res.data?.posts || []).length >= 12);
      } catch (err) {
        console.error('Failed to load feed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await postService.getForYouFeed({ page: nextPage, limit: 12 });
      const newPosts = res.data?.posts || [];
      setPosts(prev => [...prev, ...newPosts]);
      setPage(nextPage);
      setHasMore(newPosts.length >= 12);
    } catch (err) {
      console.error('Failed to load more posts', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-burgundy" /> For You Feed
          </h1>
          <p className="text-sm text-gray-500">Discover inspirations tailored to your style</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft"
        >
          <Plus className="w-4 h-4" /> Share Inspiration
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-white border border-gray-200 text-charcoal rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all shadow-soft"
              >
                {loadingMore ? 'Loading more...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No inspirations found</h3>
          <p className="text-sm text-gray-500 mt-1">Explore different categories or share your own!</p>
        </div>
      )}

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newPost) => setPosts(prev => [newPost, ...prev])}
      />
    </div>
  );
}
