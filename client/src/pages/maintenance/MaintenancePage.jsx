import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

/**
 * MaintenancePage – displayed when the platform is in maintenance mode.
 *
 * Design matches the WedConnect theme:
 *   - Warm ivory background (`bg-ivory` – defined in Tailwind config)
 *   - Deep burgundy accents (`text-burgundy` / `border-burgundy`)
 *   - Simple illustration using an icon.
 */
export default function MaintenancePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-ivory flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full text-center bg-white rounded-xl shadow-lg border border-burgundy/20 p-8">
        <AlertCircle className="mx-auto w-16 h-16 text-burgundy mb-4" />
        <h1 className="font-playfair text-3xl font-bold text-burgundy mb-3">
          We'll Be Back Soon!
        </h1>
        <p className="text-gray-600 text-base mb-6">
          We're currently making improvements to WedConnect. We'll be back shortly!
        </p>
        <p className="text-xs text-gray-500">
          Thank you for your patience.
        </p>
      </div>
    </motion.div>
  );
}
