import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import {
  ShieldAlert,
  Users,
  Store,
  Camera,
  ShieldCheck,
  Flag,
  Tag,
  History,
  Settings,
} from 'lucide-react';

export const AdminLayout = () => {
  const adminLinks = [
    { label: 'Admin Overview', to: '/admin/dashboard', icon: ShieldAlert, exact: true },
    { label: 'User Directory', to: '/admin/users', icon: Users },
    { label: 'Vendor Directory', to: '/admin/vendors', icon: Store },
    { label: 'Creator Directory', to: '/admin/creators', icon: Camera },
    { label: 'Verification Queue', to: '/admin/verifications', icon: ShieldCheck },
    { label: 'Moderation Reports', to: '/admin/reports', icon: Flag },
    { label: 'Taxonomy Categories', to: '/admin/categories', icon: Tag },
    { label: 'Security Audit Logs', to: '/admin/audit-logs', icon: History },
    { label: 'Platform Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar title="Platform Administration" links={adminLinks} className="hidden md:flex" />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
