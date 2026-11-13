import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import {
  LayoutDashboard,
  Store,
  ShieldCheck,
  PackageCheck,
  Image,
  Inbox,
  Star,
  CalendarCheck2,
  BarChart2,
  Settings,
} from 'lucide-react';

export const VendorLayout = () => {
  const vendorLinks = [
    { label: 'Vendor Dashboard', to: '/vendor/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Business Profile', to: '/vendor/profile', icon: Store },
    { label: 'Services & Packages', to: '/vendor/services', icon: PackageCheck },
    { label: 'Client Enquiries', to: '/vendor/enquiries', icon: Inbox },
    { label: 'Portfolio Gallery', to: '/vendor/portfolio', icon: Image },
    { label: 'Reviews & Ratings', to: '/vendor/reviews', icon: Star },
    { label: 'Calendar Availability', to: '/vendor/availability', icon: CalendarCheck2 },
    { label: 'Business Verification', to: '/vendor/verification', icon: ShieldCheck },
    { label: 'Performance Analytics', to: '/vendor/analytics', icon: BarChart2 },
    { label: 'Storefront Settings', to: '/vendor/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar title="Vendor Business Hub" links={vendorLinks} className="hidden md:flex" />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
