import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import { postService } from '../../services/post.service.js';
import { categoryService } from '../../services/category.service.js';
import toast from 'react-hot-toast';
import { ImagePlus } from 'lucide-react';

export const CreatePostModal = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      categoryService.getCategories().then((res) => setCategories(res.data || [])).catch(() => {});
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please enter a caption or description');
      return;
    }

    try {
      setIsLoading(true);
      const postData = {
        title,
        content,
        media: mediaUrl ? [{ url: mediaUrl, mediaType: 'image' }] : [
          { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80', mediaType: 'image' }
        ],
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
      setMediaUrl('');
      setTags('');
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

        <Input
          label="Image URL"
          placeholder="https://images.unsplash.com/..."
          leftIcon={<ImagePlus className="w-4 h-4 text-mutedGray" />}
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          helperText="Paste any image URL or leave blank for curated wedding photography."
        />

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
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Tags (Comma separated)"
            placeholder="tuscany, veil, outdoor, roses"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/5">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Publish Inspiration
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
