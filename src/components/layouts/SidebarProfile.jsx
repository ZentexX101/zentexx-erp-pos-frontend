import { useCallback, useRef, useState } from "react";
import { LuEllipsisVertical } from "react-icons/lu";
import { useAuth } from "../../hooks/useAuth";
import { useDismiss } from "../../hooks/useDismiss";
import { getInitials } from "../../utils/initials";
import { formatPhone } from "../../utils/phone";
import AccountMenu from "./AccountMenu";

// The signed-in user at the bottom of the sidebar; opens the account menu upwards
const SidebarProfile = ({ mode, iconOnly, onNavigate }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const avatar = (
    <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
      {getInitials(user.name)}
      <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-white" aria-hidden="true" />
    </span>
  );

  return (
    <div ref={ref} className="relative shrink-0 border-t border-slate-200 p-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        title={iconOnly ? user.name : undefined}
        className={`group flex w-full items-center gap-3 rounded-lg text-left outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand/20 ${
          iconOnly ? "justify-center p-1.5" : "p-2"
        } ${open ? "bg-slate-50" : ""}`}
      >
        {avatar}
        {!iconOnly && (
          <>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-semibold text-slate-900">{user.name}</span>
              <span className="mt-0.5 block truncate text-xs text-slate-500">{user.email || formatPhone(user.phone)}</span>
            </span>
            <LuEllipsisVertical className="size-4 shrink-0 text-slate-500 group-hover:text-slate-800" aria-hidden="true" />
          </>
        )}
      </button>

      {open && (
        <AccountMenu
          mode={mode}
          onClose={() => {
            close();
            onNavigate();
          }}
          className={`absolute ${iconOnly ? "bottom-3 left-full ml-2 w-64 origin-bottom-left" : "bottom-full left-3 right-3 mb-2 origin-bottom"}`}
        />
      )}
    </div>
  );
};

export default SidebarProfile;
