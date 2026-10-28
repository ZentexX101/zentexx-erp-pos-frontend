import { useEffect, useMemo, useRef, useState } from "react";
import { LuArrowLeft, LuChevronDown, LuEllipsis, LuKeyRound, LuLogOut, LuSearch, LuStore, LuX } from "react-icons/lu";
import { Link, matchPath, NavLink, useLocation, useNavigate } from "react-router";
import { isMainAdmin, ROLE_LABELS } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useBranch } from "../../hooks/useBranch";
import { PANELS } from "../../routes/panels";
import { canAccess } from "../../utils/access";
import { getInitials } from "../../utils/initials";

// Menu items the user may see that match the search text (a parent match keeps all its pages)
const filterSections = (sections, user, search) => {
  const text = search.trim().toLowerCase();
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

const itemClass = (active, iconOnly) =>
  `group flex w-full items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors ${
    iconOnly ? "justify-center px-0" : "px-3"
  } ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`;

const iconClass = (active) =>
  `h-5 w-5 shrink-0 ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`;

const subItemClass = ({ isActive }) =>
  `-ml-px block border-l-2 py-1.5 pl-4 pr-3 text-sm transition-colors ${
    isActive
      ? "border-indigo-500 font-medium text-indigo-700"
      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
  }`;

const menuItemClass = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:opacity-60";

// The menu comes from the panel config (routes/panels.js)
const Sidebar = ({ mode, sidebarOpen, setSidebarOpen, collapsed }) => {
  const { user, logout, logoutAll } = useAuth();
  const { activeBranch, exitBranch } = useBranch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState({});
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileMenuRef = useRef(null);

  // Collapsing only applies on desktop; the mobile drawer always shows labels
  const iconOnly = collapsed && !sidebarOpen;
  const sections = useMemo(() => filterSections(PANELS[mode].sections, user, search), [mode, user, search]);

  const isGroupActive = (item) => item.children.some((child) => matchPath({ path: child.path, end: false }, pathname));
  // A dropdown starts open when it holds the current page; searching opens all of them
  const isGroupOpen = (item) => Boolean(search) || (openGroups[item.label] ?? isGroupActive(item));

  const closeSidebar = () => setSidebarOpen(false);

  // Close the profile menu on outside click or Escape
  useEffect(() => {
    if (!profileMenuOpen) return;
    const close = (e) => {
      if (e.type === "keydown" ? e.key === "Escape" : !profileMenuRef.current?.contains(e.target)) setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [profileMenuOpen]);

  const goToMainAdmin = () => {
    exitBranch();
    closeSidebar();
    navigate(ROUTES.BRANCHES);
  };

  // RoleBasedRoute redirects to login once user is cleared
  const handleLogout = async (action) => {
    setLoggingOut(true);
    await action();
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={closeSidebar} aria-hidden="true" />}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${iconOnly ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* LOGO */}
        <div className={`flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 ${iconOnly ? "justify-center" : "px-5"}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">Z</span>
          {!iconOnly && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold tracking-wide text-slate-900">ZENTEXX ERP</p>
                <p className="truncate text-xs text-slate-500">POS & Inventory</p>
              </div>
              <button type="button" onClick={closeSidebar} aria-label="Close menu" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden">
                <LuX className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* BRANCH (branch panel only) */}
        {mode === "branch" && activeBranch && (
          iconOnly ? (
            <div className="flex flex-col items-center gap-1 border-b border-slate-200 py-3">
              <span title={`Branch: ${activeBranch.name}`} className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <LuStore className="h-5 w-5" aria-hidden="true" />
              </span>
              {isMainAdmin(user) && (
                <button
                  type="button"
                  onClick={goToMainAdmin}
                  title="Go to Main Admin"
                  aria-label="Go to Main Admin"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <LuArrowLeft className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
          ) : (
            <div className="mx-3 mt-3 rounded-xl bg-indigo-50/70 p-3 ring-1 ring-indigo-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">Branch</p>
              <p className="truncate text-sm font-semibold text-slate-900">{activeBranch.name}</p>
              {isMainAdmin(user) && (
                <button
                  type="button"
                  onClick={goToMainAdmin}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  <LuArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Go to Main Admin
                </button>
              )}
            </div>
          )
        )}

        {/* SEARCH */}
        {!iconOnly && (
          <div className="px-3 pt-3">
            <label className="relative block">
              <span className="sr-only">Search menu</span>
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>
        )}

        {/* MENU SECTIONS */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4" aria-label="Main menu">
          {sections.map((section) => (
            <div key={section.title}>
              {iconOnly ? (
                <div className="mx-auto my-3 h-px w-6 bg-slate-200" aria-hidden="true" />
              ) : (
                <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{section.title}</p>
              )}

              <ul className="space-y-1">
                {section.items.map((item) => {
                  // Single page
                  if (!item.children) {
                    return (
                      <li key={item.label}>
                        <NavLink
                          to={item.path}
                          end={item.end}
                          onClick={closeSidebar}
                          title={iconOnly ? item.label : undefined}
                          className={({ isActive }) => itemClass(isActive, iconOnly)}
                        >
                          {({ isActive }) => (
                            <>
                              <item.icon className={iconClass(isActive)} aria-hidden="true" />
                              {!iconOnly && <span className="truncate">{item.label}</span>}
                            </>
                          )}
                        </NavLink>
                      </li>
                    );
                  }

                  // Dropdown. Icon-only: the icon opens the first page.
                  const active = isGroupActive(item);
                  const open = isGroupOpen(item);

                  if (iconOnly) {
                    return (
                      <li key={item.label}>
                        <NavLink to={item.children[0].path} title={item.label} className={itemClass(active, true)}>
                          <item.icon className={iconClass(active)} aria-hidden="true" />
                        </NavLink>
                      </li>
                    );
                  }

                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => setOpenGroups((prev) => ({ ...prev, [item.label]: !open }))}
                        aria-expanded={open}
                        className={`${itemClass(false, false)} ${open ? "bg-slate-100 text-slate-900" : ""}`}
                      >
                        <item.icon className={iconClass(active)} aria-hidden="true" />
                        <span className="flex-1 truncate text-left">{item.label}</span>
                        <LuChevronDown
                          aria-hidden="true"
                          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        />
                      </button>

                      {open && (
                        <ul className="my-1 ml-[1.375rem] border-l border-slate-200">
                          {item.children.map((child) => (
                            <li key={child.path}>
                              <NavLink to={child.path} end onClick={closeSidebar} className={subItemClass}>
                                {child.label}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {sections.length === 0 && <p className="px-3 pt-6 text-center text-sm text-slate-500">No menu matches "{search}"</p>}
        </nav>

        {/* PROFILE */}
        <div ref={profileMenuRef} className="relative border-t border-slate-200 p-3">
          <div className={`flex items-center gap-3 ${iconOnly ? "justify-center" : "px-1"}`}>
            <button
              type="button"
              onClick={() => iconOnly && setProfileMenuOpen((prev) => !prev)}
              title={iconOnly ? user.name : undefined}
              aria-label={iconOnly ? "Account options" : undefined}
              tabIndex={iconOnly ? 0 : -1}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white"
            >
              {getInitials(user.name)}
            </button>

            {!iconOnly && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {ROLE_LABELS[user.role] || user.role}
                    {user.branch && ` · ${user.branch.name}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-label="Account options"
                  aria-expanded={profileMenuOpen}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <LuEllipsis className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          {profileMenuOpen && (
            <div
              role="menu"
              className={`absolute z-50 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 ${
                iconOnly ? "bottom-3 left-full ml-2 w-56" : "bottom-full left-3 right-3 mb-2"
              }`}
            >
              <Link
                role="menuitem"
                to={mode === "branch" ? ROUTES.BRANCH_CHANGE_PASSWORD : ROUTES.CHANGE_PASSWORD}
                onClick={() => {
                  setProfileMenuOpen(false);
                  closeSidebar();
                }}
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
      </aside>
    </>
  );
};

export default Sidebar;
