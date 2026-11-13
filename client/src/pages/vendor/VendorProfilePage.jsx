import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Store, Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import businessService from '../../services/business.service.js';

export default function VendorProfilePage() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true);
      try {
        const res = await businessService.getMyBusiness();
        const b = res.data?.business || res.data;
        setBusiness(b);
        reset({
          name: b?.name || '',
          tagline: b?.tagline || '',
          description: b?.description || '',
          city: b?.location?.city || '',
          state: b?.location?.state || '',
          country: b?.location?.country || '',
          phone: b?.contact?.phone || '',
          email: b?.contact?.email || '',
          website: b?.contact?.website || '',
          pricingStartsAt: b?.pricing?.startingPrice || 1000,
        });
      } catch (err) {
        toast.error('Failed to load business profile');
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        location: {
          city: data.city,
          state: data.state,
          country: data.country,
        },
        contact: {
          phone: data.phone,
          email: data.email,
          website: data.website,
        },
        pricing: {
          startingPrice: Number(data.pricingStartsAt) || 0,
        },
      };

      if (business?._id) {
        await businessService.updateBusiness(business._id, payload);
      } else {
        await businessService.createBusiness(payload);
      }
      toast.success('Business profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-96 bg-white rounded-2xl animate-pulse shadow-soft" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Store className="w-6 h-6 text-burgundy" /> Storefront & Business Profile
        </h1>
        <p className="text-sm text-gray-500">Edit how couples discover and contact your wedding business</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Business Name</label>
          <input
            {...register('name', { required: true })}
            placeholder="e.g. Luminary Wedding Photography"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Short Tagline / Specialty</label>
          <input
            {...register('tagline')}
            placeholder="e.g. Editorial, timeless destination wedding photography"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">About the Business</label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Describe your background, aesthetic, years of experience, and packages offered..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">City</label>
            <input
              {...register('city')}
              placeholder="San Francisco"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">State / Province</label>
            <input
              {...register('state')}
              placeholder="CA"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Country</label>
            <input
              {...register('country')}
              placeholder="USA"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Business Phone</label>
            <input
              {...register('phone')}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Business Email</label>
            <input
              {...register('email')}
              placeholder="hello@luminaryphotos.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Starting Price ($)</label>
            <input
              type="number"
              {...register('pricingStartsAt')}
              placeholder="1500"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50 transition-all shadow-soft"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
