import { useState, useEffect } from 'react';
import { CalendarCheck2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import businessService from '../../services/business.service.js';

export default function AvailabilityPage() {
  const [business, setBusiness] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const res = await businessService.getMyBusiness();
        const b = res.data;
        console.log(res)
        setBusiness(b);
        setBlockedDates(b?.availability?.blockedDates || []);
      } catch (err) {
        toast.error('Failed to load availability');
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!newDate || !business?._id) return;
    if (blockedDates.includes(newDate)) {
      toast.error('Date already marked as unavailable');
      return;
    }
    const updated = [...blockedDates, newDate];
    setSaving(true);
    try {
      await businessService.updateAvailability(business._id, { blockedDates: updated });
      setBlockedDates(updated);
      setNewDate('');
      toast.success('Date marked unavailable');
    } catch (err) {
      toast.error('Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBlockedDate = async (dateToRemove) => {
    if (!business?._id) return;
    const updated = blockedDates.filter(d => d !== dateToRemove);
    try {
      await businessService.updateAvailability(business._id, { blockedDates: updated });
      setBlockedDates(updated);
      toast.success('Date made available');
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <CalendarCheck2 className="w-6 h-6 text-burgundy" /> Calendar & Availability
        </h1>
        <p className="text-sm text-gray-500">Block booked or unavailable dates so couples know your schedule</p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-6">
        <form onSubmit={handleAddBlockedDate} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-charcoal mb-1">Block a Date (Fully Booked)</label>
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !newDate}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50 transition-all shadow-soft shrink-0"
          >
            <Plus className="w-4 h-4" /> Block Date
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Currently Blocked Dates ({blockedDates.length})
          </h3>
          {blockedDates.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {blockedDates.map((dateStr, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-medium text-charcoal">{new Date(dateStr).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleRemoveBlockedDate(dateStr)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-4">No dates currently blocked. Your calendar is wide open!</p>
          )}
        </div>
      </div>
    </div>
  );
}
