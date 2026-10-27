import { Navigate, Outlet, useLocation } from "react-router";
import FullPageLoader from "../components/common/loaders/FullPageLoader";
import { getHomePath } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

// Pages like login / forgot password: a logged-in user is sent back where they came from
const GuestRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;

  if (user) {
    return <Navigate to={location.state?.from?.pathname || getHomePath(user)} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
