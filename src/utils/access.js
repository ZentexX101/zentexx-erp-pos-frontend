import { isMainAdmin } from "../constants/roles";

// Same rule as the backend's requirePermission: main admins can do everything,
// others need the permission key (e.g. "purchase.view") the owner gave them
export const hasPermission = (user, permission) => isMainAdmin(user) || Boolean(user?.permissions?.includes(permission));

// A nav item / page can be limited by role (roles), permission key (permission), and to branch staff
// (staffOnly: their own attendance and leave, which main admins don't have)
export const canAccess = (user, { roles, permission, staffOnly } = {}) =>
  (!roles || roles.includes(user?.role)) && (!permission || hasPermission(user, permission)) && (!staffOnly || !isMainAdmin(user));
