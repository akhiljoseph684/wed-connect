import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Mail, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import authService from "../../services/auth.service.js";

export default function VerifyEmailTokenPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    let active = true;

    const verifyEmail = async () => {
      try {
        await authService.verifyEmail(token);

        if (active) {
          setStatus("success");
          toast.success("Your email has been verified!");
          navigate("/")
        }
      } catch (err) {
        if (active) {
          setStatus("error");
          toast.error(
            err?.response?.data?.message ||
              "Verification link expired or invalid.",
          );
        }
      }
    };

    verifyEmail();

    return () => {
      active = false;
    };
  }, [token]);

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

      {status === "verifying" && (
        <div className="py-6">
          <div className="w-16 h-16 bg-blush rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mail className="w-8 h-8 text-burgundy" />
          </div>

          <h1 className="font-playfair text-2xl font-bold text-charcoal mb-2">
            Verifying Your Email...
          </h1>

          <p className="text-gray-500 text-sm mb-6">
            Please wait while we validate your verification link.
          </p>

          <div className="w-8 h-8 border-4 border-burgundy border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {status === "success" && (
        <div className="py-6">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>

          <h1 className="font-playfair text-2xl font-bold text-charcoal mb-2">
            Email Verified!
          </h1>

          <p className="text-gray-600 text-sm mb-6">
            Your email has been verified successfully. Your WedConnect account
            is now active.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-burgundy text-white rounded-lg font-semibold hover:bg-burgundy/90 transition-all shadow-soft flex items-center justify-center gap-2"
          >
            Continue to Sign In
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="py-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>

          <h1 className="font-playfair text-2xl font-bold text-charcoal mb-2">
            Verification Failed
          </h1>

          <p className="text-gray-600 text-sm mb-6">
            This verification link is invalid or has expired. Please request a
            new verification email.
          </p>

          <button
            onClick={() => navigate("/verify-email")}
            className="w-full py-3 bg-burgundy text-white rounded-lg font-semibold hover:bg-burgundy/90 transition-all"
          >
            Request New Verification Link
          </button>
        </div>
      )}
    </motion.div>
  );
}
