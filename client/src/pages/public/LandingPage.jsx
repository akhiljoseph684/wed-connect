import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Heart, Star, ArrowRight, ShieldCheck, CalendarHeart, Users, Camera, Building2, Flower2 } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import PostCard from '../../components/cards/PostCard.jsx';
import VendorCard from '../../components/cards/VendorCard.jsx';
import CreatorCard from '../../components/cards/CreatorCard.jsx';
import SaveToCollectionModal from '../../components/modals/SaveToCollectionModal.jsx';
import { postService } from '../../services/post.service.js';
import { businessService } from '../../services/business.service.js';
import { creatorService } from '../../services/creator.service.js';
import { categoryService } from '../../services/category.service.js';

export const LandingPage = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [featuredVendors, setFeaturedVendors] = useState([]);
  const [creators, setCreators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedModalPost, setSavedModalPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    postService.getTrendingFeed({ limit: 4 }).then((res) => setTrendingPosts(res.data?.posts || [])).catch(() => {});
    businessService.getBusinesses({ limit: 3 }).then((res) => setFeaturedVendors(res.data?.businesses || [])).catch(() => {});
    creatorService.getCreators({ limit: 3 }).then((res) => setCreators(res.data?.creators || [])).catch(() => {});
    categoryService.getCategories().then((res) => setCategories(res.data?.slice(0, 6) || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-charcoal text-white overflow-hidden px-4 sm:px-6">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85"
          alt="Luxury wedding background"
          className="absolute inset-0 w-full h-full object-cover opacity-45 scale-105 animate-pulse duration-[10000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-black/30" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 pt-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-gold/40 text-gold text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-gold-300" />
            Discover. Connect. Plan. Celebrate.
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-tight">
            The Extraordinary World of <br />
            <span className="italic font-normal text-gold-200">Luxury Weddings</span>
          </h1>

          <p className="text-sm sm:text-lg text-ivory-200/90 max-w-2xl mx-auto font-light leading-relaxed">
            WedConnect unites modern couples with award-winning photographers, historic venues, bespoke floral artisans, and editorial inspiration.
          </p>

          {/* Hero Search Box */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto pt-4">
            <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl sm:rounded-full shadow-luxury border border-white/20 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-3 px-4 py-2 w-full text-charcoal">
                <Search className="w-5 h-5 text-rose shrink-0" />
                <input
                  type="text"
                  placeholder="Search venues, fine art photographers, dresses, cities..."
                  className="w-full text-sm bg-transparent placeholder:text-mutedGray text-charcoal focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto shrink-0 rounded-full px-8">
                Explore Now
              </Button>
            </div>
          </form>

          {/* Popular Search tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-ivory-300">
            <span className="text-gold">Popular:</span>
            {['Tuscany Villa', '35mm Film', 'Glasshouse', 'Minimalist Crepe Gown', 'French Chateaux'].map((tag, i) => (
              <button
                key={i}
                type="button"
                onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                className="hover:text-white hover:underline transition-colors"
              >
                {tag} •
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-burgundy/10 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-700">Explore by Specialty</span>
            <h2 className="font-serif text-3xl font-medium text-charcoal mt-1">Wedding Categories</h2>
          </div>
          <Link to="/categories" className="text-xs font-semibold text-burgundy hover:underline flex items-center gap-1">
            Browse All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/categories/${category.slug}`}
              className="group relative h-48 rounded-2xl overflow-hidden border border-burgundy/10 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-end p-4 text-white"
            >
              <img
                src={category.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
              <div className="relative z-10">
                <h3 className="font-serif text-sm font-semibold leading-tight group-hover:text-gold transition-colors">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TRENDING INSPIRATION FEED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-burgundy/10 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-700">Curated Vision</span>
            <h2 className="font-serif text-3xl font-medium text-charcoal mt-1">Trending Wedding Inspiration</h2>
          </div>
          <Link to="/explore" className="text-xs font-semibold text-burgundy hover:underline flex items-center gap-1">
            Discover Full Feed <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onSaveClick={(p) => setSavedModalPost(p)}
            />
          ))}
        </div>
      </section>

      {/* 4. FEATURED VENDORS */}
      <section className="bg-white py-16 border-y border-burgundy/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-700">Marketplace Directory</span>
              <h2 className="font-serif text-3xl font-medium text-charcoal mt-1">Premier Wedding Artisans</h2>
            </div>
            <Link to="/vendors" className="text-xs font-semibold text-burgundy hover:underline flex items-center gap-1">
              View All Vendors <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredVendors.map((vendor) => (
              <VendorCard key={vendor._id} business={vendor} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. CREATOR SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-burgundy/10 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-700">Creative Community</span>
            <h2 className="font-serif text-3xl font-medium text-charcoal mt-1">Acclaimed Wedding Creators</h2>
          </div>
          <Link to="/creators" className="text-xs font-semibold text-burgundy hover:underline flex items-center gap-1">
            Meet All Creators <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <CreatorCard key={creator._id} creator={creator} />
          ))}
        </div>
      </section>

      {/* 6. HOW WEDCONNECT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-ivory-200 rounded-3xl p-8 sm:p-12 lg:p-16 border border-gold/30 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-burgundy">The Journey</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal">How WedConnect Works</h2>
            <p className="text-xs sm:text-sm text-mutedGray">
              A harmonious path from inspiration to celebration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discover & Save', desc: 'Browse curated collections, mood boards, and editorial galleries.', icon: Sparkles },
              { step: '02', title: 'Connect with Vendors', desc: 'Send bespoke booking enquiries directly to verified artisans.', icon: ShieldCheck },
              { step: '03', title: 'Plan Collaboratively', desc: 'Track your budget, manage RSVPs, checklists, and day-of timelines.', icon: CalendarHeart },
              { step: '04', title: 'Celebrate in Luxury', desc: 'Bring your shared dream to life seamlessly with trusted talent.', icon: Heart },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-burgundy/10 shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl font-bold text-gold-600">{item.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center text-burgundy">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg font-medium text-charcoal">{item.title}</h3>
                  <p className="text-xs text-mutedGray leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. AUTHENTIC TESTIMONIALS */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-8">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700">Real Stories</span>
        <h2 className="font-serif text-3xl font-medium text-charcoal">Loved by Discerning Couples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="bg-white p-8 rounded-2xl border border-burgundy/10 shadow-soft space-y-4">
            <div className="flex text-gold">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm font-serif italic text-charcoal leading-relaxed">
              "Finding our photographer and floral designer through WedConnect felt effortless. The aesthetic is so elevated compared to any other wedding site."
            </p>
            <div>
              <p className="text-xs font-bold text-charcoal">Elena & Michael</p>
              <p className="text-[11px] text-mutedGray">Lake Como Villa Wedding</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-burgundy/10 shadow-soft space-y-4">
            <div className="flex text-gold">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm font-serif italic text-charcoal leading-relaxed">
              "The wedding planner workspace with real-time budget calculations kept us completely organized. It replaced our 15 spreadsheets into one elegant sanctuary."
            </p>
            <div>
              <p className="text-xs font-bold text-charcoal">Camilla & Julian</p>
              <p className="text-[11px] text-mutedGray">Hudson Valley Botanical Estate</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-burgundy text-white overflow-hidden p-10 sm:p-16 text-center space-y-6">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-serif text-3xl sm:text-5xl font-light">
              Begin Your Forever Story Today
            </h2>
            <p className="text-sm text-ivory-200/90 font-light">
              Join thousands of couples, wedding stylists, and service professionals celebrating modern romantic weddings.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button variant="secondary" size="lg" className="rounded-full shadow-lg">
                  Join WedConnect Free
                </Button>
              </Link>
              <Link to="/vendors">
                <Button variant="outline" size="lg" className="rounded-full border-white text-white hover:bg-white/10">
                  Explore Vendor Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Save to Collection Modal */}
      {savedModalPost && (
        <SaveToCollectionModal
          isOpen={!!savedModalPost}
          onClose={() => setSavedModalPost(null)}
          post={savedModalPost}
        />
      )}
    </div>
  );
};

export default LandingPage;
