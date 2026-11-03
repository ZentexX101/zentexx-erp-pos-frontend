import { Navigate, Outlet, useLocation } from "react-router";
import FullPageLoader from "../components/common/loaders/FullPageLoader";
import { getHomePath, ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import { useBranch } from "../hooks/useBranch";

// Guards logged-in pages. Without allowedRoles any logged-in user passes;
// e.g. <RoleBasedRoute allowedRoles={[ROLES.ADMIN]} /> restricts to admins.
// Waits for the session and the entered branch together, so a reload shows one loader, not two.
const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const { loading: branchLoading } = useBranch();
  const location = useLocation();

  if (loading || branchLoading) return <FullPageLoader />;

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePath(user)} replace />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
