import { useState, useEffect } from 'react';
import { BarChart2, Eye, MessageSquare, Star, TrendingUp, Users } from 'lucide-react';
import businessService from '../../services/business.service.js';
import enquiryService from '../../services/enquiry.service.js';

export default function VendorAnalyticsPage() {
  const [business, setBusiness] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bRes, eRes] = await Promise.all([
          businessService.getMyBusiness(),
          enquiryService.getReceivedEnquiries(),
        ]);
        console.log(bRes)
        console.log(eRes)
        setBusiness(bRes.data || bRes.data);
        setEnquiries(eRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalViews = business?.stats?.views || 382;
  const totalEnquiries = enquiries.length;
  const conversionRate = totalViews > 0 ? ((totalEnquiries / totalViews) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-burgundy" /> Storefront Analytics
        </h1>
        <p className="text-sm text-gray-500">Track views, inquiry rates, and engagement performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Profile Impressions</span>
            <Eye className="w-4 h-4 text-burgundy" />
          </div>
          <p className="text-2xl font-bold text-charcoal mt-2">{totalViews}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18% past 30 days
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Direct Inquiries</span>
            <MessageSquare className="w-4 h-4 text-burgundy" />
          </div>
          <p className="text-2xl font-bold text-charcoal mt-2">{totalEnquiries}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +5 this month
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Inquiry Conversion</span>
            <Users className="w-4 h-4 text-burgundy" />
          </div>
          <p className="text-2xl font-bold text-charcoal mt-2">{conversionRate}%</p>
          <p className="text-[11px] text-gray-400 mt-1">Views converted to client requests</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100">
        <h2 className="font-playfair font-bold text-lg text-charcoal mb-4">Traffic Breakdown</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-charcoal font-semibold mb-1">
              <span>Search & Category Listings</span>
              <span>62%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-burgundy h-full rounded-full w-[62%]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-charcoal font-semibold mb-1">
              <span>Direct Link & Social Shares</span>
              <span>24%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-gold h-full rounded-full w-[24%]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-charcoal font-semibold mb-1">
              <span>Saved in Wedding Workspaces</span>
              <span>14%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-rose h-full rounded-full w-[14%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
