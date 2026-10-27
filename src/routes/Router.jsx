import { Route, Routes } from "react-router";
import AuthLayout from "../components/layouts/AuthLayout";
import DashboardLayout from "../components/layouts/DashboardLayout";
import MainLayout from "../components/layouts/MainLayout";
import { REVIEWER_ROLES } from "../constants/roles";
import ChangePassword from "../pages/auth/ChangePassword";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import NoBranch from "../pages/auth/NoBranch";
import Register from "../pages/auth/Register";
import BranchHome from "../pages/branch/BranchHome";
import Branches from "../pages/branch/Branches";
import DashboardHome from "../pages/dashboard/DashboardHome";
import Registrations from "../pages/dashboard/Registrations";
import Staff from "../pages/staff/Staff";
import NotFound from "../pages/NotFound";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Home from "../pages/public/Home";
import BranchRoute from "./BranchRoute";
import GuestRoute from "./GuestRoute";
import MainAdminRoute from "./MainAdminRoute";
import RoleBasedRoute from "./RoleBasedRoute";

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
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>

      {/* Logged-in users; nest <RoleBasedRoute allowedRoles={[...]} /> for role-only pages */}
      <Route element={<RoleBasedRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="no-branch" element={<NoBranch />} />
        </Route>

        {/* Main admin panel: admins not tied to a branch */}
        <Route element={<MainAdminRoute />}>
          <Route path="dashboard" element={<DashboardLayout mode="main" />}>
            <Route index element={<DashboardHome />} />
            <Route path="branches" element={<Branches />} />
            <Route path="staff" element={<Staff />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route element={<RoleBasedRoute allowedRoles={REVIEWER_ROLES} />}>
              <Route path="registrations" element={<Registrations />} />
            </Route>
          </Route>
        </Route>

        {/* Branch panel: branch staff, or a main admin who entered a branch */}
        <Route element={<BranchRoute />}>
          <Route path="branch" element={<DashboardLayout mode="branch" />}>
            <Route index element={<BranchHome />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
