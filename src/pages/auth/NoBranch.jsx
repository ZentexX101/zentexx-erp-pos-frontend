import { useState } from "react";
import { Navigate } from "react-router";
import Button from "../../components/common/buttons/Button";
import { getHomePath, ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

// For approved manager / staff accounts that an admin hasn't assigned to a branch yet
const NoBranch = () => {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const home = getHomePath(user);
  if (home !== ROUTES.NO_BRANCH) return <Navigate to={home} replace />;

  return (
    <div className="text-center">
      <h2 className="mb-2 text-lg font-semibold text-slate-900">No branch assigned</h2>
      <p className="mb-6 text-sm text-slate-500">
        Hi {user.name}, your account isn't assigned to a branch yet. Ask an admin to assign you to one, then sign in
        again.
      </p>
      <Button
        variant="secondary"
        loading={loggingOut}
        onClick={() => {
          setLoggingOut(true);
          logout();
        }}
      >
        Sign out
      </Button>
    </div>
  );
};

export default NoBranch;
