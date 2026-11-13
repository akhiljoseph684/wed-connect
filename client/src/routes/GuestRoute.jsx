import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageLoader from '../components/common/PageLoader.jsx';

export const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <PageLoader />;
  }

  if (isAuthenticated && user) {
    if (user.role === 'admin' || user.role === 'moderator') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'vendor' || user.capabilities?.isVendor) {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    if (user.role === 'creator' || user.capabilities?.isCreator) {
      return <Navigate to="/creator/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
};

export default GuestRoute;
