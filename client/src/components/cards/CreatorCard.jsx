import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users } from 'lucide-react';

export const CreatorCard = ({ creator }) => {
  const avatar =
    creator.userId?.avatarUrl ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80';
  const cover =
    creator.coverImageUrl ||
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group bg-white rounded-2xl border border-sand/60 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col">
      {/* Independent Cover Container with rounded top and overflow hidden */}
      <div className="relative h-28 bg-gradient-to-r from-rose-200 to-blush rounded-t-2xl overflow-hidden flex-shrink-0">
        <img
          src={cover}
          alt={creator.displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
      </div>

      {/* Profile info section */}
      <div className="px-5 pb-5 pt-0 flex-1 flex flex-col justify-between">
        <div>
          {/* Overlapping avatar row with z-index, no clipping */}
          <div className="-mt-9 relative z-10 flex justify-between items-end mb-3">
            <img
              src={avatar}
              alt={creator.displayName}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-soft bg-white"
            />
            <span className="text-[11px] font-medium text-burgundy flex items-center gap-1 bg-burgundy/10 px-2.5 py-1 rounded-full shadow-xs">
              <Sparkles className="w-3 h-3 text-gold" />
              Creator
            </span>
          </div>

          <Link to={`/creators/${creator.username}`}>
            <h3 className="font-serif text-lg font-medium text-charcoal hover:text-burgundy transition-colors">
              {creator.displayName}
            </h3>
          </Link>
          <p className="text-xs text-mutedGray">@{creator.username}</p>

          <p className="text-xs text-charcoal/80 line-clamp-2 mt-2 leading-relaxed">
            {creator.tagline || creator.bio || 'Curating wedding inspirations and styling magic.'}
          </p>

          {/* Specialties chips */}
          {creator.specialties && creator.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {creator.specialties.slice(0, 3).map((spec, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-sand/30 text-charcoal/80 px-2.5 py-0.5 rounded-full font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-sand/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-mutedGray">
            <Users className="w-3.5 h-3.5 text-gold" />
            <span>{creator.stats?.followersCount || 0} followers</span>
          </div>

          <Link
            to={`/creators/${creator.username}`}
            className="text-xs font-semibold text-burgundy hover:underline flex items-center gap-1"
          >
            View Portfolio →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;
