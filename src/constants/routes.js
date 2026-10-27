import { isMainAdmin } from "./roles";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  NO_BRANCH: "/no-branch",

  // Main admin panel
  DASHBOARD: "/dashboard",
  BRANCHES: "/dashboard/branches",
  STAFF: "/dashboard/staff",
  REGISTRATIONS: "/dashboard/registrations",
  CHANGE_PASSWORD: "/dashboard/change-password",

  // Branch panel (a branch's own staff, or a main admin who entered the branch)
  BRANCH_HOME: "/branch",
  BRANCH_CHANGE_PASSWORD: "/branch/change-password",

  NOT_FOUND: "*",
};

// Where a user lands after logging in
export const getHomePath = (user) => {
  if (isMainAdmin(user)) return ROUTES.DASHBOARD;
  if (user?.branch) return ROUTES.BRANCH_HOME;
  return ROUTES.NO_BRANCH;
};
