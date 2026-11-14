import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Inbox, Star, Eye, ShieldCheck, Plus, ChevronRight, TrendingUp, Bookmark, Calendar } from 'lucide-react';
import businessService from '../../services/business.service.js';
import enquiryService from '../../services/enquiry.service.js';
import reviewService from '../../services/review.service.js';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function VendorOverviewPage() {
  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      try {
        const bRes = await businessService.getMyBusiness();
        const b = bRes.data?.business || bRes.data;
        setBusiness(b);

        if (b?._id) {
          const [statsRes, eRes, rRes] = await Promise.allSettled([
            businessService.getVendorDashboardStats(b._id),
            enquiryService.getReceivedEnquiries(),
            reviewService.getReviews(b._id),
          ]);

          if (statsRes.status === 'fulfilled') {
            setStats(statsRes.value.data || null);
          }
          if (eRes.status === 'fulfilled') {
            setEnquiries(eRes.value.data || []);
          }
          if (rRes.status === 'fulfilled') {
            setReviews(rRes.value.data?.reviews || []);
          }
        }
      } catch (err) {
        console.error('Failed to load vendor overview', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, []);

  const pendingEnquiries = enquiries.filter((e) => ['new', 'pending'].includes(e.status));
  const avgRating = stats?.averageRating ?? business?.averageRating ?? 5.0;
  const reviewCount = stats?.reviewCount ?? reviews.length ?? 0;
  const totalEnquiries = stats?.enquiriesReceived ?? enquiries.length ?? 0;
  const profileVisits = stats?.profileVisits ?? 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-white rounded-2xl shadow-soft" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl shadow-soft" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Business Header Banner */}
      <div className="bg-gradient-to-r from-charcoal to-black text-white rounded-2xl p-6 sm:p-8 shadow-luxury flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-gold text-xs font-semibold uppercase tracking-wider">
              {business?.category?.name || 'Wedding Artisan'}
            </span>
            {business?.verificationStatus === 'approved' ? (
              <span className="flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Verified Business
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                Verification Pending
              </span>
            )}
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold mt-1">
            {business?.name || 'Your Business Storefront'}
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-xl">
            {business?.tagline || 'Manage your bookings, service packages, and luxury client inquiries.'}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/vendor/services"
            className="flex items-center gap-1.5 px-4 py-2 bg-gold text-charcoal rounded-xl text-xs font-bold hover:bg-gold/90 transition shadow-soft"
          >
            <Plus className="w-3.5 h-3.5" /> New Package
          </Link>
          <Link
            to="/vendor/profile"
            className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-medium hover:bg-white/20 transition"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-sand/60">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-burgundy/10 text-burgundy flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-burgundy">{pendingEnquiries.length} Pending</span>
          </div>
          <p className="text-xs text-mutedGray mt-4">Total Inquiries</p>
          <p className="font-bold text-2xl text-charcoal mt-0.5 font-serif">{totalEnquiries}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-soft border border-sand/60">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <span className="text-xs font-bold text-amber-600">{reviewCount} reviews</span>
          </div>
          <p className="text-xs text-mutedGray mt-4">Average Rating</p>
          <p className="font-bold text-2xl text-charcoal mt-0.5 font-serif">
            {avgRating > 0 ? Number(avgRating).toFixed(1) : '5.0'} / 5.0
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-soft border border-sand/60">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose/10 text-burgundy flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600">Active</span>
          </div>
          <p className="text-xs text-mutedGray mt-4">Services Listed</p>
          <p className="font-bold text-2xl text-charcoal mt-0.5 font-serif">
            {stats?.serviceStatistics?.totalServices ?? (business?.services?.length || 0)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-soft border border-sand/60">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600">Verified</span>
          </div>
          <p className="text-xs text-mutedGray mt-4">Profile Impressions</p>
          <p className="font-bold text-2xl text-charcoal mt-0.5 font-serif">{profileVisits}</p>
        </div>
      </div>

      {/* Recent Enquiries & Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-sand/60 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-lg font-bold text-charcoal">Recent Inquiries</h2>
            <Link to="/vendor/enquiries" className="text-xs font-semibold text-burgundy hover:underline">
              View all ({enquiries.length})
            </Link>
          </div>
          {enquiries.slice(0, 4).length > 0 ? (
            <div className="divide-y divide-gray-100">
              {enquiries.slice(0, 4).map((enq) => (
                <Link
                  key={enq._id}
                  to={`/vendor/enquiries/${enq._id}`}
                  className="py-3 flex items-center justify-between hover:bg-sand/10 px-2 rounded-lg transition"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-charcoal truncate">
                      {enq.coupleNames || enq.coupleName || 'Couple Inquiry'}
                    </p>
                    <p className="text-xs text-mutedGray flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-burgundy" />
                      {enq.weddingDate ? new Date(enq.weddingDate).toLocaleDateString() : 'Date TBD'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-mutedGray text-xs">No client inquiries received yet.</div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-sand/60 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-lg font-bold text-charcoal">Client Reviews ({reviewCount})</h2>
            <Link to="/vendor/profile" className="text-xs font-semibold text-burgundy hover:underline">
              Storefront View
            </Link>
          </div>
          {reviews.slice(0, 3).length > 0 ? (
            <div className="space-y-3">
              {reviews.slice(0, 3).map((r) => (
                <div key={r._id} className="p-3 bg-sand/15 rounded-xl border border-sand/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-charcoal">
                      {r.userId?.firstName} {r.userId?.lastName}
                    </span>
                    <div className="flex text-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < r.rating ? 'fill-current text-gold' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-charcoal/80 line-clamp-2">{r.comment || r.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-mutedGray text-xs">No reviews submitted yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
