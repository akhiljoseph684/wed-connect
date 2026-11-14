import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatters.js";

export const VendorCard = ({ business, onEnquiryClick }) => {
  const coverImage =
    business.coverImageUrl ||
    business.portfolio?.[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80";
  const logo =
    business.logoUrl ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80";
  const priceLabels = {
    $: "Budget Friendly",
    $$: "Moderate",
    $$$: "Luxury",
    $$$$: "Ultra Luxury",
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-burgundy/5 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col">
      {/* Cover Image */}
      <Link
        to={`/vendors/${business.slug}`}
        className="relative block h-48 overflow-hidden bg-ivory-200"
      >
        <img
          src={coverImage}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {/* Verification badge */}
        {business.verificationStatus === "approved" && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-burgundy shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Vendor</span>
          </div>
        )}
        {/* Price Range */}
        <div className="absolute top-3 right-3 bg-charcoal/70 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white">
          {priceLabels[business.priceRange]}
        </div>
      </Link>

      {/* Info Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <img
              src={logo}
              alt={business.name}
              className="w-9 h-9 rounded-full object-cover border border-gold/30 shrink-0"
            />
            <div className="min-w-0">
              <Link to={`/vendors/${business.slug}`}>
                <h3 className="font-serif text-lg font-medium text-charcoal hover:text-burgundy transition-colors truncate">
                  {business.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 text-xs text-mutedGray">
                {business.categoryId && <span>{business.categoryId.name}</span>}
                {business.location?.city && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin className="w-3 h-3 text-rose shrink-0" />
                      {business.location.city}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-charcoal/75 line-clamp-2 mt-2 leading-relaxed">
            {business.tagline || business.description}
          </p>
        </div>

        {/* Pricing & Rating Footer */}
        <div className="pt-3 border-t border-ivory-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-[11px] text-mutedGray block">
              Starting from
            </span>
            <span className="text-sm font-semibold text-burgundy">
              {formatCurrency(business.startingPrice)}
            </span>
          </div>

          {business.rating?.average && (<div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
            <span className="font-semibold text-charcoal">
              {business.rating?.average || 5.0}
            </span>
            <span className="text-mutedGray text-[11px]">
              ({business.rating?.count || 0})
            </span>
          </div>)}
        </div>
      </div>
    </div>
  );
};

export default VendorCard;
