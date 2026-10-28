import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ROLE_LABELS } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { formatPhone } from "../../utils/phone";

const UserMenu = ({ changePasswordPath }) => {
  const { user, logout, logoutAll } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.type === "keydown" ? e.key === "Escape" : !menuRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  // RoleBasedRoute redirects to login once user is cleared
  const handleLogout = async (action) => {
    setLoggingOut(true);
    await action();
  };

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-slate-100"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
          {initials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-slate-900">{user.name}</span>
          <span className="block text-xs text-slate-500">
            {ROLE_LABELS[user.role] || user.role}
            {user.branch && ` · ${user.branch.name}`}
          </span>
        </span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-2 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-4 py-2">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email || formatPhone(user.phone)}</p>
          </div>
          <Link
            role="menuitem"
            to={changePasswordPath}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Change password
          </Link>
          <button
            role="menuitem"
            type="button"
            disabled={loggingOut}
            onClick={() => handleLogout(logout)}
            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Log out
          </button>
          <button
            role="menuitem"
            type="button"
            disabled={loggingOut}
            onClick={() => handleLogout(logoutAll)}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Log out from all devices
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
