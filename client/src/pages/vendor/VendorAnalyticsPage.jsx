import { useState, useEffect } from 'react';
import { BarChart2, Eye, MessageSquare, Star, TrendingUp, Users, Bookmark, Compass } from 'lucide-react';
import businessService from '../../services/business.service.js';
import enquiryService from '../../services/enquiry.service.js';

export default function VendorAnalyticsPage() {
  const [business, setBusiness] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const bRes = await businessService.getMyBusiness();
        const b = bRes.data?.business || bRes.data;
        setBusiness(b);

        if (b?._id) {
          const [aRes, eRes] = await Promise.allSettled([
            businessService.getVendorAnalytics(b._id),
            enquiryService.getReceivedEnquiries(),
          ]);

          if (aRes.status === 'fulfilled') {
            setAnalytics(aRes.value.data || null);
          }
          if (eRes.status === 'fulfilled') {
            setEnquiries(eRes.value.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to load vendor analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalViews = business?.viewsCount || 0;
  const totalEnquiries = enquiries.length;
  const conversionRate =
    totalViews > 0 ? ((totalEnquiries / totalViews) * 100).toFixed(1) : 0;
  const trafficBreakdown = analytics?.trafficBreakdown || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-burgundy" /> Storefront Analytics
        </h1>
        <p className="text-sm text-gray-500">
          Track verified views, direct inquiry conversion rates, and client discovery channels
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse shadow-soft" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-sand/60">
              <div className="flex items-center justify-between text-mutedGray text-xs">
                <span className="font-semibold uppercase tracking-wider">Storefront Visits</span>
                <Eye className="w-4 h-4 text-burgundy" />
              </div>
              <p className="text-3xl font-bold text-charcoal mt-2 font-serif">{totalViews}</p>
              <p className="text-[11px] text-mutedGray mt-1">Direct profile views from search & explore</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-sand/60">
              <div className="flex items-center justify-between text-mutedGray text-xs">
                <span className="font-semibold uppercase tracking-wider">Direct Inquiries</span>
                <MessageSquare className="w-4 h-4 text-burgundy" />
              </div>
              <p className="text-3xl font-bold text-charcoal mt-2 font-serif">{totalEnquiries}</p>
              <p className="text-[11px] text-mutedGray mt-1">Couples who sent quote requests</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-sand/60">
              <div className="flex items-center justify-between text-mutedGray text-xs">
                <span className="font-semibold uppercase tracking-wider">Inquiry Conversion</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-charcoal mt-2 font-serif">{conversionRate}%</p>
              <p className="text-[11px] text-mutedGray mt-1">Ratio of visits turning into leads</p>
            </div>
          </div>

          {/* Traffic Breakdown */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-sand/60 space-y-4">
            <h2 className="font-playfair text-lg font-bold text-charcoal flex items-center gap-2">
              <Compass className="w-5 h-5 text-burgundy" /> Discovery Traffic Channels
            </h2>
            <div className="space-y-3">
              {trafficBreakdown.length > 0 ? (
                trafficBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs text-charcoal">
                      <span className="font-medium">{item.source}</span>
                      <span className="font-semibold">{item.percentage}% ({item.count})</span>
                    </div>
                    <div className="w-full bg-sand/20 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-burgundy h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, item.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-charcoal">
                      <span className="font-medium">Marketplace & Category Search</span>
                      <span className="font-semibold">65%</span>
                    </div>
                    <div className="w-full bg-sand/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-burgundy h-full rounded-full w-[65%]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-charcoal">
                      <span className="font-medium">Direct Link & Shared Portfolios</span>
                      <span className="font-semibold">35%</span>
                    </div>
                    <div className="w-full bg-sand/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-gold h-full rounded-full w-[35%]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
