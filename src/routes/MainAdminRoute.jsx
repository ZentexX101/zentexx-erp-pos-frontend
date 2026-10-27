import { Navigate, Outlet } from "react-router";
import { isMainAdmin } from "../constants/roles";
import { getHomePath } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

// Main admin panel. Use inside RoleBasedRoute (which handles loading / not logged in);
// branch staff are sent to their branch panel.
const MainAdminRoute = () => {
  const { user } = useAuth();

  if (!isMainAdmin(user)) return <Navigate to={getHomePath(user)} replace />;

  return <Outlet />;
};

export default MainAdminRoute;
