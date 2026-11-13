import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Bookmark } from 'lucide-react';

export const CollectionCard = ({ collection }) => {
  const coverImage = collection.coverImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';

  return (
    <Link
      to={`/collections/${collection._id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-burgundy/5 shadow-soft hover:shadow-elevated transition-all duration-300"
    >
      <div className="relative aspect-video bg-ivory-200 overflow-hidden">
        <img
          src={coverImage}
          alt={collection.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {collection.isPrivate && (
          <div className="absolute top-3 right-3 bg-charcoal/70 backdrop-blur-md p-1.5 rounded-full text-white">
            <Lock className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-serif text-base font-medium text-charcoal group-hover:text-burgundy transition-colors truncate">
          {collection.title}
        </h3>
        <p className="text-xs text-mutedGray mt-1 flex items-center gap-1.5">
          <Bookmark className="w-3 h-3 text-rose" />
          {collection.itemsCount || 0} inspiration items
        </p>
      </div>
    </Link>
  );
};

export default CollectionCard;
