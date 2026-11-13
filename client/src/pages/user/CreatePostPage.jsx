import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import postService from '../../services/post.service.js';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      await postService.createPost({
        content: content.trim(),
        media: imageUrl.trim() ? [{ url: imageUrl.trim(), type: 'image' }] : [],
        tags: tagList,
      });
      toast.success('Inspiration published!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-charcoal"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal">Share Wedding Inspiration</h1>
          <p className="text-xs text-gray-500">Inspire couples planning their special day</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Caption / Story</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            required
            placeholder="Share details about the decor, aesthetic, venue, or styling..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Image URL</label>
          <div className="relative">
            <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
          {imageUrl && (
            <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-gray-100 max-h-48 border border-gray-100">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Tags (Comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="boho, rustic, outdoor, floral, summer"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-gray-200 text-charcoal rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50 shadow-soft"
          >
            <Sparkles className="w-4 h-4" />
            {submitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}
