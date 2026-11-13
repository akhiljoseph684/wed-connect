import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
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
        <div className="font-playfair text-8xl font-bold text-burgundy/20 mb-4">404</div>
        <h1 className="font-playfair text-3xl font-bold text-charcoal mb-4">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you may have mistyped the URL.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-burgundy text-white rounded-lg font-semibold hover:bg-burgundy/90 transition-all shadow-soft"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-burgundy text-burgundy rounded-lg font-semibold hover:bg-burgundy/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
