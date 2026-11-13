import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import collectionService from '../../services/collection.service.js';
import PostCard from '../../components/cards/PostCard.jsx';

export default function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      try {
        const res = await collectionService.getCollectionById(id);
        const data = res.data?.collection || res.data;
        setCollection(data);
        setItems(data?.items || res.data?.items || []);
      } catch (err) {
        toast.error('Failed to load collection');
        navigate('/saved');
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    try {
      await collectionService.deleteCollection(id);
      toast.success('Collection deleted');
      navigate('/saved');
    } catch (err) {
      toast.error('Failed to delete collection');
    }
  };

  const handleRemoveItem = async (postId) => {
    try {
      await collectionService.removeItem(id, postId);
      setItems(prev => prev.filter(item => (item.post?._id || item.post || item._id) !== postId));
      toast.success('Item removed from collection');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white rounded-2xl shadow-soft" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] bg-white rounded-2xl shadow-soft" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/saved')}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-charcoal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-playfair text-2xl font-bold text-charcoal">{collection?.name}</h1>
              {collection?.isPrivate ? (
                <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" /> Private
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  <Globe className="w-3 h-3" /> Public
                </span>
              )}
            </div>
            {collection?.description && <p className="text-sm text-gray-500 mt-1">{collection.description}</p>}
            <p className="text-xs text-gray-400 mt-1">{items.length} items saved</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-4 py-2 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 transition-all self-start sm:self-center"
        >
          <Trash2 className="w-4 h-4" /> Delete Collection
        </button>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => {
            const postObj = item.postId || item;
            if (!postObj?._id) return null;
            return (
              <div key={postObj._id} className="relative group">
                <PostCard post={postObj} />
                <button
                  onClick={() => handleRemoveItem(postObj._id)}
                  className="absolute top-3 right-3 p-1.5 bg-charcoal/70 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                  title="Remove from collection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft">
          <p className="text-charcoal font-medium">This collection is empty</p>
          <p className="text-xs text-gray-500 mt-1">Explore inspirations and save them here!</p>
        </div>
      )}
    </div>
  );
}
