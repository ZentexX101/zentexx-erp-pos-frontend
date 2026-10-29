import { Route, Routes } from "react-router";
import AuthLayout from "../components/layouts/AuthLayout";
import DashboardLayout from "../components/layouts/DashboardLayout";
import MainLayout from "../components/layouts/MainLayout";
import { ROUTES } from "../constants/routes";
import ChangePassword from "../pages/auth/ChangePassword";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import NoBranch from "../pages/auth/NoBranch";
import ComingSoon from "../pages/ComingSoon";
import NotFound from "../pages/NotFound";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Home from "../pages/public/Home";
import AccessRoute from "./AccessRoute";
import BranchRoute from "./BranchRoute";
import GuestRoute from "./GuestRoute";
import MainAdminRoute from "./MainAdminRoute";
import { BRANCH_PANEL, getPanelPages, MAIN_PANEL } from "./panels";
import RoleBasedRoute from "./RoleBasedRoute";

// Routes for every page in a panel's menu config (routes/panels.js)
const renderPanelPages = (panel) =>
  getPanelPages(panel).map((page) => {
    const Page = page.page;
    return (
      <Route
        key={page.path}
        index={page.path === panel.home}
        path={page.path === panel.home ? undefined : page.path}
        element={
          <AccessRoute page={page} fallback={panel.home}>
            {Page ? <Page /> : <ComingSoon title={page.label} />}
          </AccessRoute>
        }
      />
    );
  });

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* Only for logged-out users */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>

      {/* Logged-in users */}
      <Route element={<RoleBasedRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="no-branch" element={<NoBranch />} />
        </Route>

        {/* Main admin panel: admins not tied to a branch */}
        <Route element={<MainAdminRoute />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardLayout mode="main" />}>
            {renderPanelPages(MAIN_PANEL)}
            <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />
          </Route>
        </Route>

        {/* Branch panel: branch staff, or a main admin who entered a branch */}
        <Route element={<BranchRoute />}>
          <Route path={ROUTES.BRANCH_HOME} element={<DashboardLayout mode="branch" />}>
            {renderPanelPages(BRANCH_PANEL)}
            <Route path={ROUTES.BRANCH_CHANGE_PASSWORD} element={<ChangePassword />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
