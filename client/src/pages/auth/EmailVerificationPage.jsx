import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, CheckCircle, XCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service.js';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authService.verifyEmail(token)
      .then(() => { setStatus('success'); toast.success('Email verified!'); })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Heart className="w-8 h-8 text-burgundy fill-burgundy" />
        <span className="font-playfair text-2xl font-bold text-burgundy">WedConnect</span>
      </div>

      {status === 'verifying' && (
        <div>
          <div className="w-16 h-16 bg-blush rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mail className="w-8 h-8 text-burgundy" />
          </div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal mb-2">Verifying Your Email...</h1>
          <div className="w-8 h-8 border-4 border-burgundy border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {status === 'success' && (
        <div>
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal mb-2">Email Verified!</h1>
          <p className="text-gray-500 text-sm mb-6">Your email address has been successfully verified.</p>
          <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-burgundy text-white rounded-lg font-semibold hover:bg-burgundy/90 transition-all shadow-soft">
            Go to Dashboard
          </button>
        </div>
      )}

      {status === 'error' && (
        <div>
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal mb-2">Verification Failed</h1>
          <p className="text-gray-500 text-sm mb-6">The verification link is invalid or has expired. Please request a new one.</p>
          <button onClick={() => navigate('/login')} className="w-full py-3 bg-burgundy text-white rounded-lg font-semibold hover:bg-burgundy/90 transition-all shadow-soft">
            Back to Sign In
          </button>
        </div>
      )}
    </motion.div>
  );
}
