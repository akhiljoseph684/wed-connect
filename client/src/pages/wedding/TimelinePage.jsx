import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Plus, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import weddingPlanService from '../../services/weddingPlan.service.js';
import Modal from '../../components/common/Modal.jsx';

export default function TimelinePage() {
  const { planId } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [time, setTime] = useState('14:00');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await weddingPlanService.getPlanDetails(planId);
      const plan = res.data?.plan || res.data;
      setTimeline(plan?.timelineEvents || []);
    } catch (err) {
      navigate("/my-wedding/new")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) fetchTimeline();
  }, [planId]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!title.trim() || !time) return;
    setSubmitting(true);
    try {
      await weddingPlanService.addTimelineEvent(planId, {
        time,
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
      });
      toast.success('Timeline event added!');
      setIsModalOpen(false);
      setTitle('');
      setLocation('');
      setDescription('');
      fetchTimeline();
    } catch (err) {
      toast.error(err.message || 'Failed to add event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (index) => {
    try {
      await weddingPlanService.deleteTimelineEvent(planId, index);
      setTimeline(prev => prev.filter((_, i) => i !== index));
      toast.success('Event removed');
    } catch (err) {
      toast.error('Failed to remove event');
    }
  };

  const sorted = [...timeline].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <Clock className="w-6 h-6 text-burgundy" /> Day-Of Wedding Timeline
          </h1>
          <p className="text-sm text-gray-500">Plan and share the hour-by-hour schedule of your special day</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse shadow-soft" />)}
        </div>
      ) : sorted.length > 0 ? (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-rose/20">
          {sorted.map((item, index) => (
            <div key={index} className="relative bg-white rounded-2xl p-5 shadow-soft border border-gray-100 flex items-start justify-between gap-4">
              <span className="absolute -left-6 top-6 w-3 h-3 rounded-full bg-burgundy ring-4 ring-rose/20" />
              <div className="space-y-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-gold/15 text-charcoal">
                  {item.time}
                </span>
                <h3 className="font-playfair font-bold text-base text-charcoal">{item.title}</h3>
                {item.location && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-burgundy" /> {item.location}
                  </p>
                )}
                {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
              </div>
              <button
                onClick={() => handleDelete(index)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No timeline events scheduled</h3>
          <p className="text-sm text-gray-500 mt-1">Add events like First Look, Ceremony, Cocktail Hour, Dinner & First Dance!</p>
        </div>
      )}

      {/* Add Event Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Schedule Event">
        <form onSubmit={handleAddEvent} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Ceremony Begins"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Location / Space</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Garden Pavilion"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Notes / Instructions</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="e.g. Photographer takes family photos directly after"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
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
              {submitting ? 'Adding...' : 'Add Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
