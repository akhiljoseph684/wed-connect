import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Heart, User, Mail, Lock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { setUser, setToken } from '../../store/slices/authSlice.js';
import authService from '../../services/auth.service.js';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  role: z.enum(['user', 'vendor', 'creator']),
  isCouple: z.boolean().optional(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'user', isCouple: false },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        isCouple: data.role === 'user' && data.isCouple,
      };
      const res = await authService.register(payload);
      const { user, accessToken } = res.data;
      dispatch(setUser(user));
      dispatch(setToken(accessToken));
      localStorage.setItem('wedconnect_access_token', accessToken);
      localStorage.setItem('wedconnect_user', JSON.stringify(user));
      toast.success('Welcome to WedConnect! 🎉');
      if (user.role === 'admin' || user.role === 'moderator') navigate('/admin/dashboard');
      else if (user.capabilities?.isVendor || user.role === 'vendor') navigate('/vendor/dashboard');
      else if (user.capabilities?.isCreator || user.role === 'creator') navigate('/creator/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'user', label: 'Couple / Guest', icon: '💑', desc: 'Plan your dream wedding' },
    { value: 'creator', label: 'Wedding Creator', icon: '📸', desc: 'Share your work & inspiration' },
    { value: 'vendor', label: 'Wedding Vendor', icon: '🏢', desc: 'Grow your wedding business' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Heart className="w-7 h-7 text-burgundy fill-burgundy" />
          <span className="font-playfair text-xl font-bold text-burgundy">WedConnect</span>
        </div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal mb-1">Create Your Account</h1>
        <p className="text-gray-500 text-sm">Join thousands of couples planning their perfect wedding</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">I am a...</label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map(role => (
              <label key={role.value} className={`cursor-pointer rounded-lg border-2 p-2.5 text-center transition-all ${
                selectedRole === role.value ? 'border-burgundy bg-burgundy/5' : 'border-gray-200 hover:border-burgundy/40'
              }`}>
                <input {...register('role')} type="radio" value={role.value} className="sr-only" />
                <div className="text-xl mb-1">{role.icon}</div>
                <div className="text-xs font-semibold text-charcoal">{role.label}</div>
                <div className="text-xs text-gray-500 mt-0.5 hidden sm:block">{role.desc}</div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input {...register('firstName')} placeholder="Jane" className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy transition-all text-sm text-charcoal placeholder-gray-400" />
            </div>
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">Last Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input {...register('lastName')} placeholder="Smith" className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy transition-all text-sm text-charcoal placeholder-gray-400" />
            </div>
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input {...register('email')} type="email" placeholder="you@example.com" className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy transition-all text-sm text-charcoal placeholder-gray-400" />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy transition-all text-sm text-charcoal placeholder-gray-400" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input {...register('confirmPassword')} type="password" placeholder="Repeat your password" className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy transition-all text-sm text-charcoal placeholder-gray-400" />
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {selectedRole === 'user' && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('isCouple')} type="checkbox" className="w-4 h-4 rounded border-gray-300 text-burgundy focus:ring-burgundy/30" />
            <span className="text-xs text-gray-600 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> I'm planning a wedding (enable Wedding Planner)</span>
          </label>
        )}

        <button type="submit" disabled={loading} className="w-full py-2.5 bg-burgundy text-white rounded-lg font-semibold hover:bg-burgundy/90 disabled:opacity-60 transition-all shadow-soft">
          {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account...</span> : 'Create Account'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-burgundy hover:text-burgundy/80 font-semibold">Sign in</Link>
      </p>
      <p className="mt-2 text-center text-xs text-gray-400">
        By registering, you agree to our Terms of Service and Privacy Policy.
      </p>
    </motion.div>
  );
}
