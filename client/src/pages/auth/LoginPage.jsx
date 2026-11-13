import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Heart, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { setUser, setToken } from '../../store/slices/authSlice.js';
import authService from '../../services/auth.service.js';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      const { user, accessToken } = res.data;
      dispatch(setUser(user));
      dispatch(setToken(accessToken));
      localStorage.setItem('wedconnect_access_token', accessToken);
      localStorage.setItem('wedconnect_user', JSON.stringify(user));
      toast.success(`Welcome back, ${user.firstName}!`);
      
      if (user.role === 'admin' || user.role === 'moderator') navigate('/admin/dashboard');
      else if (user.capabilities?.isVendor || user.role === 'vendor') navigate('/vendor/dashboard');
      else if (user.capabilities?.isCreator || user.role === 'creator') navigate('/creator/dashboard');
      else navigate(from);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-8 h-8 text-burgundy fill-burgundy" />
          <span className="font-playfair text-2xl font-bold text-burgundy">WedConnect</span>
        </div>
        <h1 className="font-playfair text-3xl font-bold text-charcoal mb-2">Welcome Back</h1>
        <p className="text-gray-500 text-sm">Sign in to continue planning your perfect wedding</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy transition-all text-charcoal placeholder-gray-400"
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="w-full pl-10 pr-11 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy transition-all text-charcoal placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('rememberMe')} type="checkbox" className="w-4 h-4 rounded border-gray-300 text-burgundy focus:ring-burgundy/30" />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-burgundy hover:text-burgundy/80 font-medium transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-burgundy text-white rounded-lg font-semibold hover:bg-burgundy/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-soft"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </span>
          ) : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-burgundy hover:text-burgundy/80 font-semibold transition-colors">
            Create one
          </Link>
        </p>
      </div>

      <div className="mt-6 p-4 bg-gold/10 rounded-lg border border-gold/20">
        <p className="text-xs text-center text-charcoal font-medium mb-2">Demo Accounts</p>
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
          <div>Admin: admin@wedconnect.com</div>
          <div>Vendor: vendor@wedconnect.com</div>
          <div>Creator: creator@wedconnect.com</div>
          <div>Couple: couple@wedconnect.com</div>
        </div>
        <p className="text-xs text-center text-gray-500 mt-1">Password: Password123!</p>
      </div>
    </motion.div>
  );
}
