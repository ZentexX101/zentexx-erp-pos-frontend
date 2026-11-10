import { useEffect, useState } from "react";
import { LuMaximize, LuMenu, LuMinimize } from "react-icons/lu";
import { Link, NavLink } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { PANELS } from "../../routes/panels";
import { canAccess } from "../../utils/access";
import BrandLogo from "../common/brand/BrandLogo";
import BackToAdminButton from "./BackToAdminButton";
import UserMenu from "./UserMenu";

const iconButtonClass =
  "flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900";

// Shortcuts sit in one soft segmented bar; the current page is the raised white pill
const quickLinkClass = ({ isActive }) =>
  `flex h-8 shrink-0 items-center gap-2 rounded-lg px-2.5 text-sm font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-brand/20 ${
    isActive ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/70 hover:text-slate-900"
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
    // relative z-20: the blur makes the header its own layer, so it must sit above the page for its menus to show on top
    <header className="relative z-20 flex h-16 shrink-0 items-center gap-2 border-b border-slate-200/80 bg-white/90 px-3 backdrop-blur sm:gap-3 sm:px-6 print:hidden">
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
          <nav className="scrollbar-none hidden min-w-0 items-center gap-0.5 overflow-x-auto rounded-xl bg-slate-100/80 p-1 md:flex" aria-label="Shortcuts">
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
        <BackToAdminButton />
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
