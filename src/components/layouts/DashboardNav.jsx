import { useEffect, useState } from "react";
import { LuMaximize, LuMenu, LuMinimize, LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { NavLink } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { PANELS } from "../../routes/panels";
import { canAccess } from "../../utils/access";
import { getInitials } from "../../utils/initials";
import { formatPhone } from "../../utils/phone";

const iconButtonClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900";

// Top bar: sidebar toggle, the panel's shortcut links, full screen and the user
const DashboardNav = ({ mode, collapsed, setCollapsed, setSidebarOpen }) => {
  const { user } = useAuth();
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));

  const quickLinks = PANELS[mode].quickLinks.filter((link) => canAccess(user, link));

  // Keep the icon right when full screen is left with Esc
  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Mobile: open the drawer. Desktop: collapse / expand the sidebar */}
      <button type="button" onClick={() => setSidebarOpen(true)} className={`${iconButtonClass} lg:hidden`} aria-label="Open menu">
        <LuMenu className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className={`${iconButtonClass} hidden lg:flex`}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <LuPanelLeftOpen className="h-5 w-5" aria-hidden="true" /> : <LuPanelLeftClose className="h-5 w-5" aria-hidden="true" />}
      </button>

      {/* Shortcuts */}
      {quickLinks.length > 0 && (
        <nav className="hidden min-w-0 items-center gap-2 overflow-x-auto border-l border-slate-200 pl-3 md:flex" aria-label="Shortcuts">
          {quickLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex shrink-0 flex-col items-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                  isActive
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <link.icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={toggleFullscreen}
          className={iconButtonClass}
          aria-label={fullscreen ? "Exit full screen" : "Full screen"}
        >
          {fullscreen ? <LuMinimize className="h-5 w-5" aria-hidden="true" /> : <LuMaximize className="h-5 w-5" aria-hidden="true" />}
        </button>

        <div className="hidden items-center gap-2.5 border-l border-slate-200 pl-3 sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {getInitials(user.name)}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{formatPhone(user.phone)}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNav;
