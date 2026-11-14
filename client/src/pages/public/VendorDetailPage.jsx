import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { businessService } from "../../services/business.service.js";
import { reviewService } from "../../services/review.service.js";
import { weddingPlanService } from "../../services/weddingPlan.service.js";
import EnquiryModal from "../../components/modals/EnquiryModal.jsx";
import ReviewModal from "../../components/modals/ReviewModal.jsx";
import ConfirmationDialog from "../../components/common/ConfirmationDialog.jsx";
import Button from "../../components/common/Button.jsx";
import {
  Star,
  MapPin,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Mail,
  Phone,
  Globe,
  Instagram,
  Sparkles,
  Bookmark,
  Edit3,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import toast from "react-hot-toast";

export const VendorDetailPage = () => {
  const { slug } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Wedding plan saved vendor state
  const [userPlans, setUserPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingVendor, setSavingVendor] = useState(false);

  const fetchBusinessData = async () => {
    setIsLoading(true);
    try {
      const res = await businessService.getBusinessBySlug(slug);
      const b = res.data?.business;
      setBusiness(b);
      setServices(res.data?.services || []);

      if (b?._id) {
        const reviewRes = await reviewService.getReviews(b._id);
        setReviews(reviewRes.data?.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, [slug]);

  // Check saved state in user's wedding plan
  useEffect(() => {
    const fetchUserPlans = async () => {
      if (!user) return;
      try {
        const res = await weddingPlanService.getWeddingPlans();
        const plans = res.data || [];
        setUserPlans(plans);
        if (plans.length > 0) {
          const firstPlan = plans[0];
          setSelectedPlanId(firstPlan._id);
          const savedIds = (firstPlan.savedVendorIds || []).map((id) =>
            typeof id === "object" ? id._id : id
          );
          if (business?._id && savedIds.includes(business._id)) {
            setIsSaved(true);
          }
        }
      } catch (e) {
        // user might not have planner active
      }
    };
    fetchUserPlans();
  }, [user, business?._id]);

  const handleToggleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save vendors to your wedding workspace");
      return;
    }
    if (!selectedPlanId && userPlans.length === 0) {
      toast.error("Please create a wedding plan first");
      return;
    }
    const targetPlanId = selectedPlanId || userPlans[0]?._id;
    setSavingVendor(true);
    try {
      const res = await weddingPlanService.toggleSaveVendor(targetPlanId, business._id);
      const nextSaved = res.data?.isSaved ?? !isSaved;
      setIsSaved(nextSaved);
      toast.success(nextSaved ? "Vendor saved to your wedding workspace!" : "Vendor removed from saved list");
    } catch (err) {
      toast.error("Failed to update saved vendor status");
    } finally {
      setSavingVendor(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deletingReviewId) return;
    setIsDeletingReview(true);
    try {
      await reviewService.deleteReview(deletingReviewId);
      toast.success("Review deleted successfully");
      setDeletingReviewId(null);
      fetchBusinessData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review");
    } finally {
      setIsDeletingReview(false);
    }
  };

  if (!business && !isLoading) {
    return (
      <div className="py-20 text-center">
        <h2 className="font-serif text-2xl text-charcoal">Vendor Profile Not Found</h2>
        <Link to="/vendors" className="text-sm text-burgundy underline mt-2 block">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const cover =
    business?.coverImageUrl ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80";
  const logo =
    business?.logoUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

  return (
    <div className="space-y-10 pb-20">
      {/* 1. Hero Cover Header */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-charcoal">
        <img src={cover} alt={business?.name} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* 2. Profile Details & Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-burgundy/5 shadow-luxury flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <img
              src={logo}
              alt={business?.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-soft bg-white shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-rose uppercase tracking-wider bg-blush px-3 py-0.5 rounded-full">
                  {business?.categoryId?.name || "Wedding Specialty"}
                </span>
                <span className="text-xs font-semibold text-gold-700 bg-sand px-2 py-0.5 rounded-full">
                  {business?.priceRange || "$$"}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-charcoal">
                {business?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-mutedGray pt-1">
                <div className="flex items-center gap-1 text-charcoal">
                  <MapPin className="w-3.5 h-3.5 text-rose" />
                  <span>
                    {business?.location?.city}, {business?.location?.state}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-charcoal">
                  <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                  <span>{business?.averageRating || business?.rating?.average || "5.0"}</span>
                  <span className="text-mutedGray font-normal">
                    ({business?.totalReviews || reviews.length} reviews)
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-charcoal/80 max-w-2xl leading-relaxed">
                {business?.tagline}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
            <Button
              variant="primary"
              size="lg"
              className="rounded-full shadow-md"
              onClick={() => {
                setSelectedService(null);
                setIsEnquiryModalOpen(true);
              }}
            >
              Request Free Quote
            </Button>

            <button
              onClick={handleToggleSave}
              disabled={savingVendor}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                isSaved
                  ? "bg-burgundy text-white hover:bg-burgundy/90"
                  : "bg-white border border-burgundy/30 text-burgundy hover:bg-rose-50"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-white text-white" : ""}`} />
              {isSaved ? "Saved in Wedding Plan" : "Save Vendor"}
            </button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-full"
              onClick={() => {
                setEditingReview(null);
                setIsReviewModalOpen(true);
              }}
            >
              Write Review
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Main Details & Services Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (About, Packages, Portfolio, Reviews) */}
        <div className="lg:col-span-2 space-y-12">
          {/* About Section */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-burgundy/5 shadow-soft space-y-4">
            <h2 className="font-serif text-xl font-medium text-charcoal">About Our Studio</h2>
            <div className="text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">
              {business?.description}
            </div>

            {business?.subcategories && business.subcategories.length > 0 && (
              <div className="pt-4 border-t border-ivory-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 block mb-2">
                  Specialties & Styles
                </span>
                <div className="flex flex-wrap gap-2">
                  {business.subcategories.map((sub, i) => (
                    <span
                      key={i}
                      className="text-xs bg-ivory-200 text-charcoal/80 px-3 py-1 rounded-full font-medium"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Services & Wedding Packages */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-medium text-charcoal">
                  Wedding Packages & Services
                </h2>
                <p className="text-xs text-mutedGray">
                  Transparent service collections tailored to your wedding vision
                </p>
              </div>
            </div>

            {services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {services.map((pkg) => (
                  <div
                    key={pkg._id}
                    className="bg-white rounded-2xl border border-burgundy/10 shadow-soft p-6 flex flex-col justify-between hover:border-burgundy/30 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif text-lg font-medium text-charcoal group-hover:text-burgundy transition-colors">
                          {pkg.name}
                        </h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-ivory-200 text-charcoal/80 capitalize">
                          {pkg.pricingType}
                        </span>
                      </div>

                      <div className="text-2xl font-serif font-semibold text-burgundy">
                        {formatCurrency(pkg.price, pkg.currency || "USD")}
                        <span className="text-xs text-mutedGray font-sans font-normal ml-1">
                          / {pkg.duration || "Day"}
                        </span>
                      </div>

                      <p className="text-xs text-charcoal/80 leading-relaxed line-clamp-3">
                        {pkg.description}
                      </p>

                      {pkg.features && pkg.features.length > 0 && (
                        <div className="pt-3 border-t border-ivory-200 space-y-1.5">
                          {pkg.features.slice(0, 4).map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-charcoal/90">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                              <span className="truncate">{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-5 rounded-xl border-burgundy/20 text-burgundy hover:bg-rose-50"
                      onClick={() => {
                        setSelectedService(pkg);
                        setIsEnquiryModalOpen(true);
                      }}
                    >
                      Inquire About Package
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-burgundy/5 text-center text-mutedGray text-sm">
                No fixed packages listed. Contact directly for custom quotes.
              </div>
            )}
          </section>

          {/* Portfolio Showcase */}
          {business?.portfolio && business.portfolio.length > 0 && (
            <section className="space-y-6">
              <h2 className="font-serif text-2xl font-medium text-charcoal">Portfolio Showcase</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {business.portfolio.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-soft group">
                    <img
                      src={img.imageUrl}
                      alt={img.title || "Portfolio Work"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Client Reviews Section with Edit & Delete */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-medium text-charcoal">
                  Client Reviews ({reviews.length})
                </h2>
                <p className="text-xs text-mutedGray">
                  Average Rating: {business?.averageRating || "5.0"} / 5.0
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingReview(null);
                  setIsReviewModalOpen(true);
                }}
              >
                Write Review
              </Button>
            </div>

            <div className="space-y-4">
              {reviews.map((r) => {
                const isAuthor =
                  user &&
                  (r.authorId?._id === user._id ||
                    r.authorId === user._id ||
                    user.role === "admin");

                return (
                  <div
                    key={r._id}
                    className="bg-white p-6 rounded-2xl border border-burgundy/5 shadow-soft space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            r.authorId?.avatarUrl ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                          }
                          alt={r.authorId?.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-charcoal">
                            {r.authorId?.displayName || r.authorId?.firstName}
                          </h4>
                          <span className="text-[10px] text-mutedGray">
                            {formatDate(r.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex text-gold">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (r.rating || 5) ? "fill-gold text-gold" : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Edit & Delete for review author */}
                        {isAuthor && (
                          <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                            <button
                              onClick={() => {
                                setEditingReview(r);
                                setIsReviewModalOpen(true);
                              }}
                              className="p-1 text-gray-400 hover:text-burgundy transition-colors"
                              title="Edit Review"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingReviewId(r._id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h5 className="font-serif text-sm font-semibold text-charcoal">{r.title}</h5>
                    <p className="text-xs text-charcoal/80 leading-relaxed">{r.comment}</p>

                    {r.reply?.text && (
                      <div className="bg-ivory-100 p-3 rounded-xl border border-charcoal/5 mt-3 space-y-1">
                        <p className="text-[11px] font-semibold text-burgundy">
                          Response from {business.name}:
                        </p>
                        <p className="text-xs text-charcoal/80 italic">{r.reply.text}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column (Contact & Availability Card) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-burgundy/10 shadow-soft space-y-5 sticky top-28">
            <h3 className="font-serif text-lg font-medium text-charcoal">Direct Contact</h3>

            <div className="space-y-3 text-xs text-charcoal">
              {business?.contactInfo?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-rose shrink-0" />
                  <span className="truncate">{business.contactInfo.email}</span>
                </div>
              )}
              {business?.contactInfo?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-rose shrink-0" />
                  <span>{business.contactInfo.phone}</span>
                </div>
              )}
              {business?.contactInfo?.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-rose shrink-0" />
                  <a
                    href={business.contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-burgundy truncate"
                  >
                    Visit Studio Website
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-ivory-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-charcoal">
                <Calendar className="w-4 h-4 text-gold-600" />
                <span>Notice Period: {business?.availability?.noticePeriodWeeks || 2} Weeks</span>
              </div>
              <p className="text-[11px] text-mutedGray">
                Bookings accepted up to 18 months in advance. Schedule an inquiry consultation to secure your date.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-xl shadow-soft"
              onClick={() => {
                setSelectedService(null);
                setIsEnquiryModalOpen(true);
              }}
            >
              Contact Vendor Directly
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEnquiryModalOpen && business && (
        <EnquiryModal
          isOpen={isEnquiryModalOpen}
          onClose={() => setIsEnquiryModalOpen(false)}
          business={business}
          service={selectedService}
        />
      )}

      {isReviewModalOpen && business && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setEditingReview(null);
          }}
          business={business}
          initialReview={editingReview}
          onSubmitted={() => fetchBusinessData()}
        />
      )}

      {/* Review Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingReviewId}
        onClose={() => setDeletingReviewId(null)}
        onConfirm={handleDeleteReview}
        title="Delete Your Review?"
        description="Are you sure you want to delete this review? Your feedback and rating will be permanently removed."
        confirmText="Delete Review"
        isLoading={isDeletingReview}
      />
    </div>
  );
};

export default VendorDetailPage;
