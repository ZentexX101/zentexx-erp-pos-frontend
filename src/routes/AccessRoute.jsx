import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { canAccess } from "../utils/access";

// Shows a panel page only if the user has its role / permission; otherwise back to the panel home
const AccessRoute = ({ page, fallback, children }) => {
  const { user } = useAuth();

  if (!canAccess(user, page)) return <Navigate to={fallback} replace />;

  return children;
};

export default AccessRoute;
