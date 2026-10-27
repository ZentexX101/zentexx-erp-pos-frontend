// Must match USER_ROLES in the backend (src/modules/auth/user.constants.js)
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
};

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

// Must match REVIEWER_ROLES in the backend — who can approve / reject registrations
export const REVIEWER_ROLES = ADMIN_ROLES;

// Main admin = an admin not tied to a branch (same rule as the backend's isMainAdmin).
// Everyone with a branch works only inside that branch.
export const isMainAdmin = (user) => Boolean(user) && ADMIN_ROLES.includes(user.role) && !user.branch;

// Roles a main admin can give; only the owner (super admin) can give "admin".
// Must match the backend's staff rules (src/modules/staff/staff.service.js)
export const getAssignableRoles = (actor) =>
  [actor?.role === ROLES.SUPER_ADMIN && ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF].filter(Boolean);

// The owner manages everyone; an admin manages managers and staff only; nobody edits themselves here
export const canManageUser = (actor, target) =>
  actor._id !== target._id && (actor.role === ROLES.SUPER_ADMIN || [ROLES.MANAGER, ROLES.STAFF].includes(target.role));

export const USER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Admin",
  [ROLES.MANAGER]: "Manager",
  [ROLES.STAFF]: "Staff",
};
