import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Users, Plus, Trash2, Mail, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import guestService from '../../services/guest.service.js';
import CreateGuestModal from '../../components/modals/CreateGuestModal.jsx';

const RSVP_OPTIONS = ['all', 'attending', 'declined', 'pending'];

export default function GuestsPage() {
  const { planId } = useParams();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRsvp, setFilterRsvp] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate()

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await guestService.getGuests(planId);
      setGuests(res.data || []);
    } catch (err) {
      navigate("/my-wedding/new");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) fetchGuests();
  }, [planId]);

  const handleUpdateRsvp = async (guestId, newStatus) => {
    try {
      await guestService.updateRsvp(guestId, newStatus);
      setGuests(prev => prev.map(g => g._id === guestId ? { ...g, rsvpStatus: newStatus } : g));
      toast.success('RSVP updated');
    } catch (err) {
      toast.error('Failed to update RSVP');
    }
  };

  const handleDelete = async (guestId) => {
    try {
      await guestService.deleteGuest(guestId);
      setGuests(prev => prev.filter(g => g._id !== guestId));
      toast.success('Guest removed');
    } catch (err) {
      toast.error('Failed to delete guest');
    }
  };

  const filtered = guests.filter(g => {
    if (filterRsvp === 'all') return true;
    return g.rsvpStatus === filterRsvp;
  });

  const attendingCount = guests.filter(g => g.rsvpStatus === 'attending').length;
  const declinedCount = guests.filter(g => g.rsvpStatus === 'declined').length;
  const pendingCount = guests.filter(g => g.rsvpStatus === 'pending' || !g.rsvpStatus).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <Users className="w-6 h-6 text-burgundy" /> Guest List & RSVP Tracker
          </h1>
          <p className="text-sm text-gray-500">
            {attendingCount} attending • {declinedCount} declined • {pendingCount} pending
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Guest
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {RSVP_OPTIONS.map(opt => (
          <button
            key={opt}
            onClick={() => setFilterRsvp(opt)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              filterRsvp === opt
                ? 'bg-burgundy text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-burgundy'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Guests Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse shadow-soft" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Guest Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Group / Side</th>
                  <th className="p-4">RSVP Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(guest => (
                  <tr key={guest._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-charcoal">{guest.firstName} {guest.lastName}</p>
                      {guest.plusOne?.allowed && (
                        <span className="text-[11px] text-gray-400">+1 Allowed</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-500 space-y-0.5">
                      {guest.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {guest.email}</div>}
                      {guest.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {guest.phone}</div>}
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                        {guest.group || 'Guest'}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={guest.rsvpStatus || 'pending'}
                        onChange={e => handleUpdateRsvp(guest._id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none capitalize ${
                          guest.rsvpStatus === 'attending'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : guest.rsvpStatus === 'declined'
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-gold/15 text-charcoal border-gold/30'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="attending">Attending</option>
                        <option value="declined">Declined</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(guest._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Delete guest"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No guests found</h3>
          <p className="text-sm text-gray-500 mt-1">Start building your wedding guest list and track RSVPs easily!</p>
        </div>
      )}

      <CreateGuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planId={planId}
        onCreated={() => fetchGuests()}
      />
    </div>
  );
}
