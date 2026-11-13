import { useState, useEffect } from 'react';
import { Bookmark, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import collectionService from '../../services/collection.service.js';
import CollectionCard from '../../components/cards/CollectionCard.jsx';
import Modal from '../../components/common/Modal.jsx';

export default function SavedCollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await collectionService.getMyCollections();
      console.log(res)
      setCollections(res.data || []);
    } catch (err) {
      console.error('Failed to load collections', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      const res = await collectionService.createCollection({
        title: newTitle.trim(),
        description: newDesc.trim(),
        isPrivate,
      });
      toast.success('Collection created!');
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setIsPrivate(false);
      if (res.data?.collection) {
        setCollections(prev => [res.data.collection, ...prev]);
      } else {
        fetchCollections();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create collection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-burgundy" /> Saved Collections
          </h1>
          <p className="text-sm text-gray-500">Organize your wedding ideas into customized moodboards</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft"
        >
          <Plus className="w-4 h-4" /> New Collection
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-white rounded-2xl animate-pulse shadow-soft" />
          ))}
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {collections.map(col => (
            <CollectionCard key={col._id} collection={col} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No collections yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Create moodboards like "Floral Inspirations", "Dream Gowns", or "Table Decors".
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all"
          >
            Create Your First Collection
          </button>
        </div>
      )}

      {/* Create Collection Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Collection">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Collection Name</label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Boho Ceremony Ideas"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Description (Optional)</label>
            <textarea
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              rows={3}
              placeholder="What kind of ideas belong in this collection?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded text-burgundy focus:ring-burgundy/30"
            />
            <span className="text-xs text-charcoal">Make this collection private (only you can see it)</span>
          </label>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-200 text-charcoal rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !newTitle.trim()}
              className="px-5 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
