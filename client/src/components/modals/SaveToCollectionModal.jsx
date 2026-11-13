import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import { collectionService } from '../../services/collection.service.js';
import { useSelector } from 'react-redux';
import { FolderPlus, Bookmark, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const SaveToCollectionModal = ({ isOpen, onClose, post }) => {
  const { user } = useSelector((state) => state.auth);
  const [collections, setCollections] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedCollectionIds, setSavedCollectionIds] = useState(new Set());

  useEffect(() => {
    if (isOpen && user) {
      collectionService.getMyCollections().then((res) => {
        setCollections(res.data || []);
      }).catch(() => {});
    }
  }, [isOpen, user]);

  const handleSaveToCollection = async (collectionId) => {
    if (!post) return;
    try {
      await collectionService.addItem(collectionId, post._id);
      setSavedCollectionIds((prev) => new Set([...prev, collectionId]));
      toast.success('Inspiration saved to your collection!');
    } catch (err) {
      toast.error('Failed to save to collection');
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsLoading(true);
      const res = await collectionService.createCollection({
        title: newTitle,
        isPrivate: false,
      });
      const created = res.data;
      setCollections([created, ...collections]);
      await handleSaveToCollection(created._id);
      setNewTitle('');
      setShowCreateInput(false);
    } catch (err) {
      toast.error('Failed to create collection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Inspiration"
      description="Organize your wedding vision boards and creative collections."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Existing Collections List */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {collections.length === 0 && !showCreateInput && (
            <p className="text-xs text-mutedGray text-center py-4">
              You do not have any collections yet. Create your first board below!
            </p>
          )}

          {collections.map((coll) => {
            const isSaved = savedCollectionIds.has(coll._id);
            return (
              <div
                key={coll._id}
                className="flex items-center justify-between p-3 rounded-xl border border-ivory-300 hover:border-gold/40 hover:bg-ivory-50 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blush flex items-center justify-center text-burgundy shrink-0">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-charcoal truncate">{coll.title}</p>
                    <p className="text-[11px] text-mutedGray">{coll.itemsCount || 0} items</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isSaved ? 'soft' : 'outline'}
                  onClick={() => handleSaveToCollection(coll._id)}
                  disabled={isSaved}
                >
                  {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : 'Save'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Create new collection section */}
        {showCreateInput ? (
          <form onSubmit={handleCreateCollection} className="space-y-3 pt-3 border-t border-charcoal/5">
            <Input
              label="Collection Name"
              placeholder="e.g. Bridal Bouquets & Ceremony Arches"
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowCreateInput(false)} type="button">
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" isLoading={isLoading}>
                Create & Save
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowCreateInput(true)}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-burgundy/30 text-burgundy text-xs font-semibold hover:bg-rose-50 flex items-center justify-center gap-2 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            Create New Collection
          </button>
        )}
      </div>
    </Modal>
  );
};

export default SaveToCollectionModal;
