import React from "react";
import { Outlet, useParams } from "react-router-dom";
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
  Sparkles,
} from "lucide-react";

export const WeddingPlannerLayout = () => {
  const { planId } = useParams();
  const { activePlan } = useSelector((state) => state.weddingPlan);
  const currentId = planId || activePlan?._id || "default";

  const plannerLinks = [
    {
      label: "Wedding Plan List",
      to: `/my-wedding/`,
      icon: CalendarHeart,
      exact: true,
    },
    {
      label: "Wedding Overview",
      to: `/my-wedding/${currentId}/overview`,
      icon: CalendarHeart,
      hide: currentId === "default"
    },
    {
      label: "Checklist & Tasks",
      to: `/my-wedding/${currentId}/tasks`,
      icon: CheckSquare,
      hide: currentId === "default"
    },
    {
      label: "Budget & Expenses",
      to: `/my-wedding/${currentId}/budget`,
      icon: DollarSign,
      hide: currentId === "default"
    },
    {
      label: "Guest List & RSVPs",
      to: `/my-wedding/${currentId}/guests`,
      icon: Users,
      hide: currentId === "default"
    },
    {
      label: "Shortlisted Vendors",
      to: `/my-wedding/${currentId}/vendors`,
      icon: Store,
      hide: currentId === "default"
    },
    {
      label: "Day-Of Timeline",
      to: `/my-wedding/${currentId}/timeline`,
      icon: Clock,
      hide: currentId === "default"
    },
    {
      label: "Workspace Settings",
      to: `/my-wedding/${currentId}/settings`,
      icon: Settings,
      hide: currentId === "default"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          title="Wedding Workspace"
          links={plannerLinks}
          className="hidden md:flex"
        />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default WeddingPlannerLayout;
