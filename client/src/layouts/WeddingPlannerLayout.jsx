import React from "react";
import { Outlet, useParams, NavLink } from "react-router-dom";
import Navbar from "../components/layout/Navbar.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import { useSelector } from "react-redux";
import {
  CalendarHeart,
  CheckSquare,
  DollarSign,
  Users,
  Store,
  Clock,
  Settings,
} from "lucide-react";

export const WeddingPlannerLayout = () => {
  const { planId } = useParams();
  const { activePlan } = useSelector((state) => state.weddingPlan);

  const currentId = planId || activePlan?._id || "default";

  const plannerLinks = [
    {
      label: "Wedding Plan List",
      to: "/my-wedding/",
      icon: CalendarHeart,
      exact: true,
    },
    {
      label: "Wedding Overview",
      to: `/my-wedding/${currentId}/overview`,
      icon: CalendarHeart,
      hide: currentId === "default",
    },
    {
      label: "Checklist & Tasks",
      to: `/my-wedding/${currentId}/tasks`,
      icon: CheckSquare,
      hide: currentId === "default",
    },
    {
      label: "Budget & Expenses",
      to: `/my-wedding/${currentId}/budget`,
      icon: DollarSign,
      hide: currentId === "default",
    },
    {
      label: "Guest List & RSVPs",
      to: `/my-wedding/${currentId}/guests`,
      icon: Users,
      hide: currentId === "default",
    },
    {
      label: "Shortlisted Vendors",
      to: `/my-wedding/${currentId}/vendors`,
      icon: Store,
      hide: currentId === "default",
    },
    {
      label: "Day-Of Timeline",
      to: `/my-wedding/${currentId}/timeline`,
      icon: Clock,
      hide: currentId === "default",
    },
    {
      label: "Workspace Settings",
      to: `/my-wedding/${currentId}/settings`,
      icon: Settings,
      hide: currentId === "default",
    },
  ];

  const visibleLinks = plannerLinks.filter((link) => !link.hide);

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          title="Wedding Workspace"
          links={visibleLinks}
          className="hidden md:flex"
        />

        {/* Mobile Navigation */}
        <nav className="md:hidden sticky top-0 z-30 bg-white border-b border-sand shadow-sm">
          <div className="px-3 pt-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-burgundy mb-2 px-1">
              Wedding Workspace
            </p>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {visibleLinks.map((link) => {
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

export default WeddingPlannerLayout;
