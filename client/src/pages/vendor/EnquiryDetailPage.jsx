import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, CheckCircle, XCircle, Mail, Phone, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import enquiryService from '../../services/enquiry.service.js';
import messageService from '../../services/message.service.js';

export default function EnquiryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const updateStatus = async (status) => {
    try {
      await enquiryService.updateStatus(id, status);
      setEnquiry(prev => ({ ...prev, status }));
      toast.success(`Enquiry marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const startChat = async () => {
    const senderId = enquiry?.sender?._id || enquiry?.sender;
    if (!senderId) return;
    try {
      const res = await messageService.startConversation(senderId);
      const convId = res.data?.conversation?._id || res.data?._id;
      if (convId) navigate(`/messages/${convId}`);
    } catch (err) {
      toast.error('Failed to start chat');
    }
  };

  if (loading) {
    return <div className="h-64 bg-white rounded-2xl animate-pulse shadow-soft" />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/vendor/enquiries')}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-charcoal transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal">Enquiry Details</h1>
          <p className="text-xs text-gray-500">From {enquiry?.coupleName || enquiry?.sender?.firstName || 'Client'}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-semibold ${
              enquiry?.status === 'confirmed'
                ? 'bg-emerald-50 text-emerald-700'
                : enquiry?.status === 'declined'
                ? 'bg-red-50 text-red-600'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {enquiry?.status || 'Pending'}
            </span>
            <h2 className="font-playfair text-xl font-bold text-charcoal mt-1">
              {enquiry?.coupleName || `${enquiry?.sender?.firstName} ${enquiry?.sender?.lastName}`}
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => updateStatus('confirmed')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all shadow-soft"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Accept
            </button>
            <button
              onClick={() => updateStatus('declined')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" /> Decline
            </button>
            <button
              onClick={startChat}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-burgundy text-white rounded-xl text-xs font-semibold hover:bg-burgundy/90 transition-all shadow-soft"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Message
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <span className="block text-gray-400">Wedding Date</span>
            <span className="font-medium text-charcoal text-sm mt-0.5 block">
              {enquiry?.weddingDate ? new Date(enquiry.weddingDate).toLocaleDateString() : 'TBD'}
            </span>
          </div>
          <div>
            <span className="block text-gray-400">Guest Count</span>
            <span className="font-medium text-charcoal text-sm mt-0.5 block">
              {enquiry?.guestCount ? `${enquiry.guestCount} guests` : 'Not specified'}
            </span>
          </div>
        </div>

        <div>
          <span className="block text-xs text-gray-400 mb-1">Client Message</span>
          <div className="p-4 bg-gray-50 rounded-xl text-sm text-charcoal whitespace-pre-wrap">
            {enquiry?.message || 'No additional message provided.'}
          </div>
        </div>
      </div>
    </div>
  );
}
