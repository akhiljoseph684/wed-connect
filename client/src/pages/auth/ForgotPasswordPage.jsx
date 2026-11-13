import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Heart, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service.js';

const schema = z.object({ email: z.string().email('Please enter a valid email') });

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSentEmail(email);
      setSent(true);
      toast.success('Password reset link sent!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset link';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal mb-2">Check Your Email</h1>
        <p className="text-gray-500 text-sm mb-6">
          We've sent a password reset link to <strong className="text-charcoal">{sentEmail}</strong>.
          Please check your inbox and follow the instructions.
        </p>
        <p className="text-xs text-gray-400 mb-6">Didn't receive it? Check your spam folder or try again.</p>
        <button onClick={() => setSent(false)} className="text-sm text-burgundy hover:text-burgundy/80 font-medium">Try again</button>
        <div className="mt-4">
          <Link to="/login" className="text-sm text-gray-500 hover:text-charcoal flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-8 h-8 text-burgundy fill-burgundy" />
          <span className="font-playfair text-2xl font-bold text-burgundy">WedConnect</span>
        </div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal mb-2">Forgot Password?</h1>
        <p className="text-gray-500 text-sm">Enter your email and we'll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input {...register('email')} type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy transition-all text-charcoal placeholder-gray-400" />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-burgundy text-white rounded-lg font-semibold hover:bg-burgundy/90 disabled:opacity-60 transition-all shadow-soft">
          {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</span> : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm text-gray-500 hover:text-charcoal flex items-center justify-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </div>
    </motion.div>
  );
}
