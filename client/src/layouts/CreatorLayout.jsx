import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import {
  LayoutDashboard,
  User,
  Image,
  FileText,
  HeartHandshake,
  BarChart3,
  Settings,
} from 'lucide-react';

export const CreatorLayout = () => {
  const creatorLinks = [
    { label: 'Overview', to: '/creator/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Creator Profile', to: '/creator/profile', icon: User },
    { label: 'Portfolio Gallery', to: '/creator/portfolio', icon: Image },
    { label: 'Published Posts', to: '/creator/posts', icon: FileText },
    { label: 'Collaborations', to: '/creator/collaborations', icon: HeartHandshake },
    { label: 'Growth Analytics', to: '/creator/analytics', icon: BarChart3 },
    { label: 'Creator Settings', to: '/creator/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar title="Creator Studio" links={creatorLinks} className="hidden md:flex" />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CreatorLayout;
