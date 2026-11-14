import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageLoader from '../components/common/PageLoader.jsx';

export const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <PageLoader />;
  }

  if (isAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
};

export default GuestRoute;
