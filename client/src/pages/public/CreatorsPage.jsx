import React, { useState, useEffect } from 'react';
import { creatorService } from '../../services/creator.service.js';
import CreatorCard from '../../components/cards/CreatorCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { Camera, Search } from 'lucide-react';

export const CreatorsPage = () => {
  const [creators, setCreators] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      setIsLoading(true);
      try {
        const res = await creatorService.getCreators({ specialty: specialty || undefined, search: search || undefined });
        setCreators(res.data?.creators || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreators();
  }, [specialty, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700">Creative Voices</span>
        <h1 className="font-serif text-4xl font-medium text-charcoal">Wedding Creators & Tastemakers</h1>
        <p className="text-sm text-mutedGray">
          Follow renowned bridal fashion curators, veil designers, color theorists, and wedding visual storytellers.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-burgundy/10 shadow-soft flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-mutedGray absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search creators by name, style, or handle..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-charcoal/15 bg-ivory-50 text-charcoal focus:outline-none focus:border-burgundy"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-auto">
          <select
            className="text-xs py-2 px-3 rounded-lg border border-charcoal/15 bg-ivory-50 text-charcoal focus:outline-none focus:border-burgundy"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            <option value="">All Specialties</option>
            <option value="Bridal Styling">Bridal Styling</option>
            <option value="Photography">Photography</option>
            <option value="Floral Design">Floral Design</option>
            <option value="Veil Design">Veil Design</option>
            <option value="Color Palettes">Color Palettes</option>
            <option value="Stationery">Stationery</option>
          </select>
        </div>
      </div>

      {/* Creators Grid */}
      {creators.length === 0 && !isLoading ? (
        <EmptyState
          icon={Camera}
          title="No creators found"
          description="Try clearing your specialty filter or searching with a different term."
          actionLabel="Clear Filters"
          onAction={() => {
            setSpecialty('');
            setSearch('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creators.map((c) => (
            <CreatorCard key={c._id} creator={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorsPage;
