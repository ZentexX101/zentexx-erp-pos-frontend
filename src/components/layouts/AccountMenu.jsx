import { useState } from "react";
import { LuLogOut, LuSettings } from "react-icons/lu";
import { Link } from "react-router";
import { ROLE_LABELS } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { formatPhone } from "../../utils/phone";

const menuItemClass = "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors disabled:opacity-60";

// The account dropdown panel (user details + settings / logout). Position and size it with className.
const AccountMenu = ({ mode, onClose, className = "" }) => {
  const { user, logout, logoutAll } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  // RoleBasedRoute redirects to login once user is cleared
  const handleLogout = async (action) => {
    setLoggingOut(true);
    await action();
  };

  return (
    <div role="menu" className={`z-50 animate-zoom-in rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 ${className}`}>
      <div className="px-3 py-2.5">
        <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
        <p className="truncate text-xs text-slate-500">{formatPhone(user.phone)}</p>
        <p className="mt-1.5 truncate text-xs text-slate-500">
          {ROLE_LABELS[user.role] || user.role}
          {user.branch && ` · ${user.branch.name}`}
        </p>
      </div>

      <div className="my-1 h-px bg-slate-100" />

      <Link
        role="menuitem"
        to={mode === "branch" ? ROUTES.BRANCH_SETTINGS : ROUTES.SETTINGS}
        onClick={onClose}
        className={`${menuItemClass} text-slate-700 hover:bg-slate-100`}
      >
        <LuSettings className="size-4 text-slate-500" aria-hidden="true" />
        Settings
      </Link>
      <button
        role="menuitem"
        type="button"
        disabled={loggingOut}
        onClick={() => handleLogout(logout)}
        className={`${menuItemClass} text-slate-700 hover:bg-slate-100`}
      >
        <LuLogOut className="size-4 text-slate-500" aria-hidden="true" />
        Log out
      </button>

      <div className="my-1 h-px bg-slate-100" />

      <button
        role="menuitem"
        type="button"
        disabled={loggingOut}
        onClick={() => handleLogout(logoutAll)}
        className={`${menuItemClass} text-red-600 hover:bg-red-50`}
      >
        <LuLogOut className="size-4" aria-hidden="true" />
        Log out from all devices
      </button>
    </div>
  );
};

export default AccountMenu;
