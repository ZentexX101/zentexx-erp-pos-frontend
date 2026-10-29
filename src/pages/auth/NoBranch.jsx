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
    <div>
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-neutral-900">You're not on a branch yet</h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        Hi {user.name}, your account works, but no branch has been assigned to it. Ask your admin to add you to a branch,
        then sign in again.
      </p>

      <Button
        variant="secondary"
        loading={loggingOut}
        className="mt-8 h-12 w-full lg:h-11"
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
