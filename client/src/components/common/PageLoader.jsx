import { Heart } from 'lucide-react';

export default function PageLoader({ message = 'Loading WedConnect...' }) {
  return (
    <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-full border-4 border-burgundy/20 border-t-burgundy animate-spin" />
        <Heart className="w-6 h-6 text-burgundy fill-burgundy absolute animate-pulse" />
      </div>
      <p className="font-playfair text-lg text-charcoal font-medium animate-pulse">{message}</p>
    </div>
  );
}
