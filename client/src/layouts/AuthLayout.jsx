import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, Quote } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ivory">
      {/* Visual Editorial Half (Hidden on small screens) */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-3/5 bg-charcoal overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85"
          alt="Luxury wedding celebration"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />

        {/* Floating Editorial Quote */}
        <div className="relative z-10 p-12 lg:p-16 flex flex-col justify-between h-full text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-burgundy flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-gold-300" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-white">
              Wed<span className="text-gold font-normal">Connect</span>
            </span>
          </Link>

          <div className="max-w-md space-y-4">
            <Quote className="w-10 h-10 text-gold/80" />
            <p className="font-serif text-2xl lg:text-3xl font-light italic leading-snug">
              "Every detail of your wedding should tell the truth of who you are and who you love."
            </p>
            <p className="text-xs uppercase tracking-widest text-gold font-semibold">
              WedConnect Curated Living
            </p>
          </div>

          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} WedConnect. The home of luxury wedding discovery.
          </p>
        </div>
      </div>

      {/* Form Container Half */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile brand header */}
          <div className="md:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-burgundy flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-gold-300" />
              </div>
              <span className="font-serif text-2xl font-bold text-burgundy">
                Wed<span className="text-gold-600 font-normal">Connect</span>
              </span>
            </Link>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl p-8 border border-burgundy/10 shadow-luxury">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
