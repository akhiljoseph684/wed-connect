import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import businessService from '../../services/business.service.js';
import adminService from '../../services/admin.service.js';

export default function VerificationQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await businessService.getBusinesses();
      const businesses = res.data?.businesses || [];
      // Filter for pending or unverified
      setQueue(businesses.filter(b => b.verificationStatus === 'pending' || !b.verificationStatus || b.verificationStatus === 'unverified'));
    } catch (err) {
      toast.error('Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDecision = async (businessId, status) => {
    try {
      await adminService.updateVerification(businessId, { status });
      setQueue(prev => prev.filter(b => b._id !== businessId));
      toast.success(`Business verification ${status}`);
    } catch (err) {
      toast.error('Failed to update verification status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-burgundy" /> Business Verification Queue
        </h1>
        <p className="text-sm text-gray-500">Review vendor documentation and approve verified business badges</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse shadow-soft" />)}
        </div>
      ) : queue.length > 0 ? (
        <div className="space-y-4">
          {queue.map(b => (
            <div key={b._id} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-playfair font-bold text-lg text-charcoal">{b.name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold capitalize">
                    {b.verificationStatus || 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Category: <strong>{b.category?.name || 'Vendor'}</strong> • Location: <strong>{b.location?.city || 'Worldwide'}</strong>
                </p>
                {b.verification?.documentUrl && (
                  <a
                    href={b.verification.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-burgundy font-semibold hover:underline mt-2"
                  >
                    View Submitted Document <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDecision(b._id, 'approved')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all shadow-soft"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve Badge
                </button>
                <button
                  onClick={() => handleDecision(b._id, 'rejected')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">Queue is clear!</h3>
          <p className="text-sm text-gray-500 mt-1">No pending verification requests at this moment.</p>
        </div>
      )}
    </div>
  );
}
