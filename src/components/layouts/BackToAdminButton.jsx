import { LuUndo2 } from "react-icons/lu";
import { useNavigate } from "react-router";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

// Top-bar button shown only while a main admin uses the app as a staff member ("Login as")
const BackToAdminButton = () => {
  const { user, impersonator, returnToAdmin } = useAuth();
  const navigate = useNavigate();

  if (!impersonator || !user) return null;

  const handleBack = async () => {
    const admin = await returnToAdmin();
    navigate(admin ? ROUTES.STAFF : ROUTES.LOGIN, { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      title={`You're logged in as ${user.name}. Go back to ${impersonator.name}.`}
      className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 sm:px-3"
    >
      <LuUndo2 className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">Back to Admin</span>
    </button>
  );
};

export default BackToAdminButton;
