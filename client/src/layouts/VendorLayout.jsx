import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/layout/Navbar.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
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
  Clock,
} from "lucide-react";
import businessService from "../services/business.service.js";

export const VendorLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const [business, setBusiness] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    businessService
      .getMyBusiness()
      .then((res) => {
        setBusiness(res.data?.business || res.data);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const isAdmin = user?.role === "admin";

  const isApproved =
    business?.verificationStatus === "approved" ||
    Boolean(user?.capabilities?.isVendor);

  const isVerificationPage = location.pathname.includes("/vendor/verification");

  const vendorLinks = [
    {
      label: "Vendor Dashboard",
      to: "/vendor/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    { label: "Business Profile", to: "/vendor/profile", icon: Store },
    {
      label: "Services & Packages",
      to: "/vendor/services",
      icon: PackageCheck,
    },
    { label: "Client Enquiries", to: "/vendor/enquiries", icon: Inbox },
    { label: "Portfolio Gallery", to: "/vendor/portfolio", icon: Image },
    { label: "Reviews & Ratings", to: "/vendor/reviews", icon: Star },
    {
      label: "Calendar Availability",
      to: "/vendor/availability",
      icon: CalendarCheck2,
    },
    {
      label: "Business Verification",
      to: "/vendor/verification",
      icon: ShieldCheck,
    },
    {
      label: "Performance Analytics",
      to: "/vendor/analytics",
      icon: BarChart2,
    },
    { label: "Storefront Settings", to: "/vendor/settings", icon: Settings },
  ];

  // Restrict navigation for unapproved vendors.
  const visibleVendorLinks =
    isAdmin || isApproved
      ? vendorLinks
      : vendorLinks.filter((link) => link.to === "/vendor/verification");

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          title="Vendor Business Hub"
          links={visibleVendorLinks}
          className="hidden md:flex"
        />

        {/* Mobile Navigation */}
        <nav className="md:hidden sticky top-0 z-30 bg-white border-b border-sand shadow-sm">
          <div className="px-3 pt-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-burgundy mb-2 px-1">
              Vendor Business Hub
            </p>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {visibleVendorLinks.map((link) => {
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

        {/* Main Content */}
        <main className="flex-1 min-w-0 w-full p-3 sm:p-5 lg:p-8">
          {!isAdmin && !isApproved && !checking && !isVerificationPage ? (
            <div className="max-w-xl mx-auto my-8 sm:my-12 bg-white rounded-2xl p-5 sm:p-8 border border-sand shadow-soft text-center space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <h2 className="font-playfair text-xl sm:text-2xl font-bold text-charcoal">
                Storefront Verification Required
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Your business profile is currently in{" "}
                <strong className="capitalize">
                  {business?.verificationStatus || "pending"}
                </strong>{" "}
                review. Full vendor dashboard tools (active packages, client
                inquiries, and live marketplace discovery) are unlocked once
                your business license and insurance documents have been approved
                by WedConnect administrators.
              </p>

              <div className="pt-2">
                <Link
                  to="/vendor/verification"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 bg-burgundy text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-burgundy/90 transition shadow-soft"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Go to Verification Portal
                </Link>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
