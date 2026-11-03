import { Navigate, Outlet } from "react-router";
import FullPageLoader from "../components/common/loaders/FullPageLoader";
import { getHomePath } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

// Pages like login / forgot password: a logged-in user is sent to their dashboard
const GuestRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;

  if (user) {
    return <Navigate to={getHomePath(user)} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
