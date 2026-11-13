import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  Users,
  Bookmark,
  PlusSquare,
  User,
  Settings,
  Bell,
  MessageSquare,
} from 'lucide-react';

export const UserLayout = () => {
  const userLinks = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard , exact: true },
    { label: 'For You Feed', to: '/feed/for-you', icon: Sparkles, exact: true },
    { label: 'Following', to: '/feed/following', icon: Users },
    { label: 'Trending', to: '/trending', icon: Compass },
    { label: 'Create Post', to: '/create-post', icon: PlusSquare },
    { label: 'Saved & Collections', to: '/saved', icon: Bookmark },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'Messages', to: '/messages', icon: MessageSquare },
    { label: 'My Profile', to: '/profile', icon: User },
    { label: 'Account Settings', to: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar title="Community Feed" links={userLinks} className="hidden md:flex" />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
