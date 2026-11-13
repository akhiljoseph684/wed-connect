import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice.js';
import {
  Search,
  Bell,
  MessageSquare,
  Sparkles,
  HeartHandshake,
  CalendarHeart,
  Menu,
  X,
  User,
  ShieldCheck,
  Briefcase,
  Camera,
  LogOut,
} from 'lucide-react';
import Button from '../common/Button.jsx';

export const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };
  const avatarUrl =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=7D1E3B&color=fff&size=200`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-burgundy/10 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-burgundy to-rose flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 text-gold-300" />
          </div>
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight text-burgundy">
              Wed<span className="text-gold-600 font-normal">Connect</span>
            </span>
            <span className="hidden sm:block text-[9px] uppercase tracking-widest text-mutedGray -mt-1 font-sans">
              Luxury Wedding Ecosystem
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-mutedGray absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search wedding venues, photographers, gowns, themes..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-ivory-100 border border-charcoal/10 text-charcoal placeholder:text-mutedGray focus:outline-none focus:border-burgundy focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-charcoal/85">
          <Link to="/explore" className="hover:text-burgundy transition-colors">
            Inspiration
          </Link>
          <Link to="/categories" className="hover:text-burgundy transition-colors">
            Categories
          </Link>
          <Link to="/vendors" className="hover:text-burgundy transition-colors">
            Marketplace
          </Link>
          <Link to="/creators" className="hover:text-burgundy transition-colors">
            Creators
          </Link>
          <Link to="/my-wedding" className="flex items-center gap-1.5 text-burgundy font-semibold hover:text-burgundy-600 transition-colors">
            <CalendarHeart className="w-4 h-4 text-rose" />
            <span>Wedding Planner</span>
          </Link>
        </nav>

        {/* Auth / Profile Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/notifications"
                className="relative p-2 rounded-full text-charcoal hover:bg-rose-50 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-burgundy text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <Link
                to="/messages"
                className="p-2 rounded-full text-charcoal hover:bg-rose-50 transition-colors"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-burgundy/20 hover:border-burgundy transition-colors"
                >
                  <img
                    src={avatarUrl}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl glass-dropdown shadow-luxury border border-burgundy/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-charcoal/5 mb-1">
                      <p className="text-sm font-semibold text-charcoal">{user.displayName || user.firstName}</p>
                      <p className="text-xs text-mutedGray truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-charcoal hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-burgundy" />
                      Home Feed
                    </Link>

                    <Link
                      to="/my-wedding"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-charcoal hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <CalendarHeart className="w-4 h-4 text-rose" />
                      My Wedding Workspace
                    </Link>

                    <Link
                      to="/creator/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-charcoal hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Camera className="w-4 h-4 text-gold-600" />
                      Creator Studio
                    </Link>

                    <Link
                      to="/vendor/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-charcoal hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-charcoal" />
                      Vendor Business Hub
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-burgundy font-semibold hover:bg-burgundy/5 rounded-lg transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-burgundy" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-charcoal hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4 text-mutedGray" />
                      My Profile & Saved
                    </Link>

                    <div className="pt-1 mt-1 border-t border-charcoal/5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Join WedConnect
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-charcoal hover:text-burgundy"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-burgundy/10 px-4 pt-2 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-mutedGray absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-ivory-100 border border-charcoal/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-charcoal hover:text-burgundy"
          >
            Inspiration
          </Link>
          <Link
            to="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-charcoal hover:text-burgundy"
          >
            Categories
          </Link>
          <Link
            to="/vendors"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-charcoal hover:text-burgundy"
          >
            Marketplace
          </Link>
          <Link
            to="/creators"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-charcoal hover:text-burgundy"
          >
            Creators
          </Link>
          <Link
            to="/my-wedding"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-burgundy"
          >
            Wedding Planner Workspace
          </Link>

          {!isAuthenticated && (
            <div className="pt-4 border-t border-charcoal/5 flex gap-2">
              <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
