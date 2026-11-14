import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Store, Building2, Sparkles, MapPin, DollarSign, Mail, Phone, Globe, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import businessService from '../../services/business.service.js';
import categoryService from '../../services/category.service.js';

export default function CreateBusinessPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('USA');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [startingPrice, setStartingPrice] = useState(1500);

  useEffect(() => {
    categoryService
      .getCategories()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.categories || [];
        setCategories(list);
      })
      .catch((err) => console.error('Failed to load categories', err))
      .finally(() => setLoadingCategories(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in or create an account to list your business.');
      navigate('/login?redirect=/create-business');
      return;
    }

    if (!name.trim()) {
      toast.error('Business name is required');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a business category');
      return;
    }
    if (!description.trim()) {
      toast.error('Please provide a short business description');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        categoryId,
        tagline: tagline.trim(),
        description: description.trim(),
        location: {
          city: city.trim() || 'New York',
          state: state.trim() || 'NY',
          country: country.trim() || 'USA',
        },
        contactInfo: {
          email: contactEmail.trim(),
          phone: contactPhone.trim(),
          website: website.trim(),
        },
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        startingPrice: Number(startingPrice) || 1000,
      };

      await businessService.createBusiness(payload);
      toast.success('Storefront created! Please submit your verification documents.');
      navigate('/vendor/verification');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register business storefront');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-blush rounded-2xl flex items-center justify-center mx-auto text-burgundy shadow-soft">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-charcoal">
          List Your Wedding Business on WedConnect
        </h1>
        <p className="text-sm text-gray-600 max-w-xl mx-auto">
          Connect with discerning couples planning their luxury celebration. Build your storefront, showcase curated portfolio albums, and receive qualified booking leads.
        </p>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-luxury border border-sand/60 space-y-6">
        <div>
          <h2 className="font-playfair text-xl font-bold text-charcoal border-b border-sand/40 pb-3">
            Storefront Identity
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
              Business Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hudson Valley Botanical Florals"
              className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
              Primary Category *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition bg-white"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
            Tagline / Subheading
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Bespoke organic florals and sculptural centerpieces"
            className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
            About Your Artistry & Services *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Introduce your signature style, background, typical packages, and the client experience you provide..."
            className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition resize-none"
          />
        </div>

        <div>
          <h2 className="font-playfair text-xl font-bold text-charcoal border-b border-sand/40 pb-3 pt-2">
            Location & Contact Details
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. New York"
              className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
              State / Province
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. NY"
              className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. USA"
              className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
              Business Email *
            </label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@studio.com"
              className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="(555) 234-5678"
              className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
              Starting Price ($)
            </label>
            <input
              type="number"
              min="0"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="1500"
              className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
            Website or Portfolio URL
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://www.yourstudio.com"
            className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
          />
        </div>

        <div className="pt-4 border-t border-sand/40 flex items-center justify-between">
          <Link to="/vendors" className="text-xs font-medium text-mutedGray hover:text-charcoal transition">
            Cancel & Return to Marketplace
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 bg-burgundy text-white rounded-xl text-sm font-semibold hover:bg-burgundy/90 transition shadow-soft disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering Storefront...
              </>
            ) : (
              <>
                Submit & Continue to Verification <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
