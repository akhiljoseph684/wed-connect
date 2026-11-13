import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Inbox, Star, Eye, ShieldCheck, Plus, ChevronRight, TrendingUp } from 'lucide-react';
import businessService from '../../services/business.service.js';
import enquiryService from '../../services/enquiry.service.js';
import reviewService from '../../services/review.service.js';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function VendorOverviewPage() {
  const [business, setBusiness] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      try {
        const bRes = await businessService.getMyBusiness();
        const b = bRes.data || bRes.data;
        setBusiness(b);

        if (b?._id) {
          const [eRes, rRes] = await Promise.allSettled([
            enquiryService.getReceivedEnquiries(),
            reviewService.getReviews(b._id),
          ]);
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

  const pendingEnquiries = enquiries.filter(e => e.status === 'pending');
  const avgRating = business?.rating?.average || 5.0;

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
              {business?.category?.name || 'Wedding Vendor'}
            </span>
            {business?.verificationStatus === 'approved' && (
              <span className="flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Verified Business
              </span>
            )}
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold mt-1">
            {business?.name || 'Your Business Storefront'}
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-xl">
            {business?.tagline || 'Manage your bookings, packages, and client communications.'}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/vendor/services"
            className="flex items-center gap-1.5 px-4 py-2 bg-gold text-charcoal rounded-xl text-xs font-bold hover:bg-gold/90 transition-all shadow-soft"
          >
            <Plus className="w-3.5 h-3.5" /> New Package
          </Link>
          <Link
            to="/vendor/profile"
            className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-medium hover:bg-white/20 transition-all"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-burgundy/10 text-burgundy flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-burgundy">{pendingEnquiries.length} New</span>
          </div>
          <p className="text-xs text-gray-500 mt-4">Total Inquiries</p>
          <p className="font-bold text-xl text-charcoal mt-0.5">{enquiries.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <span className="text-xs font-bold text-amber-600">{reviews.length} reviews</span>
          </div>
          <p className="text-xs text-gray-500 mt-4">Average Rating</p>
          <p className="font-bold text-xl text-charcoal mt-0.5">{avgRating.toFixed(1)} / 5.0</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose/10 text-rose flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600">Active</span>
          </div>
          <p className="text-xs text-gray-500 mt-4">Packages Listed</p>
          <p className="font-bold text-xl text-charcoal mt-0.5">{business?.services?.length || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-4">Profile Impressions</p>
          <p className="font-bold text-xl text-charcoal mt-0.5">{business?.stats?.views || 142}</p>
        </div>
      </div>

      {/* Recent Enquiries & Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-lg font-bold text-charcoal">Recent Inquiries</h2>
            <Link to="/vendor/enquiries" className="text-xs font-semibold text-burgundy hover:underline">
              View all ({enquiries.length})
            </Link>
          </div>
          {enquiries.slice(0, 4).length > 0 ? (
            <div className="divide-y divide-gray-100">
              {enquiries.slice(0, 4).map(enq => (
                <Link
                  key={enq._id}
                  to={`/vendor/enquiries/${enq._id}`}
                  className="py-3 flex items-center justify-between hover:bg-gray-50/50 rounded-lg px-2 transition-colors block"
                >
                  <div>
                    <p className="font-semibold text-sm text-charcoal">
                      {enq.coupleName || enq.sender?.firstName || 'Couple'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{enq.weddingDate ? `Wedding: ${new Date(enq.weddingDate).toLocaleDateString()}` : 'Date TBD'}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                    enq.status === 'confirmed'
                      ? 'bg-emerald-50 text-emerald-600'
                      : enq.status === 'pending'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {enq.status || 'Pending'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">No client inquiries yet</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-lg font-bold text-charcoal">Latest Reviews</h2>
            <Link to="/vendor/reviews" className="text-xs font-semibold text-burgundy hover:underline">
              View all ({reviews.length})
            </Link>
          </div>
          {reviews.slice(0, 4).length > 0 ? (
            <div className="divide-y divide-gray-100">
              {reviews.slice(0, 4).map(rev => (
                <div key={rev._id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-charcoal">{rev.authorId?.firstName || 'Couple'}</p>
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {rev.rating}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{rev.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">No reviews submitted yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
