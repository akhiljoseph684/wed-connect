import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Bell, MessageSquare, Plus, ExternalLink } from 'lucide-react';
import Button from '../common/Button.jsx';

export const DashboardHeader = ({ title, subtitle, actionButton }) => {
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  return (
    <div className="bg-white border-b border-burgundy/10 px-6 py-5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">{title}</h1>
          {subtitle && <p className="text-xs text-mutedGray mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {actionButton}

          <Link
            to="/notifications"
            className="relative p-2 rounded-xl border border-charcoal/10 hover:bg-ivory-100 text-charcoal transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-burgundy text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link
            to="/messages"
            className="p-2 rounded-xl border border-charcoal/10 hover:bg-ivory-100 text-charcoal transition-colors"
            title="Messages"
          >
            <MessageSquare className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
