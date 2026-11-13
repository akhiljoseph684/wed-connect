import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { businessService } from '../../services/business.service.js';
import { categoryService } from '../../services/category.service.js';
import VendorCard from '../../components/cards/VendorCard.jsx';
import { VendorCardSkeleton } from '../../components/common/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { Store, Search, Filter } from 'lucide-react';

export const VendorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchCity, setSearchCity] = useState(searchParams.get('city') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || '');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    categoryService.getCategories({type: 'vendor'}).then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      try {
        const res = await businessService.getBusinesses({
          categoryId: selectedCategory || undefined,
          city: searchCity || undefined,
          priceRange: priceRange || undefined,
          sort: sortBy,
        });
        setBusinesses(res.data?.businesses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, [selectedCategory, searchCity, priceRange, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700">Marketplace Directory</span>
        <h1 className="font-serif text-4xl font-medium text-charcoal">Find Your Dream Wedding Vendors</h1>
        <p className="text-sm text-mutedGray">
          Verified photographers, venues, florists, and wedding planners dedicated to crafting unforgettable celebrations.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-burgundy/10 shadow-soft flex flex-wrap items-center gap-4">
        {/* Category filter */}
        <div className="flex-1 min-w-[180px]">
          <select
            className="w-full text-xs py-2 px-3 rounded-lg border border-charcoal/15 bg-ivory-50 text-charcoal focus:outline-none focus:border-burgundy"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* City search */}
        <div className="flex-1 min-w-[180px] relative">
          <input
            type="text"
            placeholder="City or location (e.g. San Francisco, NY)"
            className="w-full text-xs py-2 px-3 rounded-lg border border-charcoal/15 bg-ivory-50 text-charcoal focus:outline-none focus:border-burgundy"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div className="w-auto">
          <select
            className="text-xs py-2 px-3 rounded-lg border border-charcoal/15 bg-ivory-50 text-charcoal focus:outline-none focus:border-burgundy"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          >
            <option value="">Any Price</option>
            <option value="$">$ (Budget Friendly)</option>
            <option value="$$">$$ (Moderate)</option>
            <option value="$$$">$$$ (Luxury)</option>
            <option value="$$$$">$$$$ (Ultra Luxury)</option>
          </select>
        </div>

        {/* Sort */}
        <div className="w-auto">
          <select
            className="text-xs py-2 px-3 rounded-lg border border-charcoal/15 bg-ivory-50 text-charcoal focus:outline-none focus:border-burgundy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rating">Top Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Added</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <VendorCardSkeleton key={i} />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No wedding vendors found"
          description="Try broadening your city or category filter criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedCategory('');
            setSearchCity('');
            setPriceRange('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {businesses.map((b) => (
            <VendorCard key={b._id} business={b} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
