import { useState } from "react";
import { Outlet } from "react-router";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { PANELS } from "../../routes/panels";
import Sidebar from "./Sidebar";
import DashboardNav from "./DashboardNav";

const COLLAPSED_KEY = "sidebar-collapsed";

// Storage can be blocked (private mode etc.); the sidebar then just starts expanded
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
};

const saveCollapsed = (value) => {
  try {
    localStorage.setItem(COLLAPSED_KEY, String(value));
  } catch {
    // not saved, fine
  }
};

// mode: "main" (main admin panel) or "branch" (inside one branch); the menu comes from routes/panels.js
const DashboardLayout = ({ mode = "main" }) => {
  const panel = PANELS[mode];
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Collapsing to icons is a desktop thing; on small screens the sidebar is a full drawer
  const compact = isDesktop && collapsed;

  const setCollapsedSaved = (value) => {
    setCollapsed(value);
    saveCollapsed(value);
  };

  const toggleSidebar = () => (isDesktop ? setCollapsedSaved(!collapsed) : setMobileOpen(true));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        panel={panel}
        mode={mode}
        compact={compact}
        mobileOpen={mobileOpen}
        onExpand={() => setCollapsedSaved(false)}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardNav quickLinks={panel.quickLinks} compact={compact} onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
