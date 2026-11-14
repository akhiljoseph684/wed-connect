import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Store, Plus, Trash2, MapPin, Star, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import weddingPlanService from '../../services/weddingPlan.service.js';
import VendorCard from '../../components/cards/VendorCard.jsx';

export default function ShortlistedVendorsPage() {
  const { planId } = useParams();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchShortlist = async () => {
    setLoading(true);
    try {
      const res = await weddingPlanService.getPlanDetails(planId);
      const plan = res.data?.plan || res.data;
      console.log(res)
      setVendors(plan?.savedVendorIds || []);
    } catch (err) {
      navigate("/my-wedding/new")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) fetchShortlist();
  }, [planId]);

  const handleRemove = async (vendorId) => {
    try {
      await weddingPlanService.toggleSaveVendor(planId, vendorId);
      setVendors(prev => prev.filter(v => (v._id || v) !== vendorId));
      toast.success('Vendor removed from shortlist');
    } catch (err) {
      toast.error('Failed to remove vendor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <Store className="w-6 h-6 text-burgundy" /> Shortlisted Vendors
          </h1>
          <p className="text-sm text-gray-500">Compare and manage vendors booked or shortlisted for your wedding</p>
        </div>
        <Link
          to="/vendors"
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Explore Vendors
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-white rounded-2xl animate-pulse shadow-soft" />)}
        </div>
      ) : vendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map(item => {
            const vendor = item;
            if (!vendor?._id) return null;
            return (
              <div key={vendor._id} className="relative group">
                <VendorCard business={vendor} />
                <button
                  onClick={() => handleRemove(vendor._id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-soft transition-all z-10"
                  title="Remove from shortlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No shortlisted vendors yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Browse our vendor directory for photographers, caterers, florists, and venues to add them to your wedding plan.
          </p>
          <Link
            to="/vendors"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft"
          >
            Browse Marketplace
          </Link>
        </div>
      )}
    </div>
  );
}
