import { isMainAdmin } from "../constants/roles";

// Same rule as the backend's requirePermission: main admins can do everything,
// others need the permission key (e.g. "purchase.view") the owner gave them
export const hasPermission = (user, permission) => isMainAdmin(user) || Boolean(user?.permissions?.includes(permission));

// A nav item / page can be limited by role (roles) and / or permission key (permission)
export const canAccess = (user, { roles, permission } = {}) =>
  (!roles || roles.includes(user?.role)) && (!permission || hasPermission(user, permission));
