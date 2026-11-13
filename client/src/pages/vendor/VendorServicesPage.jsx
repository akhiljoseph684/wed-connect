import { useState, useEffect } from 'react';
import { PackageCheck, Plus, Trash2, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import businessService from '../../services/business.service.js';
import Modal from '../../components/common/Modal.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function VendorServicesPage() {
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('Full Day');
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const bRes = await businessService.getMyBusiness();
      const b = bRes.data || bRes.data;
      setBusiness(b);
      if (b?._id) {
        const sRes = await businessService.getServices(b._id);
        setServices(sRes.data || b.services || []);
      }
    } catch (err) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !business?._id) return;
    setSubmitting(true);
    try {
      await businessService.createService(business._id, {
        name: title.trim(),
        title: title.trim(),
        description: description.trim(),
        price: Number(price) || 0,
        duration,
      });
      toast.success('Package added successfully!');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setPrice('');
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add package');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (serviceId) => {
    try {
      await businessService.deleteService(serviceId);
      setServices(prev => prev.filter(s => s._id !== serviceId));
      toast.success('Package deleted');
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-burgundy" /> Services & Packages
          </h1>
          <p className="text-sm text-gray-500">List pricing tiers and packages available for couples to book</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-56 bg-white rounded-2xl animate-pulse shadow-soft" />)}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map(pkg => (
            <div key={pkg._id} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gold/15 text-charcoal">
                  {pkg.duration || 'Package'}
                </span>
                <h3 className="font-playfair font-bold text-lg text-charcoal mt-2">{pkg.name || pkg.title}</h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3">{pkg.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block">Starting at</span>
                  <span className="text-lg font-bold text-charcoal">{formatCurrency(pkg.price || 0)}</span>
                </div>
                <button
                  onClick={() => handleDelete(pkg._id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                  title="Delete package"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <PackageCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No packages listed yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Create packages like "Full Day Coverage", "Elopement Special", or "Coordination Only".
          </p>
        </div>
      )}

      {/* Add Package Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Service Package">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Package Name</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Classic Wedding Photography"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Price ($)</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="2500"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Duration / Scope</label>
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="e.g. 8 Hours"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">What's Included</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="List inclusions (e.g. 2 photographers, online gallery, high res downloads)..."
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
              disabled={submitting || !title.trim()}
              className="px-5 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Package'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
