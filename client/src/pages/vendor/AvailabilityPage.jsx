import { useState, useEffect } from 'react';
import { CalendarCheck2, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import businessService from '../../services/business.service.js';
import ConfirmationDialog from '../../components/common/ConfirmationDialog.jsx';

export default function AvailabilityPage() {
  const [business, setBusiness] = useState(null);
  const [entries, setEntries] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newStatus, setNewStatus] = useState('booked');
  const [newNotes, setNewNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await businessService.getMyBusiness();
      const b = res.data;
      setBusiness(b);
      const avail = b?.availability || {};
      setBlockedDates(avail.blockedDates || []);
      setEntries(avail.entries || []);
    } catch (err) {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    if (!newDate || !business?._id) return;

    setSaving(true);
    try {
      const res = await businessService.addAvailabilityEntry(business._id, {
        date: newDate,
        status: newStatus,
        notes: newNotes,
      });

      const updatedAvail = res.data?.data || res.data || {};
      setEntries(updatedAvail.entries || []);
      setBlockedDates(updatedAvail.blockedDates || []);
      setNewDate('');
      setNewNotes('');
      toast.success('Availability entry saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !business?._id) return;
    setDeleting(true);
    try {
      const res = await businessService.deleteAvailabilityEntry(business._id, deleteTarget);
      const updatedAvail = res.data?.data || res.data || {};
      setEntries(updatedAvail.entries || []);
      setBlockedDates(updatedAvail.blockedDates || []);
      toast.success('Date removed from calendar');
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Failed to remove availability record');
    } finally {
      setDeleting(false);
    }
  };

  // Combine entries and blockedDates so neither is lost
  const allDisplayItems = (() => {
    const map = new Map();
    // first entries
    entries.forEach((e) => map.set(e.date, e));
    // then any legacy blockedDates
    blockedDates.forEach((d) => {
      if (!map.has(d)) {
        map.set(d, { date: d, status: 'booked', notes: 'Unavailable' });
      }
    });
    return Array.from(map.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  })();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <CalendarCheck2 className="w-6 h-6 text-burgundy" /> Calendar & Availability
        </h1>
        <p className="text-sm text-gray-500">
          Manage your booked dates and schedule so couples know when you are available
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-6">
        <form onSubmit={handleAddAvailability} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
              >
                <option value="booked">Booked (Unavailable)</option>
                <option value="tentative">Tentative / Reserved</option>
                <option value="unavailable">Blocked / Off Day</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Smith Wedding"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !newDate}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-semibold hover:bg-burgundy/90 disabled:opacity-50 transition-all shadow-soft"
            >
              <Plus className="w-4 h-4" /> Save Availability
            </button>
          </div>
        </form>

        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Scheduled Dates ({allDisplayItems.length})
          </h3>

          {loading ? (
            <div className="py-8 text-center text-sm text-gray-400">Loading schedule...</div>
          ) : allDisplayItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allDisplayItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-burgundy/10 text-burgundy flex items-center justify-center font-mono text-xs">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal font-mono">{item.date}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'booked'
                              ? 'bg-rose-100 text-rose-800'
                              : item.status === 'tentative'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {item.status || 'booked'}
                        </span>
                        {item.notes && <span className="text-xs text-gray-500 truncate max-w-[120px]">{item.notes}</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(item._id || item.date)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Remove date"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400 text-sm">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No blocked or booked dates added yet. Your calendar is completely open.
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Remove Date from Schedule?"
        description="Are you sure you want to remove this date from your blocked schedule? Couples will see you as available on this day."
        confirmText="Remove Date"
        isLoading={deleting}
      />
    </div>
  );
}
