import React from "react";
import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import Navbar from "../components/layout/Navbar.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import {
  LayoutDashboard,
  User,
  Image,
  FileText,
  HeartHandshake,
  BarChart3,
  Settings,
} from "lucide-react";

export const CreatorLayout = () => {
  const creatorLinks = [
    {
      label: "Overview",
      to: "/creator/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    { label: "Creator Profile", to: "/creator/profile", icon: User },
    { label: "Portfolio Gallery", to: "/creator/portfolio", icon: Image },
    { label: "Published Posts", to: "/creator/posts", icon: FileText },
    {
      label: "Collaborations",
      to: "/creator/collaborations",
      icon: HeartHandshake,
    },
    { label: "Growth Analytics", to: "/creator/analytics", icon: BarChart3 },
    { label: "Creator Settings", to: "/creator/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          title="Creator Studio"
          links={creatorLinks}
          className="hidden md:flex"
        />

        {/* Mobile Navigation */}
        <nav className="md:hidden sticky top-0 z-30 bg-white border-b border-sand shadow-sm">
          <div className="px-3 pt-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-burgundy mb-2 px-1">
              Creator Studio
            </p>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {creatorLinks.map((link) => {
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

export default CreatorLayout;
