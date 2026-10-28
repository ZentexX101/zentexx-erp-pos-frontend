// Must match USER_ROLES in the backend (src/modules/auth/user.constants.js).
// Owner = super admin. Admin = main admin (all branches, full access).
// Sub admin = works in one branch with the permissions they're given.
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  SUB_ADMIN: "sub_admin",
};

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

// Must match REVIEWER_ROLES in the backend — who can approve / reject registrations
export const REVIEWER_ROLES = ADMIN_ROLES;

// Main admin = an admin not tied to a branch (same rule as the backend's isMainAdmin).
// Everyone with a branch works only inside that branch.
export const isMainAdmin = (user) => Boolean(user) && ADMIN_ROLES.includes(user.role) && !user.branch;

// Types a main admin can give; only the owner can give "admin".
// Must match the backend's staff rules (src/modules/staff/staff.service.js)
export const getAssignableRoles = (actor) => [actor?.role === ROLES.SUPER_ADMIN && ROLES.ADMIN, ROLES.SUB_ADMIN].filter(Boolean);

// The owner manages everyone; an admin manages sub admins only; nobody edits themselves here
export const canManageUser = (actor, target) =>
  actor._id !== target._id && (actor.role === ROLES.SUPER_ADMIN || target.role === ROLES.SUB_ADMIN);

export const USER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Owner",
  [ROLES.ADMIN]: "Admin",
  [ROLES.SUB_ADMIN]: "Sub Admin",
};

// Must match WEEK_DAYS in the backend
export const WEEK_DAYS = [
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
];
