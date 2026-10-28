import { useState } from "react";
import { Outlet } from "react-router";
import DashboardNav from "./DashboardNav";
import Sidebar from "./Sidebar";

// mode: "main" (main admin panel) or "branch" (inside one branch)
const DashboardLayout = ({ mode = "main" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop icon-only sidebar

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 print:block print:h-auto print:overflow-visible print:bg-white">
      <Sidebar mode={mode} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} collapsed={collapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardNav mode={mode} collapsed={collapsed} setCollapsed={setCollapsed} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 print:overflow-visible print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
