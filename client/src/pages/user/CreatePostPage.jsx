import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Sparkles, UploadCloud, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import postService from '../../services/post.service.js';
import mediaService from '../../services/media.service.js';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [mediaList, setMediaList] = useState([]); // array of { url, mediaType, assetId }
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate size (< 10MB each)
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
      toast.error('Please enter a caption or story.');
      return;
    }
    if (mediaList.length === 0) {
      toast.error('Please upload at least one photo for your inspiration post.');
      return;
    }

    setSubmitting(true);
    try {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      await postService.createPost({
        title: title.trim(),
        content: content.trim(),
        media: mediaList,
        tags: tagList,
      });
      toast.success('Inspiration published to the WedConnect community!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to publish post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 border border-sand rounded-xl hover:bg-sand/30 transition text-charcoal"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal">Share Wedding Inspiration</h1>
          <p className="text-xs text-mutedGray">Inspire couples planning their luxury celebration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-sand/60 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
            Post Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Candlelit Glasshouse Reception in Hudson Valley"
            className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
            Caption / Story *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
            placeholder="Share details about the decor, aesthetic, color palette, venue, or styling..."
            className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
            Photos * (Upload high-resolution imagery)
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
            className="border-2 border-dashed border-sand hover:border-burgundy/60 rounded-2xl p-6 text-center cursor-pointer transition bg-sand/10 hover:bg-sand/20"
          >
            {isUploadingMedia ? (
              <div className="flex flex-col items-center justify-center gap-2 py-4 text-burgundy">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-medium">Uploading images to cloud...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <div className="w-12 h-12 rounded-full bg-blush flex items-center justify-center text-burgundy">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-burgundy">Click to select photos</span>
                  <span className="text-xs text-mutedGray block mt-0.5">PNG, JPG, WEBP up to 10MB each</span>
                </div>
              </div>
            )}
          </div>

          {/* Media preview list */}
          {mediaList.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {mediaList.map((item, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-sand bg-sand/20">
                  <img src={item.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-charcoal/80 text-white rounded-full hover:bg-burgundy transition shadow opacity-90 group-hover:opacity-100"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-burgundy/90 text-white px-2 py-0.5 rounded shadow">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
            Tags (Comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="boho, rustic, outdoor, floral, summer, reception"
            className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-sand/60">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-sand text-charcoal rounded-xl text-sm font-medium hover:bg-sand/30 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || isUploadingMedia}
            className="px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-semibold hover:bg-burgundy/90 transition shadow-soft flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Publish Inspiration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
