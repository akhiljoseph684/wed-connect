import { useState, useEffect } from 'react';
import { Image, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import businessService from '../../services/business.service.js';
import Modal from '../../components/common/Modal.jsx';

export default function VendorPortfolioPage() {
  const [business, setBusiness] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await businessService.getMyBusiness();
      const b = res.data?.business || res.data;
      setBusiness(b);
      setPortfolio(b?.portfolio || []);
    } catch (err) {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim() || !business?._id) return;
    setSubmitting(true);
    try {
      await businessService.addPortfolio(business._id, {
        url: imageUrl.trim(),
        title: title.trim(),
      });
      toast.success('Photo added to portfolio!');
      setIsModalOpen(false);
      setImageUrl('');
      setTitle('');
      fetchPortfolio();
    } catch (err) {
      toast.error('Failed to add portfolio image');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <Image className="w-6 h-6 text-burgundy" /> Portfolio Gallery
          </h1>
          <p className="text-sm text-gray-500">Showcase your real wedding works and setups</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-white rounded-2xl animate-pulse shadow-soft" />
          ))}
        </div>
      ) : portfolio.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {portfolio.map((item, index) => (
            <div key={index} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-soft">
              <img src={item.imageUrl || item} alt={item.title || 'Work'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white text-xs font-semibold">{item.title || 'Wedding Photo'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No portfolio photos yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Upload high quality pictures of your wedding services to attract discerning couples.
          </p>
        </div>
      )}

      {/* Add Photo Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Portfolio Photo">
        <form onSubmit={handleAddPhoto} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Title / Caption (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Sunset Ceremony in Big Sur"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
          </div>

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
              disabled={submitting || !imageUrl.trim()}
              className="px-5 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Photo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
