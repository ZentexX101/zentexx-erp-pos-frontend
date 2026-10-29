import { useEffect, useState } from "react";
import { LuMaximize, LuMenu, LuMinimize } from "react-icons/lu";
import { Link, NavLink } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { PANELS } from "../../routes/panels";
import { canAccess } from "../../utils/access";
import BrandLogo from "../common/brand/BrandLogo";
import UserMenu from "./UserMenu";

const iconButtonClass =
  "flex size-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900";

const quickLinkClass = ({ isActive }) =>
  `flex h-9 shrink-0 items-center gap-2 rounded-md px-2.5 text-sm font-medium transition-colors ${
    isActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
  }`;

// Top bar: mobile menu button, the panel's shortcut links, full screen and the account menu
const DashboardNav = ({ mode, setSidebarOpen }) => {
  const { user } = useAuth();
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));

  const panel = PANELS[mode];
  const quickLinks = panel.quickLinks.filter((link) => canAccess(user, link));
  // Labels need room: show them from xl, or from 2xl when there are many shortcuts
  const labelClass = quickLinks.length > 6 ? "hidden 2xl:inline" : "hidden xl:inline";

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
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 sm:gap-3 sm:px-6 print:hidden">
      {/* Mobile / tablet: open the drawer and show the logo (desktop collapses from the sidebar edge) */}
      <button type="button" onClick={() => setSidebarOpen(true)} className={`${iconButtonClass} lg:hidden`} aria-label="Open menu">
        <LuMenu className="size-5" aria-hidden="true" />
      </button>
      <Link to={panel.home} className="lg:hidden" aria-label="Dashboard home">
        <BrandLogo className="h-6" />
      </Link>

      {/* Shortcuts (icons only until there's room for labels) */}
      {quickLinks.length > 0 && (
        <>
          <span className="hidden h-6 w-px shrink-0 bg-slate-200 md:block lg:hidden" aria-hidden="true" />
          <nav className="scrollbar-none hidden min-w-0 items-center gap-1 overflow-x-auto md:flex" aria-label="Shortcuts">
            {quickLinks.map((link) => (
              <NavLink key={link.path} to={link.path} title={link.label} className={quickLinkClass}>
                <link.icon className="size-4 shrink-0" aria-hidden="true" />
                <span className={labelClass}>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`${iconButtonClass} hidden sm:flex`}
          aria-label={fullscreen ? "Exit full screen" : "Full screen"}
          title={fullscreen ? "Exit full screen" : "Full screen"}
        >
          {fullscreen ? <LuMinimize className="size-4.5" aria-hidden="true" /> : <LuMaximize className="size-4.5" aria-hidden="true" />}
        </button>
        <span className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />
        <UserMenu mode={mode} />
      </div>
    </header>
  );
};

export default DashboardNav;
