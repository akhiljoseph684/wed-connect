import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, Plus, Sparkles, Compass, Bookmark, Users, ChevronRight } from 'lucide-react';
import postService from '../../services/post.service.js';
import collectionService from '../../services/collection.service.js';
import PostCard from '../../components/cards/PostCard.jsx';
import CollectionCard from '../../components/cards/CollectionCard.jsx';
import { PostCardSkeleton } from '../../components/common/Skeleton.jsx';
import CreatePostModal from '../../components/modals/CreatePostModal.jsx';

export default function DashboardPage() {
  const { user } = useSelector(state => state.auth);
  const [posts, setPosts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedRes, collRes] = await Promise.allSettled([
          postService.getForYouFeed({ limit: 6 }),
          collectionService.getMyCollections(),
        ]);
        if (feedRes.status === 'fulfilled') {
          setPosts(feedRes.value.data?.posts || []);
        }
        if (collRes.status === 'fulfilled') {
          setCollections(collRes.value.data?.slice(0, 4) || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-burgundy to-rose text-white rounded-2xl p-6 sm:p-8 shadow-luxury flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-gold text-xs font-semibold uppercase tracking-wider">Welcome back</span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold mt-1">Hello, {user?.firstName}!</h1>
          <p className="text-white/80 text-sm mt-1 max-w-xl">
            Discover the latest wedding inspirations, curate your moodboards, and connect with premier vendors.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-burgundy rounded-xl font-medium hover:bg-ivory shadow-soft transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </button>
          {user?.isPlanner && (
            <Link
              to="/my-wedding"
              className="flex items-center gap-2 px-5 py-2.5 bg-gold text-charcoal rounded-xl font-medium hover:bg-gold/90 transition-all text-sm"
            >
              <Heart className="w-4 h-4" />
              My Wedding
            </Link>
          )}
        </div>
      </div>

      {/* Quick Links Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/feed/for-you" className="p-4 bg-white rounded-xl shadow-soft hover:shadow-elevated transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-burgundy/10 text-burgundy flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal">For You</p>
            <p className="text-xs text-gray-500">Personalized Feed</p>
          </div>
        </Link>

        <Link to="/saved" className="p-4 bg-white rounded-xl shadow-soft hover:shadow-elevated transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-rose/10 text-rose flex items-center justify-center group-hover:scale-110 transition-transform">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal">Collections</p>
            <p className="text-xs text-gray-500">{collections.length} saved boards</p>
          </div>
        </Link>

        <Link to="/vendors" className="p-4 bg-white rounded-xl shadow-soft hover:shadow-elevated transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gold/20 text-charcoal flex items-center justify-center group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal">Vendors</p>
            <p className="text-xs text-gray-500">Browse marketplace</p>
          </div>
        </Link>

        <Link to="/feed/following" className="p-4 bg-white rounded-xl shadow-soft hover:shadow-elevated transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-charcoal/10 text-charcoal flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal">Following</p>
            <p className="text-xs text-gray-500">Latest from friends</p>
          </div>
        </Link>
      </div>

      {/* Saved Collections section */}
      {collections.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-playfair text-xl font-bold text-charcoal">Your Moodboards & Collections</h2>
              <p className="text-xs text-gray-500">Recently saved inspiration</p>
            </div>
            <Link to="/saved" className="text-sm text-burgundy hover:text-burgundy/80 font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {collections.map(col => (
              <CollectionCard key={col._id} collection={col} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended Inspiration Feed */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-playfair text-xl font-bold text-charcoal">Curated For You</h2>
            <p className="text-xs text-gray-500">Trending styles and ideas matching your interests</p>
          </div>
          <Link to="/feed/for-you" className="text-sm text-burgundy hover:text-burgundy/80 font-medium flex items-center gap-1">
            See more <ChevronRight className="w-4 h-4" />
          </Link>
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
          <div className="text-center py-12 bg-white rounded-2xl shadow-soft border border-gray-100">
            <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-charcoal">No inspirations available right now</p>
            <p className="text-xs text-gray-500 mt-1">Be the first to share your wedding ideas!</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 px-4 py-2 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy/90 transition-all"
            >
              Create Post
            </button>
          </div>
        )}
      </section>

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handlePostCreated}
      />
    </div>
  );
}
