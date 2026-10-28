import { useEffect, useMemo, useRef, useState } from "react";
import { LuArrowLeft, LuChevronDown, LuEllipsis, LuKeyRound, LuLogOut, LuSearch, LuStore, LuX } from "react-icons/lu";
import { Link, matchPath, NavLink, useLocation, useNavigate } from "react-router";
import { isMainAdmin, ROLE_LABELS } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useBranch } from "../../hooks/useBranch";
import { canAccess } from "../../utils/access";
import { getInitials } from "../../utils/initials";

// ---------- helpers ----------

// Menu items the user may see that match the search text (a parent match keeps all its pages)
const filterSections = (sections, user, query) => {
  const text = query.trim().toLowerCase();
  const matches = (label) => !text || label.toLowerCase().includes(text);

  return sections
    .map((section) => ({
      ...section,
      items: section.items.flatMap((item) => {
        if (!canAccess(user, item)) return [];
        if (!item.children) return matches(item.label) ? [item] : [];

        const children = item.children.filter((child) => canAccess(user, child));
        const shown = matches(item.label) ? children : children.filter((child) => matches(child.label));
        return shown.length ? [{ ...item, children: shown }] : [];
      }),
    }))
    .filter((section) => section.items.length > 0);
};

const isGroupActive = (item, pathname) =>
  item.children.some((child) => matchPath({ path: child.path, end: false }, pathname));

const itemClass = (active, compact) =>
  [
    "group flex w-full items-center rounded-lg text-sm font-medium transition-colors",
    compact ? "h-10 justify-center" : "gap-3 px-3 py-2",
    active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

const subItemClass = ({ isActive }) =>
  `-ml-px block border-l-2 py-1.5 pl-4 pr-3 text-sm transition-colors ${
    isActive
      ? "border-indigo-500 font-medium text-indigo-700"
      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
  }`;

const flyoutItemClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? "bg-indigo-50 font-medium text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const menuItemClass = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:opacity-60";

// ---------- small parts ----------

const Logo = () => (
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white shadow-sm">
    Z
  </span>
);

const ItemIcon = ({ icon, active }) => {
  const Icon = icon;
  return (
    <Icon
      aria-hidden="true"
      className={`h-5 w-5 shrink-0 transition-colors ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
    />
  );
};

// Collapsed sidebar: a tooltip or sub menu beside the trigger on hover / keyboard focus.
// Fixed-positioned so the scrolling menu doesn't clip it.
//   tooltip: text to show     menu: (close) => sub menu content
const Flyout = ({ tooltip, menu, children }) => {
  const triggerRef = useRef(null);
  const [rect, setRect] = useState(null);

  const show = () => setRect(triggerRef.current.getBoundingClientRect());
  const hide = () => setRect(null);

  // Tooltips sit centred beside the trigger, menus start at its top
  const position = tooltip
    ? { top: rect?.top + rect?.height / 2, left: rect?.right, transform: "translateY(-50%)" }
    : { top: rect?.top, left: rect?.right };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && hide()}
      onKeyDown={(e) => e.key === "Escape" && hide()}
    >
      {children}

      {/* pl-3 leaves a gap the pointer can cross without closing it */}
      {rect && (
        <div className="fixed z-50 animate-fade-in pl-3" style={position}>
          {tooltip ? (
            <span className="block whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
              {tooltip}
            </span>
          ) : (
            menu(hide)
          )}
        </div>
      )}
    </div>
  );
};

// ---------- menu items ----------

// A single page link
const NavItem = ({ item, compact, onNavigate }) => {
  const link = (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      aria-label={compact ? item.label : undefined}
      className={({ isActive }) => itemClass(isActive, compact)}
    >
      {({ isActive }) => (
        <>
          <ItemIcon icon={item.icon} active={isActive} />
          {!compact && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );

  return compact ? <Flyout tooltip={item.label}>{link}</Flyout> : link;
};

// A dropdown of pages. Collapsed sidebar: the pages open in a flyout on hover instead.
const NavGroup = ({ item, compact, open, onToggle, onNavigate }) => {
  const { pathname } = useLocation();
  const active = isGroupActive(item, pathname);

  if (compact) {
    return (
      <Flyout
        menu={(close) => (
          <div className="w-52 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200">
            <p className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
            {item.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                end
                onClick={() => {
                  close();
                  onNavigate();
                }}
                className={flyoutItemClass}
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      >
        <button type="button" aria-label={item.label} aria-haspopup="menu" className={itemClass(active, true)}>
          <ItemIcon icon={item.icon} active={active} />
        </button>
      </Flyout>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`${itemClass(false, false)} ${open ? "bg-slate-100 text-slate-900" : ""}`}
      >
        <ItemIcon icon={item.icon} active={active} />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <LuChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* grid-rows 0fr -> 1fr animates the height */}
      <div className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="min-h-0 overflow-hidden" inert={!open}>
          <ul className="my-1 ml-[1.375rem] border-l border-slate-200">
            {item.children.map((child) => (
              <li key={child.path}>
                <NavLink to={child.path} end onClick={onNavigate} className={subItemClass}>
                  {child.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ---------- branch card ----------

// Branch name and "Go to Main Admin" (main admins only) in the branch panel
const BranchCard = ({ compact, onNavigate }) => {
  const { user } = useAuth();
  const { activeBranch, exitBranch } = useBranch();
  const navigate = useNavigate();
  const mainAdmin = isMainAdmin(user);

  const goToMainAdmin = () => {
    exitBranch();
    onNavigate();
    navigate(ROUTES.BRANCHES);
  };

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 border-b border-slate-200 py-3">
        <Flyout tooltip={`Branch: ${activeBranch.name}`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <LuStore className="h-5 w-5" aria-hidden="true" />
          </span>
        </Flyout>
        {mainAdmin && (
          <Flyout tooltip="Go to Main Admin">
            <button
              type="button"
              onClick={goToMainAdmin}
              aria-label="Go to Main Admin"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <LuArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          </Flyout>
        )}
      </div>
    );
  }

  return (
    <div className="mx-3 mt-3 rounded-xl bg-indigo-50/70 p-3 ring-1 ring-indigo-100">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">Branch</p>
      <p className="truncate text-sm font-semibold text-slate-900">{activeBranch.name}</p>
      {mainAdmin && (
        <button
          type="button"
          onClick={goToMainAdmin}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
        >
          <LuArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Go to Main Admin
        </button>
      )}
    </div>
  );
};

// ---------- profile ----------

// Logged-in user at the bottom, with the account menu
const Profile = ({ compact, changePasswordPath }) => {
  const { user, logout, logoutAll } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click or Escape
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

  const menuButtonProps = {
    type: "button",
    onClick: () => setOpen((v) => !v),
    "aria-label": "Account options",
    "aria-expanded": open,
    "aria-haspopup": "menu",
  };

  const avatar = (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
      {getInitials(user.name)}
    </span>
  );

  return (
    <div ref={menuRef} className="relative border-t border-slate-200 p-3">
      {compact ? (
        <button {...menuButtonProps} className="mx-auto block rounded-full ring-offset-2 hover:ring-2 hover:ring-indigo-200">
          {avatar}
        </button>
      ) : (
        <div className="flex items-center gap-3 px-1">
          {avatar}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">
              {ROLE_LABELS[user.role] || user.role}
              {user.branch && ` · ${user.branch.name}`}
            </p>
          </div>
          <button {...menuButtonProps} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <LuEllipsis className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}

      {open && (
        <div
          role="menu"
          className={`absolute z-50 animate-fade-in rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 ${
            compact ? "bottom-3 left-full ml-2 w-56" : "bottom-full left-3 right-3 mb-2"
          }`}
        >
          <Link
            role="menuitem"
            to={changePasswordPath}
            onClick={() => setOpen(false)}
            className={`${menuItemClass} text-slate-700 hover:bg-slate-100`}
          >
            <LuKeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Change password
          </Link>
          <button
            role="menuitem"
            type="button"
            disabled={loggingOut}
            onClick={() => handleLogout(logout)}
            className={`${menuItemClass} text-slate-700 hover:bg-slate-100`}
          >
            <LuLogOut className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Log out
          </button>
          <button
            role="menuitem"
            type="button"
            disabled={loggingOut}
            onClick={() => handleLogout(logoutAll)}
            className={`${menuItemClass} text-red-600 hover:bg-red-50`}
          >
            <LuLogOut className="h-4 w-4" aria-hidden="true" />
            Log out from all devices
          </button>
        </div>
      )}
    </div>
  );
};

// ---------- sidebar ----------

// The menu comes from the panel config (routes/panels.js).
// compact: collapsed to icons (desktop only). mobileOpen: shown as a drawer on small screens.
const Sidebar = ({ panel, mode, compact, mobileOpen, onExpand, onClose }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const focusSearchOnExpand = useRef(false);

  const sections = useMemo(() => filterSections(panel.sections, user, query), [panel, user, query]);

  // One dropdown open at a time; the current page's dropdown opens after navigating
  const activeGroup =
    panel.sections.flatMap((section) => section.items).find((item) => item.children && isGroupActive(item, pathname))?.label ??
    null;
  const [openGroup, setOpenGroup] = useState(activeGroup);
  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [activeGroup]);

  // The collapsed search button expands the sidebar, then focuses the search field
  useEffect(() => {
    if (!compact && focusSearchOnExpand.current) {
      focusSearchOnExpand.current = false;
      searchRef.current?.focus();
    }
  }, [compact]);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 animate-fade-in bg-slate-900/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white transition-[width,transform] duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          compact ? "lg:w-[76px]" : "lg:w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div className={`flex h-16 shrink-0 items-center border-b border-slate-200 ${compact ? "justify-center" : "gap-3 px-5"}`}>
          {compact ? (
            <Flyout tooltip="Expand sidebar">
              <button type="button" onClick={onExpand} aria-label="Expand sidebar" className="block">
                <Logo />
              </button>
            </Flyout>
          ) : (
            <>
              <Logo />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold tracking-wide text-slate-900">ZENTEXX ERP</p>
                <p className="truncate text-xs text-slate-500">POS & Inventory</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
              >
                <LuX className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {mode === "branch" && <BranchCard compact={compact} onNavigate={onClose} />}

        {/* Search */}
        <div className={compact ? "flex justify-center pt-3" : "px-3 pt-3"}>
          {compact ? (
            <Flyout tooltip="Search menu">
              <button
                type="button"
                aria-label="Search menu"
                onClick={() => {
                  focusSearchOnExpand.current = true;
                  onExpand();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <LuSearch className="h-5 w-5" aria-hidden="true" />
              </button>
            </Flyout>
          ) : (
            <label className="relative block">
              <span className="sr-only">Search menu</span>
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setQuery("")}
                placeholder="Search menu..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4" aria-label="Main menu">
          {sections.map((section) => (
            <div key={section.title}>
              {compact ? (
                <div className="mx-auto my-3 h-px w-6 bg-slate-200" aria-hidden="true" />
              ) : (
                <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{section.title}</p>
              )}
              <div className="space-y-1">
                {section.items.map((item) =>
                  item.children ? (
                    <NavGroup
                      key={item.label}
                      item={item}
                      compact={compact}
                      open={Boolean(query) || openGroup === item.label}
                      onToggle={() => setOpenGroup((current) => (current === item.label ? null : item.label))}
                      onNavigate={onClose}
                    />
                  ) : (
                    <NavItem key={item.label} item={item} compact={compact} onNavigate={onClose} />
                  )
                )}
              </div>
            </div>
          ))}

          {sections.length === 0 && <p className="px-3 pt-6 text-center text-sm text-slate-500">No menu matches "{query}"</p>}
        </nav>

        <Profile compact={compact} changePasswordPath={mode === "branch" ? ROUTES.BRANCH_CHANGE_PASSWORD : ROUTES.CHANGE_PASSWORD} />
      </aside>
    </>
  );
};

export default Sidebar;
