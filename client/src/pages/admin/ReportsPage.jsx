import { useState, useEffect } from 'react';
import { Flag, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/admin.service.js';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReports();
      const reportList = res.data?.reports || res.reports || [];
      setReports(reportList);
    } catch (err) {
      console.error('Failed to load reports', err);
      toast.error('Failed to load moderation reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id, status = 'resolved') => {
    setResolvingId(id);
    try {
      await adminService.resolveReport(id, {
        status,
        resolutionNotes: `Action taken by admin at ${new Date().toISOString()}`,
      });
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
      toast.success(status === 'resolved' ? 'Report resolved' : 'Report dismissed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update report');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Flag className="w-6 h-6 text-red-500" /> Moderation Reports
        </h1>
        <p className="text-sm text-gray-500">Review reported posts, comments, and member accounts</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-burgundy animate-spin mb-2" />
          <p className="text-sm text-gray-500">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-soft">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="font-playfair text-lg font-bold text-charcoal">All clear!</h3>
          <p className="text-sm text-gray-500 mt-1">There are no pending moderation reports at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => {
            const reporterName = rep.reporterId
              ? `${rep.reporterId.firstName || ''} ${rep.reporterId.lastName || ''}`.trim()
              : rep.reporter
              ? `${rep.reporter.firstName || ''} ${rep.reporter.lastName || ''}`.trim()
              : 'Anonymous User';

            return (
              <div
                key={rep._id}
                className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold uppercase">
                      {rep.targetType}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        rep.status === 'resolved'
                          ? 'bg-green-50 text-green-700'
                          : rep.status === 'dismissed'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {rep.status}
                    </span>
                    <span className="text-xs text-gray-400">• {formatRelativeTime(rep.createdAt)}</span>
                  </div>
                  <h3 className="font-semibold text-charcoal text-base mt-1">{rep.reason}</h3>
                  <p className="text-xs text-gray-500">Reported by: {reporterName}</p>
                  {rep.details && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl mt-2">{rep.details}</p>
                  )}
                </div>

                {rep.status === 'pending' && (
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleResolve(rep._id, 'resolved')}
                      disabled={resolvingId === rep._id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-burgundy text-white text-xs font-semibold hover:bg-burgundy/90 transition-colors disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" /> Resolve
                    </button>
                    <button
                      onClick={() => handleResolve(rep._id, 'dismissed')}
                      disabled={resolvingId === rep._id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-charcoal text-xs font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
