import { Navigate, Outlet } from "react-router";
import FullPageLoader from "../components/common/loaders/FullPageLoader";
import { isMainAdmin } from "../constants/roles";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import { useBranch } from "../hooks/useBranch";

// Branch panel. Use inside RoleBasedRoute. A main admin who hasn't entered
// a branch goes back to the branch list.
const BranchRoute = () => {
  const { user } = useAuth();
  const { activeBranch, loading } = useBranch();

  if (loading) return <FullPageLoader />;

  if (!activeBranch) {
    return <Navigate to={isMainAdmin(user) ? ROUTES.BRANCHES : ROUTES.NO_BRANCH} replace />;
  }

  return <Outlet />;
};

export default BranchRoute;
