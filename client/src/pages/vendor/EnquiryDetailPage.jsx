import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, CheckCircle, XCircle, Mail, Phone, Calendar, Users, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import enquiryService from '../../services/enquiry.service.js';
import messageService from '../../services/message.service.js';

export default function EnquiryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchEnquiry = async () => {
      setLoading(true);
      try {
        const res = await enquiryService.getEnquiryById(id);
        setEnquiry(res.data?.enquiry || res.data);
      } catch (err) {
        toast.error('Failed to load enquiry details');
        navigate('/vendor/enquiries');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEnquiry();
  }, [id, navigate]);

  const updateStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      await enquiryService.updateStatus(id, newStatus);
      setEnquiry((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Enquiry marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const startChat = async () => {
    if (enquiry?.conversationId) {
      const convId = typeof enquiry.conversationId === 'object' ? enquiry.conversationId._id : enquiry.conversationId;
      navigate(`/messages/${convId}`);
      return;
    }

    const clientUserId = enquiry?.userId?._id || enquiry?.userId;
    if (!clientUserId) {
      toast.error('Client contact information unavailable');
      return;
    }

    try {
      const res = await messageService.startConversation(clientUserId);
      const convId = res.data?.conversation?._id || res.data?._id;
      if (convId) navigate(`/messages/${convId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open message conversation');
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto h-64 bg-white rounded-2xl animate-pulse shadow-soft" />;
  }

  const isResolved = ['confirmed', 'booked', 'declined'].includes(enquiry?.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/vendor/enquiries')}
          className="p-2 border border-sand rounded-xl hover:bg-sand/30 text-charcoal transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal">Enquiry Details</h1>
          <p className="text-xs text-mutedGray">
            From {enquiry?.coupleNames || enquiry?.coupleName || 'Couple'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-sand/60 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand/40">
          <div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-semibold border ${
                ['confirmed', 'booked'].includes(enquiry?.status)
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : enquiry?.status === 'declined'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {enquiry?.status || 'new'}
            </span>
            <h2 className="font-playfair text-xl font-bold text-charcoal mt-1">
              {enquiry?.coupleNames || enquiry?.coupleName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Hide Accept / Decline buttons once resolved */}
            {!isResolved && (
              <>
                <button
                  onClick={() => updateStatus('confirmed')}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shadow-soft disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Accept
                </button>
                <button
                  onClick={() => updateStatus('declined')}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-sand text-charcoal rounded-xl text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" /> Decline
                </button>
              </>
            )}

            <button
              onClick={startChat}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-burgundy text-white rounded-xl text-xs font-semibold hover:bg-burgundy/90 transition shadow-soft"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Message
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-sand/15 p-3 rounded-xl border border-sand/40">
            <span className="text-mutedGray block text-[11px] uppercase tracking-wider">Wedding Date</span>
            <span className="font-semibold text-charcoal text-sm mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-burgundy" />
              {enquiry?.weddingDate ? new Date(enquiry.weddingDate).toLocaleDateString() : 'TBD'}
            </span>
          </div>

          <div className="bg-sand/15 p-3 rounded-xl border border-sand/40">
            <span className="text-mutedGray block text-[11px] uppercase tracking-wider">Estimated Guests</span>
            <span className="font-semibold text-charcoal text-sm mt-0.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-burgundy" />
              {enquiry?.guestCount ? `${enquiry.guestCount} guests` : 'Not specified'}
            </span>
          </div>

          <div className="bg-sand/15 p-3 rounded-xl border border-sand/40">
            <span className="text-mutedGray block text-[11px] uppercase tracking-wider">Budget Target</span>
            <span className="font-semibold text-charcoal text-sm mt-0.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              {enquiry?.estimatedBudget ? `$${enquiry.estimatedBudget.toLocaleString()}` : 'Flexible'}
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-sand/15 p-4 rounded-xl border border-sand/40 space-y-2 text-xs">
          <span className="font-semibold text-charcoal uppercase tracking-wider text-[11px] block">
            Client Contact Details
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-charcoal/80">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-burgundy" />
              <span>{enquiry?.contactEmail || enquiry?.userId?.email}</span>
            </div>
            {enquiry?.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-burgundy" />
                <span>{enquiry.contactPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Message Body */}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
            Client Message
          </span>
          <div className="p-4 bg-sand/10 rounded-xl text-sm text-charcoal leading-relaxed whitespace-pre-wrap border border-sand/40">
            {enquiry?.message || 'No additional details provided.'}
          </div>
        </div>
      </div>
    </div>
  );
}
