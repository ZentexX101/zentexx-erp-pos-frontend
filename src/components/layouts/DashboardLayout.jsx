import { useState } from "react";
import { Outlet } from "react-router";
import { ROUTES } from "../../constants/routes";
import Sidebar from "./Sidebar";
import UserMenu from "./UserMenu";

// mode: "main" (main admin panel) or "branch" (inside one branch)
const DashboardLayout = ({ mode = "main" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar mode={mode} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-auto">
            <UserMenu changePasswordPath={mode === "branch" ? ROUTES.BRANCH_CHANGE_PASSWORD : ROUTES.CHANGE_PASSWORD} />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
