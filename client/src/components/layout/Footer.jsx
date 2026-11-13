import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-charcoal text-ivory-100 pt-16 pb-12 border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-burgundy to-rose flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 text-gold-300" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Wed<span className="text-gold font-normal">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-ivory-300/80 max-w-sm leading-relaxed">
              Discover. Connect. Plan. Celebrate. The all-in-one luxury wedding ecosystem connecting couples with acclaimed creators and premier wedding vendors worldwide.
            </p>
            <div className="flex items-center gap-4 text-gold pt-2">
              <a href="#" className="hover:text-white transition-colors" title="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors" title="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors" title="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Inspiration Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gold">Inspiration</h4>
            <ul className="space-y-2 text-sm text-ivory-300/80">
              <li><Link to="/explore" className="hover:text-white transition-colors">Explore Feed</Link></li>
              <li><Link to="/trending" className="hover:text-white transition-colors">Trending Weddings</Link></li>
              <li><Link to="/latest" className="hover:text-white transition-colors">Latest Concepts</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">All Categories</Link></li>
              <li><Link to="/invitations" className="hover:text-white transition-colors">Invitation Suites</Link></li>
            </ul>
          </div>

          {/* Marketplace Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gold">Marketplace</h4>
            <ul className="space-y-2 text-sm text-ivory-300/80">
              <li><Link to="/vendors" className="hover:text-white transition-colors">Find Vendors</Link></li>
              <li><Link to="/vendors/photography-cinema" className="hover:text-white transition-colors">Photographers</Link></li>
              <li><Link to="/vendors/venues-estates" className="hover:text-white transition-colors">Wedding Venues</Link></li>
              <li><Link to="/creators" className="hover:text-white transition-colors">Creator Discovery</Link></li>
              <li><Link to="/vendor/dashboard" className="hover:text-white transition-colors">List Your Business</Link></li>
            </ul>
          </div>

          {/* Planning & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gold">Planning & Support</h4>
            <ul className="space-y-2 text-sm text-ivory-300/80">
              <li><Link to="/my-wedding" className="hover:text-white transition-colors">Wedding Planner</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory-300/60 gap-4">
          <p>© {new Date().getFullYear()} WedConnect Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed with <Heart className="w-3.5 h-3.5 text-rose fill-rose" /> for extraordinary love stories worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
