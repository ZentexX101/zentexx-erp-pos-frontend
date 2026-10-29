import { useEffect, useMemo, useState } from "react";
import { LuArrowLeft, LuChevronLeft, LuSearch, LuStore, LuX } from "react-icons/lu";
import { Link, useLocation, useNavigate } from "react-router";
import { isMainAdmin } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useBranch } from "../../hooks/useBranch";
import { PANELS } from "../../routes/panels";
import { canAccess } from "../../utils/access";
import BrandLogo, { BrandMark } from "../common/brand/BrandLogo";
import SidebarMenu from "./SidebarMenu";
import SidebarProfile from "./SidebarProfile";

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

// Desktop: fixed column (icon-only when collapsed). Mobile: slide-in drawer.
const Sidebar = ({ mode, sidebarOpen, setSidebarOpen, collapsed, setCollapsed }) => {
  const { user } = useAuth();
  const { activeBranch, exitBranch } = useBranch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [search, setSearch] = useState("");

  // Collapsing only applies on desktop; the mobile drawer always shows labels
  const iconOnly = collapsed && !sidebarOpen;
  const sections = useMemo(() => filterSections(PANELS[mode].sections, user, search), [mode, user, search]);

  const closeSidebar = () => setSidebarOpen(false);

  // Esc closes the mobile drawer
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e) => e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen, setSidebarOpen]);

  const goToMainAdmin = () => {
    exitBranch();
    closeSidebar();
    navigate(ROUTES.BRANCHES);
  };

  const showBranch = mode === "branch" && activeBranch;

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 animate-fade-in bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-out print:hidden lg:relative lg:max-w-none lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
        } ${iconOnly ? "lg:w-18" : "lg:w-64"}`}
      >
        {/* COLLAPSE TOGGLE (desktop): sits on the sidebar's right border */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={`${collapsed ? "Expand" : "Collapse"} sidebar (Ctrl+B)`}
          className="absolute -right-3 top-5 z-10 hidden size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm outline-none transition-colors hover:border-slate-300 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-brand/20 lg:flex"
        >
          <LuChevronLeft className={`size-3.5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>

        {/* LOGO */}
        <div className={`flex h-16 shrink-0 items-center border-b border-slate-200 ${iconOnly ? "justify-center" : "justify-between pl-5 pr-3"}`}>
          <Link to={PANELS[mode].home} onClick={closeSidebar} aria-label="Dashboard home">
            {iconOnly ? <BrandMark /> : <BrandLogo className="h-7" />}
          </Link>
          {!iconOnly && (
            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close menu"
              className="flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            >
              <LuX className="size-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* BRANCH (branch panel only) */}
        {showBranch &&
          (iconOnly ? (
            <div className="flex flex-col items-center gap-1 border-b border-slate-200 py-3">
              <span title={`Branch: ${activeBranch.name}`} className="flex size-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                <LuStore className="size-4.5" aria-hidden="true" />
              </span>
              {isMainAdmin(user) && (
                <button
                  type="button"
                  onClick={goToMainAdmin}
                  title="Back to main admin"
                  aria-label="Back to main admin"
                  className="flex size-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <LuArrowLeft className="size-4.5" aria-hidden="true" />
                </button>
              )}
            </div>
          ) : (
            <div className="mx-3 mt-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3 p-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <LuStore className="size-4.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Branch</p>
                  <p className="truncate text-sm font-semibold text-slate-900">{activeBranch.name}</p>
                </div>
              </div>
              {isMainAdmin(user) && (
                <button
                  type="button"
                  onClick={goToMainAdmin}
                  className="flex w-full items-center gap-1.5 border-t border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <LuArrowLeft className="size-3.5" aria-hidden="true" />
                  Back to main admin
                </button>
              )}
            </div>
          ))}

        {/* SEARCH */}
        {!iconOnly && (
          <div className="px-3 pt-3">
            <label className="relative block">
              <span className="sr-only">Search menu</span>
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu"
                className="h-9 w-full rounded-md border border-transparent bg-slate-100 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-brand/10"
              />
            </label>
          </div>
        )}

        {/* MENU */}
        <nav className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4" aria-label="Main menu">
          <SidebarMenu sections={sections} iconOnly={iconOnly} searching={Boolean(search)} pathname={pathname} onNavigate={closeSidebar} />
          {sections.length === 0 && <p className="px-3 pt-6 text-center text-sm text-slate-500">No menu matches "{search}"</p>}
        </nav>

        {/* PROFILE */}
        <SidebarProfile mode={mode} iconOnly={iconOnly} onNavigate={closeSidebar} />
      </aside>
    </>
  );
};

export default Sidebar;
