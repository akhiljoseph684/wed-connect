import { useState, useEffect } from 'react';
import { ShieldCheck, UploadCloud, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import businessService from '../../services/business.service.js';

export default function VerificationPage() {
  const [business, setBusiness] = useState(null);
  const [docUrl, setDocUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const res = await businessService.getMyBusiness();
        setBusiness(res.data?.business || res.data);
      } catch (err) {
        toast.error('Failed to load verification status');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!business?._id || !docUrl.trim()) return;
    setSubmitting(true);
    try {
      await businessService.submitVerification(business._id, {
        documentUrl: docUrl.trim(),
        notes: notes.trim(),
      });
      toast.success('Verification submitted for review!');
      setBusiness(prev => ({ ...prev, verificationStatus: 'pending' }));
    } catch (err) {
      toast.error('Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  const status = business?.verificationStatus || 'unverified';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-burgundy" /> Business Verification
        </h1>
        <p className="text-sm text-gray-500">Get a Verified Badge on WedConnect to boost client confidence</p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
          {status === 'approved' ? (
            <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
          ) : status === 'pending' ? (
            <Clock className="w-8 h-8 text-amber-500 shrink-0" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-gray-400 shrink-0" />
          )}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current Status</span>
            <p className="font-bold text-base text-charcoal capitalize mt-0.5">
              {status === 'approved' ? 'Verified Business' : status === 'pending' ? 'Verification Under Review' : 'Not Verified'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {status === 'approved'
                ? 'Your business has been verified by the WedConnect admin team.'
                : status === 'pending'
                ? 'Your submitted documents are currently being checked.'
                : 'Submit business license or insurance document to receive the verified badge.'}
            </p>
          </div>
        </div>

        {status !== 'approved' && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Document URL (License, Certificate, or Proof of Registration)
              </label>
              <input
                type="url"
                value={docUrl}
                onChange={e => setDocUrl(e.target.value)}
                placeholder="https://drive.google.com/... or cloud document link"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Additional Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Business registration number, tax ID, or notes for the reviewer..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !docUrl.trim()}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-burgundy text-white rounded-xl text-sm font-semibold hover:bg-burgundy/90 disabled:opacity-50 transition-all shadow-soft"
            >
              <UploadCloud className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Verification'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
