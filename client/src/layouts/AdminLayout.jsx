import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import Navbar from "../components/layout/Navbar.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
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
} from "lucide-react";

export const AdminLayout = () => {
  const adminLinks = [
    {
      label: "Admin Overview",
      to: "/admin/dashboard",
      icon: ShieldAlert,
      exact: true,
    },
    { label: "User Directory", to: "/admin/users", icon: Users },
    { label: "Vendor Directory", to: "/admin/vendors", icon: Store },
    { label: "Creator Directory", to: "/admin/creators", icon: Camera },
    {
      label: "Verification Queue",
      to: "/admin/verifications",
      icon: ShieldCheck,
    },
    { label: "Moderation Reports", to: "/admin/reports", icon: Flag },
    { label: "Taxonomy Categories", to: "/admin/categories", icon: Tag },
    { label: "Security Audit Logs", to: "/admin/audit-logs", icon: History },
    { label: "Platform Settings", to: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          title="Platform Administration"
          links={adminLinks}
          className="hidden md:flex"
        />

        {/* Mobile Navigation */}
        <nav className="md:hidden sticky top-0 z-30 bg-white border-b border-sand shadow-sm">
          <div className="px-3 pt-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-burgundy mb-2 px-1">
              Platform Administration
            </p>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {adminLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                        isActive
                          ? "bg-burgundy text-white shadow-sm"
                          : "text-gray-600 bg-ivory hover:bg-burgundy/5 hover:text-burgundy"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {link.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 min-w-0 w-full p-3 sm:p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
