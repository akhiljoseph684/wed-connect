import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Mail, Send, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import authService from "../../services/auth.service.js";

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [resendEmail, setResendEmail] = useState(user?.email || "");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleResend = async (e) => {
    e.preventDefault();

    if (!resendEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsResending(true);

    try {
      await authService.resendVerification(resendEmail);
      toast.success("Verification link sent! Check your inbox.");
      setResendCooldown(60);

      const interval = setInterval(() => {
        setResendCooldown((current) => {
          if (current <= 1) {
            clearInterval(interval);
            return 0;
          }

          return current - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to resend verification email.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        <Heart className="w-8 h-8 text-burgundy fill-burgundy" />
        <span className="font-playfair text-2xl font-bold text-burgundy">
          WedConnect
        </span>
      </div>

      <div className="space-y-4">
        <div className="w-16 h-16 bg-blush rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-burgundy" />
        </div>

        <h1 className="font-playfair text-2xl font-bold text-charcoal">
          Verify Your Email
        </h1>

        <p className="text-gray-600 text-sm max-w-sm mx-auto">
          We sent a verification link to your email. Click the link in the
          message to activate full wedding planning and vendor discovery access.
        </p>

        <form
          onSubmit={handleResend}
          className="mt-6 space-y-3 max-w-sm mx-auto text-left"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/70 mb-1">
              Email Address
            </label>

            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-sand bg-white text-charcoal focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isResending || resendCooldown > 0}
            className="w-full py-2.5 bg-burgundy text-white rounded-lg font-semibold hover:bg-burgundy/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isResending
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Verification Email"}
          </button>
        </form>

        <div className="pt-4 border-t border-sand/40">
          <Link
            to="/login"
            className="text-sm text-burgundy font-medium hover:underline inline-flex items-center gap-1"
          >
            Back to Sign In
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
