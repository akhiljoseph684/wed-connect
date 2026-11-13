import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { setUser } from '../../store/slices/authSlice.js';
import userService from '../../services/user.service.js';

export default function EditProfilePage() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      location: user?.location || '',
      weddingDate: user?.weddingDate ? user.weddingDate.split('T')[0] : '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await userService.updateMe(data);
      const updatedUser = res.data?.user || { ...user, ...data };
      dispatch(setUser(updatedUser));
      localStorage.setItem('wedconnect_user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use FileReader for preview
    const reader = new FileReader();
    reader.onload = async () => {
      setAvatarPreview(reader.result);
      try {
        const res = await userService.updateAvatar(reader.result);
        const updated = res.data?.user;
        if (updated) {
          dispatch(setUser(updated));
          localStorage.setItem('wedconnect_user', JSON.stringify(updated));
          toast.success('Avatar updated!');
        }
      } catch (err) {
        toast.error('Failed to update avatar photo');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-charcoal"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal">Edit Profile</h1>
          <p className="text-xs text-gray-500">Update your public details and preferences</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-3 pb-6 border-b border-gray-100">
          <div className="relative group">
            <img
              src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=7D1E3B&color=fff&size=200`}
              alt="Avatar preview"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-rose/20 shadow-soft"
            />
            <label className="absolute inset-0 bg-charcoal/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera className="w-6 h-6" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
            </label>
          </div>
          <span className="text-xs text-gray-500">Click photo to update avatar</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">First Name</label>
              <input
                {...register('firstName', { required: 'First name is required' })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Last Name</label>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Bio / Story</label>
            <textarea
              {...register('bio')}
              rows={3}
              placeholder="Tell other couples and creators a bit about yourself..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Location (City, Country)</label>
              <input
                {...register('location.city')}
                placeholder="e.g. New York, NY"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Wedding Date</label>
              <input
                type="date"
                {...register('weddingDate')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-5 py-2.5 border border-gray-200 text-charcoal rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-60 transition-all shadow-soft"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
