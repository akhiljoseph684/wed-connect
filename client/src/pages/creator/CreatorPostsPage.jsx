import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FileText, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '../../services/user.service.js';
import postService from '../../services/post.service.js';
import PostCard from '../../components/cards/PostCard.jsx';

export default function CreatorPostsPage() {
  const { user } = useSelector(state => state.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await userService.getUserPosts(user._id);
      setPosts(res.data?.posts || []);
    } catch (err) {
      toast.error('Failed to load published posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user?._id]);

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await postService.deletePost(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <FileText className="w-6 h-6 text-burgundy" /> Published Posts ({posts.length})
          </h1>
          <p className="text-sm text-gray-500">Inspirations published on WedConnect feeds</p>
        </div>
        <Link
          to="/create-post"
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Post
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] bg-white rounded-2xl animate-pulse shadow-soft" />)}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map(p => (
            <div key={p._id} className="relative group">
              <PostCard post={p} />
              <button
                onClick={() => handleDelete(p._id)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                title="Delete post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No posts published yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Share wedding trends, color palettes, and styling tips with the community!
          </p>
        </div>
      )}
    </div>
  );
}
