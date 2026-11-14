import { useState, useEffect } from 'react';
import { HeartHandshake, Plus, Mail, CheckCircle, XCircle, Clock, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import creatorService from '../../services/creator.service.js';
import Modal from '../../components/common/Modal.jsx';
import { formatRelativeTime } from '../../utils/formatters.js';
import { useSelector } from 'react-redux';

export default function CollaborationsPage() {
  const { user } = useSelector((state) => state.auth);
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [receiverEmail, setReceiverEmail] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [details, setDetails] = useState('');
  const [compensationType, setCompensationType] = useState('paid');
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchCollabs = async () => {
    setLoading(true);
    try {
      const res = await creatorService.getCollaborations();
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

  const handleUpdateStatus = async (collabId, newStatus) => {
    setProcessingId(collabId);
    try {
      const res = await creatorService.updateCollaborationStatus(collabId, newStatus);
      const updated = res.data;
      setCollabs((prev) =>
        prev.map((c) => (c._id === collabId ? { ...c, status: newStatus } : c))
      );
      toast.success(`Collaboration proposal marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update collaboration status');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'declined':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-burgundy" /> Collaborations & Partnerships
          </h1>
          <p className="text-sm text-gray-500">
            Co-styled editorial shoots, brand sponsorships, and creative features
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse shadow-soft" />
          ))}
        </div>
      ) : collabs.length > 0 ? (
        <div className="space-y-4">
          {collabs.map((col) => {
            const isReceiver =
              (col.receiverId?._id || col.receiverId)?.toString() === user?._id?.toString();
            const isRequester =
              (col.requesterId?._id || col.requesterId)?.toString() === user?._id?.toString();
            const partner = isReceiver ? col.requesterId : col.receiverId;
            const partnerName = partner
              ? `${partner.firstName || ''} ${partner.lastName || ''}`.trim() || partner.displayName
              : col.businessId?.name || 'Partner';

            return (
              <div
                key={col._id}
                className="bg-white rounded-2xl p-6 shadow-soft border border-sand/60 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-semibold border ${getStatusBadge(
                        col.status
                      )}`}
                    >
                      {col.status || 'pending'}
                    </span>
                    <span className="text-xs text-mutedGray uppercase tracking-wider">
                      {isReceiver ? 'Received Proposal' : 'Sent Proposal'}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {formatRelativeTime(col.createdAt)}
                    </span>
                  </div>

                  <h3 className="font-playfair font-bold text-lg text-charcoal">
                    {col.projectTitle}
                  </h3>

                  <p className="text-xs text-charcoal/70">
                    <span className="font-semibold text-charcoal">
                      {isReceiver ? 'From' : 'To'}:
                    </span>{' '}
                    {partnerName} {partner?.email && `(${partner.email})`}
                  </p>

                  {col.details && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed bg-sand/10 p-3 rounded-xl border border-sand/30">
                      {col.details}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  {col.status === 'pending' && isReceiver && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(col._id, 'accepted')}
                        disabled={processingId === col._id}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shadow-soft disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(col._id, 'declined')}
                        disabled={processingId === col._id}
                        className="flex items-center gap-1.5 px-3.5 py-2 border border-sand text-charcoal rounded-xl text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                    </>
                  )}

                  {col.status === 'pending' && isRequester && (
                    <button
                      onClick={() => handleUpdateStatus(col._id, 'cancelled')}
                      disabled={processingId === col._id}
                      className="px-3.5 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition disabled:opacity-50"
                    >
                      Cancel Request
                    </button>
                  )}

                  {col.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(col._id, 'completed')}
                      disabled={processingId === col._id}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-burgundy text-white rounded-xl text-xs font-semibold hover:bg-burgundy/90 transition shadow-soft disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                  )}

                  {col.status === 'completed' && (
                    <span className="flex items-center gap-1 text-xs text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                      <CheckCircle className="w-3.5 h-3.5" /> Project Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <HeartHandshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No collaborations yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Partner with floral artists, venues, and wedding planners for stylized shoots and creative features.
          </p>
        </div>
      )}
    </div>
  );
}
