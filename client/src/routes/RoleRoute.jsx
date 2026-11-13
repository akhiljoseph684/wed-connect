import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageLoader from '../components/common/PageLoader.jsx';

export const RoleRoute = ({ children, roles = [], allowedRoles = [], requiredCapability = null }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const content = children ?? <Outlet />;

  // Administrators have full access
  if (user.role === 'admin') {
    return content;
  }

  const effectiveRoles = roles.length > 0 ? roles : allowedRoles;

  if (effectiveRoles.length > 0) {
    const isDirectRoleMatch = effectiveRoles.includes(user.role);
    const isVendorMatch = effectiveRoles.includes('vendor') && (user.role === 'vendor' || user.capabilities?.isVendor);
    const isCreatorMatch = effectiveRoles.includes('creator') && (user.role === 'creator' || user.capabilities?.isCreator);

    if (!isDirectRoleMatch && !isVendorMatch && !isCreatorMatch) {
      return <Navigate to="/403" replace />;
    }
  }

  if (requiredCapability && !user.capabilities?.[requiredCapability]) {
    return <Navigate to="/403" replace />;
  }

  return content;
};

export default RoleRoute;
