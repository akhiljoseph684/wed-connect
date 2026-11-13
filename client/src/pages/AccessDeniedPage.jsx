import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShieldX, Home } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <Heart className="w-8 h-8 text-burgundy fill-burgundy" />
          <span className="font-playfair text-2xl font-bold text-burgundy">WedConnect</span>
        </div>
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="font-playfair text-3xl font-bold text-charcoal mb-4">Access Denied</h1>
        <p className="text-gray-500 mb-8">
          You don't have permission to access this page. Please sign in with an appropriate account or contact support if you believe this is an error.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-burgundy text-white rounded-lg font-semibold hover:bg-burgundy/90 transition-all shadow-soft"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-burgundy text-burgundy rounded-lg font-semibold hover:bg-burgundy/5 transition-all"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
