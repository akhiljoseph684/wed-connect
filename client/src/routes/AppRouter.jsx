import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Layouts
import PublicLayout from "../layouts/PublicLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import UserLayout from "../layouts/UserLayout.jsx";
import WeddingPlannerLayout from "../layouts/WeddingPlannerLayout.jsx";
import VendorLayout from "../layouts/VendorLayout.jsx";
import CreatorLayout from "../layouts/CreatorLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";

// Route Guards
import GlobalRoute from "./GlobalRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";
import GuestRoute from "./GuestRoute.jsx";

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-ivory flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-burgundy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="font-playfair text-burgundy text-lg">
        Loading WedConnect...
      </p>
    </div>
  </div>
);

// Public pages
import MaintenancePage from "../pages/maintenance/MaintenancePage.jsx";
import LandingPage from "../pages/public/LandingPage.jsx";
import ExplorePage from "../pages/public/ExplorePage.jsx";
import CategoriesPage from "../pages/public/CategoriesPage.jsx";
import CategoryDetailsPage from "../pages/public/CategoryDetailsPage.jsx";
import VendorsPage from "../pages/public/VendorsPage.jsx";
import VendorDetailPage from "../pages/public/VendorDetailPage.jsx";
import CreatorsPage from "../pages/public/CreatorsPage.jsx";
import CreatorProfilePage from "../pages/public/CreatorProfilePage.jsx";
import PostDetailPage from "../pages/public/PostDetailPage.jsx";
import InvitationsPage from "../pages/public/InvitationsPage.jsx";
import CreateBusinessPage from "../pages/public/CreateBusinessPage.jsx";
import VerifyEmailTokenPage from "../pages/auth/VerifyEmailTokenPage.jsx";

// Auth pages - lazy loaded
const LoginPage = lazy(() => import("../pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage.jsx"));
const ForgotPasswordPage = lazy(
  () => import("../pages/auth/ForgotPasswordPage.jsx"),
);
const ResetPasswordPage = lazy(
  () => import("../pages/auth/ResetPasswordPage.jsx"),
);
const EmailVerificationPage = lazy(
  () => import("../pages/auth/EmailVerificationPage.jsx"),
);

// System / search pages
const SearchPage = lazy(() => import("../pages/public/SearchPage.jsx"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage.jsx"));
const AccessDeniedPage = lazy(() => import("../pages/AccessDeniedPage.jsx"));

// User dashboard pages
const DashboardPage = lazy(() => import("../pages/user/DashboardPage.jsx"));
const ForYouFeedPage = lazy(() => import("../pages/user/ForYouFeedPage.jsx"));
const FollowingFeedPage = lazy(
  () => import("../pages/user/FollowingFeedPage.jsx"),
);
const ProfilePage = lazy(() => import("../pages/user/ProfilePage.jsx"));
const EditProfilePage = lazy(() => import("../pages/user/EditProfilePage.jsx"));
const SavedCollectionsPage = lazy(
  () => import("../pages/user/SavedCollectionsPage.jsx"),
);
const CollectionDetailPage = lazy(
  () => import("../pages/user/CollectionDetailPage.jsx"),
);
const NotificationsPage = lazy(
  () => import("../pages/user/NotificationsPage.jsx"),
);
const MessagesPage = lazy(() => import("../pages/user/MessagesPage.jsx"));
const ConversationPage = lazy(
  () => import("../pages/user/ConversationPage.jsx"),
);
const SettingsPage = lazy(() => import("../pages/user/SettingsPage.jsx"));
const CreatePostPage = lazy(() => import("../pages/user/CreatePostPage.jsx"));
const UserPublicProfilePage = lazy(
  () => import("../pages/user/UserPublicProfilePage.jsx"),
);

// Wedding planner pages
const WeddingPlansListPage = lazy(
  () => import("../pages/wedding/WeddingPlansListPage.jsx"),
);
const CreateWeddingPlanPage = lazy(
  () => import("../pages/wedding/CreateWeddingPlanPage.jsx"),
);
const WeddingOverviewPage = lazy(
  () => import("../pages/wedding/WeddingOverviewPage.jsx"),
);
const TasksPage = lazy(() => import("../pages/wedding/TasksPage.jsx"));
const BudgetPage = lazy(() => import("../pages/wedding/BudgetPage.jsx"));
const GuestsPage = lazy(() => import("../pages/wedding/GuestsPage.jsx"));
const ShortlistedVendorsPage = lazy(
  () => import("../pages/wedding/ShortlistedVendorsPage.jsx"),
);
const TimelinePage = lazy(() => import("../pages/wedding/TimelinePage.jsx"));
const WeddingSettingsPage = lazy(
  () => import("../pages/wedding/WeddingSettingsPage.jsx"),
);

// Vendor pages
const VendorOverviewPage = lazy(
  () => import("../pages/vendor/VendorOverviewPage.jsx"),
);
const VendorProfilePage = lazy(
  () => import("../pages/vendor/VendorProfilePage.jsx"),
);
const VendorServicesPage = lazy(
  () => import("../pages/vendor/VendorServicesPage.jsx"),
);
const VendorPortfolioPage = lazy(
  () => import("../pages/vendor/VendorPortfolioPage.jsx"),
);
const VendorEnquiriesPage = lazy(
  () => import("../pages/vendor/VendorEnquiriesPage.jsx"),
);
const EnquiryDetailPage = lazy(
  () => import("../pages/vendor/EnquiryDetailPage.jsx"),
);
const VendorReviewsPage = lazy(
  () => import("../pages/vendor/VendorReviewsPage.jsx"),
);
const AvailabilityPage = lazy(
  () => import("../pages/vendor/AvailabilityPage.jsx"),
);
const VerificationPage = lazy(
  () => import("../pages/vendor/VerificationPage.jsx"),
);
const VendorAnalyticsPage = lazy(
  () => import("../pages/vendor/VendorAnalyticsPage.jsx"),
);
const VendorSettingsPage = lazy(
  () => import("../pages/vendor/VendorSettingsPage.jsx"),
);

// Creator pages
const CreatorOverviewPage = lazy(
  () => import("../pages/creator/CreatorOverviewPage.jsx"),
);
const CreatorProfileEditPage = lazy(
  () => import("../pages/creator/CreatorProfileEditPage.jsx"),
);
const CreatorPortfolioPage = lazy(
  () => import("../pages/creator/CreatorPortfolioPage.jsx"),
);
const CreatorPostsPage = lazy(
  () => import("../pages/creator/CreatorPostsPage.jsx"),
);
const CollaborationsPage = lazy(
  () => import("../pages/creator/CollaborationsPage.jsx"),
);
const CreatorAnalyticsPage = lazy(
  () => import("../pages/creator/CreatorAnalyticsPage.jsx"),
);
const CreatorSettingsPage = lazy(
  () => import("../pages/creator/CreatorSettingsPage.jsx"),
);

// Admin pages
const AdminOverviewPage = lazy(
  () => import("../pages/admin/AdminOverviewPage.jsx"),
);
const UserManagementPage = lazy(
  () => import("../pages/admin/UserManagementPage.jsx"),
);
const VendorManagementPage = lazy(
  () => import("../pages/admin/VendorManagementPage.jsx"),
);
const CreatorManagementPage = lazy(
  () => import("../pages/admin/CreatorManagementPage.jsx"),
);
const VerificationQueuePage = lazy(
  () => import("../pages/admin/VerificationQueuePage.jsx"),
);
const CategoryManagementPage = lazy(
  () => import("../pages/admin/CategoryManagementPage.jsx"),
);
const ReportsPage = lazy(() => import("../pages/admin/ReportsPage.jsx"));
const AuditLogsPage = lazy(() => import("../pages/admin/AuditLogsPage.jsx"));
const AdminSettingsPage = lazy(
  () => import("../pages/admin/AdminSettingsPage.jsx"),
);

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage feedType="explore" />} />
          <Route
            path="/trending"
            element={<ExplorePage feedType="trending" />}
          />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryDetailsPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/vendors/:slug" element={<VendorDetailPage />} />
          <Route path="/creators" element={<CreatorsPage />} />
          <Route path="/creators/:username" element={<CreatorProfilePage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/invitations" element={<InvitationsPage />} />
          <Route path="/create-business" element={<CreateBusinessPage />} />
          <Route path="/users/:userId" element={<UserPublicProfilePage />} />
        </Route>

        {/* Auth Routes */}
        {/* Maintenance Route */}
        <Route element={<PublicLayout />}>
          <Route path="/maintenance" element={<MaintenancePage />} />
        </Route>

        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/verify-email" element={<EmailVerificationPage />} />

          <Route
            path="/verify-email/:token"
            element={<VerifyEmailTokenPage />}
          />
        </Route>

        {/* User Dashboard Routes */}
        <Route element={<GlobalRoute requiresAuth={true} />}>
          <Route element={<UserLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/feed/for-you" element={<ForYouFeedPage />} />
            <Route path="/feed/following" element={<FollowingFeedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/saved" element={<SavedCollectionsPage />} />
            <Route path="/collections/:id" element={<CollectionDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route
              path="/messages/:conversationId"
              element={<ConversationPage />}
            />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Wedding Planner Routes */}
        <Route element={<GlobalRoute requiresAuth={true} />}>
          <Route element={<WeddingPlannerLayout />}>
            <Route path="/my-wedding" element={<WeddingPlansListPage />} />
            <Route path="/my-wedding/new" element={<CreateWeddingPlanPage />} />
            <Route
              path="/my-wedding/:planId/overview"
              element={<WeddingOverviewPage />}
            />
            <Route path="/my-wedding/:planId/tasks" element={<TasksPage />} />
            <Route path="/my-wedding/:planId/budget" element={<BudgetPage />} />
            <Route path="/my-wedding/:planId/guests" element={<GuestsPage />} />
            <Route
              path="/my-wedding/:planId/vendors"
              element={<ShortlistedVendorsPage />}
            />
            <Route
              path="/my-wedding/:planId/timeline"
              element={<TimelinePage />}
            />
            <Route
              path="/my-wedding/:planId/settings"
              element={<WeddingSettingsPage />}
            />
          </Route>
        </Route>

        {/* Vendor Routes */}
        <Route element={<GlobalRoute requiresAuth={true} />}>
          <Route element={<RoleRoute allowedRoles={["vendor", "admin"]} />}>
            <Route element={<VendorLayout />}>
              <Route
                path="/vendor/dashboard"
                element={<VendorOverviewPage />}
              />
              <Route path="/vendor/profile" element={<VendorProfilePage />} />
              <Route path="/vendor/services" element={<VendorServicesPage />} />
              <Route
                path="/vendor/portfolio"
                element={<VendorPortfolioPage />}
              />
              <Route
                path="/vendor/enquiries"
                element={<VendorEnquiriesPage />}
              />
              <Route
                path="/vendor/enquiries/:id"
                element={<EnquiryDetailPage />}
              />
              <Route path="/vendor/reviews" element={<VendorReviewsPage />} />
              <Route
                path="/vendor/availability"
                element={<AvailabilityPage />}
              />
              <Route
                path="/vendor/verification"
                element={<VerificationPage />}
              />
              <Route
                path="/vendor/analytics"
                element={<VendorAnalyticsPage />}
              />
              <Route path="/vendor/settings" element={<VendorSettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Creator Routes */}
        <Route element={<GlobalRoute requiresAuth={true} />}>
          <Route element={<RoleRoute allowedRoles={["creator", "admin"]} />}>
            <Route element={<CreatorLayout />}>
              <Route
                path="/creator/dashboard"
                element={<CreatorOverviewPage />}
              />
              <Route
                path="/creator/profile"
                element={<CreatorProfileEditPage />}
              />
              <Route
                path="/creator/portfolio"
                element={<CreatorPortfolioPage />}
              />
              <Route path="/creator/posts" element={<CreatorPostsPage />} />
              <Route
                path="/creator/collaborations"
                element={<CollaborationsPage />}
              />
              <Route
                path="/creator/analytics"
                element={<CreatorAnalyticsPage />}
              />
              <Route
                path="/creator/settings"
                element={<CreatorSettingsPage />}
              />
            </Route>
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<GlobalRoute requiresAuth={true} />}>
          <Route element={<RoleRoute allowedRoles={["admin", "moderator"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminOverviewPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/vendors" element={<VendorManagementPage />} />
              <Route
                path="/admin/creators"
                element={<CreatorManagementPage />}
              />
              <Route
                path="/admin/verifications"
                element={<VerificationQueuePage />}
              />
              <Route
                path="/admin/categories"
                element={<CategoryManagementPage />}
              />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Error Routes */}
        <Route path="/403" element={<AccessDeniedPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
