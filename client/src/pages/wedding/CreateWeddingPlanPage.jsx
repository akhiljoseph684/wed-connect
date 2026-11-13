import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Heart, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import weddingPlanService from '../../services/weddingPlan.service.js';
import { setActivePlan } from '../../store/slices/weddingPlanSlice.js';

export default function CreateWeddingPlanPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: 'Our Dream Wedding',
      totalBudget: 25000,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        title: data.title,
        coupleNames: {
          partner1Name: data.partner1,
          partner2Name: data.partner2,
        },
        weddingDate: data.weddingDate,
        location: {
          city: data.city,
          country: data.country || 'USA',
        },
        budget: {
          total: Number(data.totalBudget) || 20000,
        },
      };
      const res = await weddingPlanService.createWeddingPlan(payload);
      const created = res.data?.weddingPlan || res.data;
      dispatch(setActivePlan(created));
      toast.success('Wedding plan created successfully!');
      navigate(`/my-wedding/${created._id}/overview`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-charcoal transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal">Create Wedding Plan</h1>
          <p className="text-xs text-gray-500">Set up your private workspace for organizing every detail</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Plan Title</label>
          <input
            {...register('title', { required: 'Title is required' })}
            placeholder="e.g. Sarah & Alex's Summer Nuptials"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Partner 1 Name</label>
            <input
              {...register('partner1', { required: 'Required' })}
              placeholder="Partner 1"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Partner 2 Name</label>
            <input
              {...register('partner2', { required: 'Required' })}
              placeholder="Partner 2"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Wedding Date</label>
            <input
              type="date"
              {...register('weddingDate', { required: 'Date is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Estimated Total Budget ($)</label>
            <input
              type="number"
              {...register('totalBudget')}
              placeholder="25000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">City / Venue Area</label>
            <input
              {...register('city')}
              placeholder="e.g. Napa Valley, CA"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Country</label>
            <input
              {...register('country')}
              placeholder="USA"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-gray-200 text-charcoal rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50 shadow-soft"
          >
            <Heart className="w-4 h-4 fill-white" />
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>
        </div>
      </form>
    </div>
  );
}
