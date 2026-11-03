import { useCallback, useRef, useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { ROLE_LABELS } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { useDismiss } from "../../hooks/useDismiss";
import { getInitials } from "../../utils/initials";
import AccountMenu from "./AccountMenu";

// Avatar button in the top bar with the account menu
const UserMenu = ({ mode }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(menuRef, open, close);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={`flex items-center gap-2.5 rounded-lg p-1 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand/20 md:pr-2.5 ${open ? "bg-slate-100" : ""}`}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white ring-2 ring-white shadow-sm">
          {getInitials(user.name)}
        </span>
        <span className="hidden text-left leading-tight md:block">
          <span className="block max-w-40 truncate text-sm font-semibold text-slate-900">{user.name}</span>
          <span className="block text-xs text-slate-500">{ROLE_LABELS[user.role] || user.role}</span>
        </span>
        <LuChevronDown className={`hidden size-4 text-slate-400 transition-transform md:block ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && <AccountMenu mode={mode} onClose={close} className="absolute right-0 top-full mt-2 w-64 origin-top-right" />}
    </div>
  );
};

export default UserMenu;
