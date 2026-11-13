import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Calendar, MessageSquare, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import enquiryService from '../../services/enquiry.service.js';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function VendorEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiries = async () => {
      setLoading(true);
      try {
        const res = await enquiryService.getReceivedEnquiries();
        setEnquiries(res.data || []);
      } catch (err) {
        toast.error('Failed to load enquiries');
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Inbox className="w-6 h-6 text-burgundy" /> Client Inquiries
        </h1>
        <p className="text-sm text-gray-500">Manage booking requests and questions from couples</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse shadow-soft" />)}
        </div>
      ) : enquiries.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {enquiries.map(enq => (
            <Link
              key={enq._id}
              to={`/vendor/enquiries/${enq._id}`}
              className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors block group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-charcoal text-base">
                    {enq.coupleName || enq.sender?.firstName || 'Couple Inquiry'}
                  </h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-semibold ${
                    enq.status === 'confirmed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : enq.status === 'declined'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {enq.status || 'Pending'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-burgundy" />
                    {enq.weddingDate ? new Date(enq.weddingDate).toLocaleDateString() : 'Date TBD'}
                  </span>
                  <span>{formatRelativeTime(enq.createdAt)}</span>
                </div>
                {enq.message && <p className="text-xs text-gray-500 line-clamp-1 mt-1">{enq.message}</p>}
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-burgundy group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No client inquiries yet</h3>
          <p className="text-sm text-gray-500 mt-1">Inquiries sent by couples through your storefront will show up here.</p>
        </div>
      )}
    </div>
  );
}
