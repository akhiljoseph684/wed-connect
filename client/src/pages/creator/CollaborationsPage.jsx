import { useState, useEffect } from 'react';
import { HeartHandshake, Plus, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import creatorService from '../../services/creator.service.js';
import Modal from '../../components/common/Modal.jsx';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function CollaborationsPage() {
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [vendorName, setVendorName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [proposal, setProposal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCollabs = async () => {
    setLoading(true);
    try {
      const res = await creatorService.getCollaborations();
      console.log(res)
      setCollabs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollabs();
  }, []);

  const handlePropose = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;
    setSubmitting(true);
    try {
      await creatorService.createCollaboration({
        vendorName: vendorName.trim(),
        projectTitle: projectTitle.trim(),
        proposal: proposal.trim(),
      });
      toast.success('Collaboration request logged!');
      setIsModalOpen(false);
      setVendorName('');
      setProjectTitle('');
      setProposal('');
      fetchCollabs();
    } catch (err) {
      toast.error('Failed to create collaboration request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-burgundy" /> Collaborations & Partnerships
          </h1>
          <p className="text-sm text-gray-500">Co-styled shoots, brand sponsorships, and vendor features</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Propose Collaboration
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse shadow-soft" />)}
        </div>
      ) : collabs.length > 0 ? (
        <div className="space-y-4">
          {collabs.map(col => (
            <div key={col._id || Math.random()} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-semibold ${
                  col.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {col.status || 'Pending'}
                </span>
                <h3 className="font-playfair font-bold text-lg text-charcoal mt-1">
                  {col.projectTitle || col.title || 'Styled Editorial Shoot'}
                </h3>
                <p className="text-xs text-gray-500">Partner: {col.vendorName || col.partner || 'Premier Venue'}</p>
                {col.proposal && <p className="text-xs text-gray-600 mt-2 line-clamp-2">{col.proposal}</p>}
              </div>
              <span className="text-[11px] text-gray-400 shrink-0">{formatRelativeTime(col.createdAt)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <HeartHandshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No collaborations yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Partner with floral artists, venues, and gown designers for creative projects.
          </p>
        </div>
      )}

      {/* Propose Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Propose Collaboration">
        <form onSubmit={handlePropose} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Project Title</label>
            <input
              type="text"
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
              placeholder="e.g. Autumn Vintage Editorial Shoot"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Vendor / Brand Name</label>
            <input
              type="text"
              value={vendorName}
              onChange={e => setVendorName(e.target.value)}
              placeholder="e.g. Bella Rosa Florals"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Concept Proposal</label>
            <textarea
              value={proposal}
              onChange={e => setProposal(e.target.value)}
              rows={3}
              placeholder="Describe the aesthetic, moodboard theme, deliverables, and timeline..."
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
              disabled={submitting || !projectTitle.trim()}
              className="px-5 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
