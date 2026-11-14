import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import { postService } from '../../services/post.service.js';
import { categoryService } from '../../services/category.service.js';
import mediaService from '../../services/media.service.js';
import toast from 'react-hot-toast';
import { ImagePlus, UploadCloud, X, Loader2, Sparkles } from 'lucide-react';

export const CreatePostModal = ({ isOpen, onClose, onCreated }) => {
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      categoryService.getCategories().then((res) => setCategories(res.data || [])).catch(() => {});
    }
  }, [isOpen]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 10MB limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploadingMedia(true);
    try {
      const res = await mediaService.uploadMultiple(validFiles);
      const uploadedAssets = Array.isArray(res) ? res : [res];
      const newMedia = uploadedAssets.map((asset) => ({
        url: asset.url,
        mediaType: asset.mediaType || 'image',
        assetId: asset.assetId,
      }));
      setMediaList((prev) => [...prev, ...newMedia]);
      toast.success(`${validFiles.length} photo${validFiles.length > 1 ? 's' : ''} uploaded`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload photo(s).');
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = (indexToRemove) => {
    setMediaList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please enter a caption or description');
      return;
    }
    if (mediaList.length === 0) {
      toast.error('Please upload at least one photo for your post.');
      return;
    }

    try {
      setIsLoading(true);
      const postData = {
        title: title.trim(),
        content: content.trim(),
        media: mediaList,
        categoryId: categoryId || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const res = await postService.createPost(postData);
      toast.success('Inspiration published to the WedConnect community!');
      if (onCreated) onCreated(res.data);
      onClose();
      // Reset
      setTitle('');
      setContent('');
      setMediaList([]);
      setTags('');
      setCategoryId('');
    } catch (err) {
      toast.error(err.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Wedding Inspiration" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title (Optional)"
          placeholder="e.g. Candlelit Glasshouse Reception in Hudson Valley"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
            Caption & Story *
          </label>
          <textarea
            required
            rows={4}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal placeholder:text-mutedGray/60 focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15 resize-none"
            placeholder="Share the details, styling tips, color palette, or vendors behind this look..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
            Photos * (Upload high-res imagery)
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-sand hover:border-burgundy/60 rounded-xl p-5 text-center cursor-pointer transition bg-sand/10 hover:bg-sand/20"
          >
            {isUploadingMedia ? (
              <div className="flex flex-col items-center justify-center gap-2 py-3 text-burgundy">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-medium">Uploading images...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-burgundy">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-burgundy">Click to select photos</span>
                  <span className="text-[11px] text-mutedGray block">PNG, JPG up to 10MB each</span>
                </div>
              </div>
            )}
          </div>

          {/* Media preview list */}
          {mediaList.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5 mt-3">
              {mediaList.map((item, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-sand bg-sand/20">
                  <img src={item.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-charcoal/80 text-white rounded-full hover:bg-burgundy transition shadow opacity-90 group-hover:opacity-100"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 text-[9px] font-semibold bg-burgundy/90 text-white px-1.5 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
              Category
            </label>
            <select
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Tags (Comma-separated)"
            placeholder="boho, rustic, summer"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-charcoal/10">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading || isUploadingMedia}
            disabled={isLoading || isUploadingMedia}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Publish Inspiration
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
