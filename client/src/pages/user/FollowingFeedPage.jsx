import { useState, useEffect } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import postService from '../../services/post.service.js';
import PostCard from '../../components/cards/PostCard.jsx';
import { PostCardSkeleton } from '../../components/common/Skeleton.jsx';

export default function FollowingFeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const res = await postService.getFollowingFeed({ page: 1, limit: 12 });
        setPosts(res.data?.posts || []);
      } catch (err) {
        console.error('Failed to load following feed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Users className="w-6 h-6 text-burgundy" /> Following Feed
        </h1>
        <p className="text-sm text-gray-500">Updates and inspirations from accounts you follow</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No posts from following yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            You aren't following anyone yet or they haven't posted. Explore top creators and vendors to follow!
          </p>
          <div className="flex justify-center gap-3 mt-5">
            <Link
              to="/creators"
              className="px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all"
            >
              Discover Creators
            </Link>
            <Link
              to="/vendors"
              className="px-4 py-2 bg-white border border-gray-200 text-charcoal rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Browse Vendors
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
