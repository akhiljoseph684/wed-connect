import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { businessService } from "../../services/business.service.js";
import { reviewService } from "../../services/review.service.js";
import EnquiryModal from "../../components/modals/EnquiryModal.jsx";
import ReviewModal from "../../components/modals/ReviewModal.jsx";
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
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters.js";

export const VendorDetailPage = () => {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusinessData = async () => {
    setIsLoading(true);
    try {
      const res = await businessService.getBusinessBySlug(slug);
      setBusiness(res.data?.business);
      setServices(res.data?.services || []);

      if (res.data?.business?._id) {
        const reviewRes = await reviewService.getReviews(res.data.business._id);
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

  if (!business && !isLoading) {
    return (
      <div className="py-20 text-center">
        <h2 className="font-serif text-2xl text-charcoal">
          Vendor Profile Not Found
        </h2>
        <Link
          to="/vendors"
          className="text-sm text-burgundy underline mt-2 block"
        >
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
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80";

  return (
    <div className="space-y-12 pb-24">
      {/* 1. Header Banner */}
      <div className="relative h-80 sm:h-96 bg-charcoal text-white overflow-hidden">
        <img
          src={cover}
          alt={business?.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
      </div>

      {/* 2. Business Overview Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-burgundy/10 shadow-luxury flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <img
              src={logo}
              alt={business?.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-soft shrink-0"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
                  {business?.name}
                </h1>
                {business?.verificationStatus === "approved" && (
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Studio
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-mutedGray">
                {business?.categoryId && (
                  <span className="bg-ivory-200 text-burgundy font-medium px-2.5 py-1 rounded-full">
                    {business.categoryId.name}
                  </span>
                )}
                {business?.location?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose" />
                    {business.location.city},{" "}
                    {business.location.state || business.location.country}
                  </span>
                )}
                <div className="flex items-center gap-1 text-charcoal font-semibold">
                  <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                  <span>{business?.rating?.average || 5.0}</span>
                  <span className="text-mutedGray font-normal">
                    ({business?.rating?.count || 0} reviews)
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-charcoal/80 max-w-2xl leading-relaxed">
                {business?.tagline}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
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
            <Button
              variant="outline"
              size="lg"
              className="rounded-full"
              onClick={() => setIsReviewModalOpen(true)}
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
            <h2 className="font-serif text-xl font-medium text-charcoal">
              About Our Studio
            </h2>
            <div className="text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">
              {business?.description}
            </div>

            {business?.serviceAreas && business.serviceAreas.length > 0 && (
              <div className="pt-4 border-t border-ivory-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-mutedGray block mb-2">
                  Service Areas & Destinations
                </span>
                <div className="flex flex-wrap gap-2">
                  {business.serviceAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-ivory-100 text-charcoal px-3 py-1 rounded-full border border-charcoal/10"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Available Packages & Services */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-medium text-charcoal">
                Services & Collections
              </h2>
              <span className="text-xs text-mutedGray">
                {services.length} offerings
              </span>
            </div>

            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="bg-white p-6 rounded-2xl border border-burgundy/10 shadow-soft hover:shadow-elevated transition-all flex flex-col sm:flex-row justify-between items-start gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-lg font-semibold text-charcoal">
                        {service.name}
                      </h3>
                      <span className="text-xs bg-blush text-burgundy font-medium px-2.5 py-0.5 rounded-full">
                        {service.duration}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal/80 leading-relaxed">
                      {service.description}
                    </p>

                    {service.features && service.features.length > 0 && (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 text-xs text-charcoal/70">
                        {service.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="text-right sm:text-right w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                    <span className="text-xl font-bold font-serif text-burgundy block">
                      {formatCurrency(service.price)}
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      className="mt-2 w-full sm:w-auto rounded-full"
                      onClick={() => {
                        setSelectedService(service);
                        setIsEnquiryModalOpen(true);
                      }}
                    >
                      Enquire Package
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Portfolio Showcase */}
          {business?.portfolio && business.portfolio.length > 0 && (
            <section className="space-y-6">
              <h2 className="font-serif text-2xl font-medium text-charcoal">
                Featured Work Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {business.portfolio.map((item, i) => (
                  <div
                    key={i}
                    className="group relative rounded-2xl overflow-hidden aspect-video bg-ivory-200"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent flex items-end p-4 text-white">
                      <p className="font-serif text-sm">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Client Reviews */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-medium text-charcoal">
                Client Reviews ({reviews.length})
              </h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsReviewModalOpen(true)}
              >
                Write Review
              </Button>
            </div>

            <div className="space-y-4">
              {reviews.map((r) => (
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
                    <div className="flex text-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < (r.rating || 5) ? "fill-gold" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <h5 className="font-serif text-sm font-semibold text-charcoal">
                    {r.title}
                  </h5>
                  <p className="text-xs text-charcoal/80 leading-relaxed">
                    {r.comment}
                  </p>

                  {r.reply?.text && (
                    <div className="bg-ivory-100 p-3 rounded-xl border border-charcoal/5 mt-3 space-y-1">
                      <p className="text-[11px] font-semibold text-burgundy">
                        Response from {business.name}:
                      </p>
                      <p className="text-xs text-charcoal/80 italic">
                        {r.reply.text}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (Contact & Availability Card) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-burgundy/10 shadow-soft space-y-5 sticky top-28">
            <h3 className="font-serif text-lg font-medium text-charcoal">
              Direct Contact
            </h3>

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
                    rel="noreferrer"
                    className="hover:underline truncate text-burgundy font-medium"
                  >
                    {business.contactInfo.website}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-ivory-200">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-mutedGray block mb-1">
                Booking Notice
              </span>
              <p className="text-xs text-charcoal/80">
                Typically books 6 to 12 months in advance for peak wedding
                season.
              </p>
            </div>

            <Button
              variant="primary"
              className="w-full rounded-full"
              onClick={() => {
                setSelectedService(null);
                setIsEnquiryModalOpen(true);
              }}
            >
              Enquire Availability
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
          onClose={() => setIsReviewModalOpen(false)}
          business={business}
          onSubmitted={() => fetchBusinessData()}
        />
      )}
    </div>
  );
};

export default VendorDetailPage;
