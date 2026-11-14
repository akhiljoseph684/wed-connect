import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import PageLoader from "../components/common/PageLoader.jsx";
import { fetchPlatformSettings } from "../store/slices/platformSlice.js";

export const GlobalRoute = ({ requiresAuth = false, children }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const {
    isAuthenticated,
    user,
    loading: authLoading,
  } = useSelector((state) => state.auth);

  const {
    loading: settingsLoading,
    initialized,
    settings,
  } = useSelector((state) => state.platform);

  // Fetch platform settings once
  useEffect(() => {
    if (!initialized && !settingsLoading) {
      dispatch(fetchPlatformSettings());
    }
  }, [dispatch, initialized, settingsLoading]);

  // Wait until settings and authentication are initialized
  if (authLoading || !initialized || settingsLoading) {
    return <PageLoader />;
  }

  // Maintenance mode
  if (
    settings.maintenanceMode &&
    user?.role !== "admin" &&
    location.pathname !== "/maintenance"
  ) {
    return <Navigate to="/maintenance" replace />;
  }

  // Authentication required
  if (requiresAuth && (!isAuthenticated || !user)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Email verification required
  if (
    requiresAuth &&
    settings.enforceEmailVerification &&
    user &&
    !user.isEmailVerified
  ) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  return children ?? <Outlet />;
};

export default GlobalRoute;
